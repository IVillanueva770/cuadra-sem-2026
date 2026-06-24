/**
 * seed-refresh.mjs — Mantiene viva y fresca la demo de Cuadra.
 *
 * Node puro (fetch nativo, sin dependencias) → corre en cualquier lado sin
 * `pnpm install` (clave para la GitHub Action que mantiene el proyecto Supabase
 * activo y los datos siempre recientes).
 *
 * Qué hace, de forma IDEMPOTENTE:
 *   1. Para cada uno de los últimos DIAS días (relativo a hoy, UTC; salta domingos):
 *        a. borra las parking_sessions de ese día (no acumula),
 *        b. asegura las asignaciones diarias (upsert),
 *        c. genera sesiones realistas del día (70% digital / 30% efectivo,
 *           85% autos / 15% motos, picos de horario, montos según tarifa real),
 *        d. recalcula metricas_diarias del día vía RPC.
 *   2. Las sesiones de HOY cuya ventana cubre el momento actual quedan 'active'
 *      (autos estacionados ahora). El resto 'expired'.
 *
 * Doble función: la escritura mantiene el proyecto Supabase activo (no se pausa)
 * y la ventana de datos siempre termina en hoy (el dashboard mira "últimos 30 días").
 *
 * Uso:
 *   node scripts/seed-refresh.mjs            → últimos 8 días (default, para el robot)
 *   node scripts/seed-refresh.mjs 24         → últimos 24 días (poblado inicial)
 *
 * Env requeridas: NEXT_PUBLIC_SUPABASE_URL (o SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DIAS = parseInt(process.argv[2] || process.env.DIAS || '8', 10);

if (!URL || !KEY) {
  console.error('❌ Faltan NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const H = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

async function rest(path, { method = 'GET', body, prefer } = {}) {
  const headers = { ...H };
  if (prefer) headers.Prefer = prefer;
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${method} ${path} -> ${res.status} ${t}`);
  }
  const txt = await res.text();
  return txt ? JSON.parse(txt) : null;
}

// --- generadores ---
let patenteSeq = 0;
function randomPatente(unica = false) {
  const formatos = ['ABC', 'DEF', 'GHI', 'JKL', 'AB', 'CD'];
  const sufijos = ['XY', 'ZX', 'YZ'];
  const prefix = formatos[Math.floor(Math.random() * formatos.length)];
  const num = 100 + Math.floor(Math.random() * 900);
  const suf = sufijos[Math.floor(Math.random() * sufijos.length)];
  const base = `${prefix}${num}${suf}`;
  // Las 'active' deben ser únicas (idx_parking_sessions_patente_active es UNIQUE).
  return unica ? `${base}${(++patenteSeq).toString(36).toUpperCase()}` : base;
}

const DURACIONES = [60, 60, 60, 90, 120, 75];

function montoDe(tipoVehiculo, duracionMin, esDigital) {
  const tarifaHora = tipoVehiculo === 'auto' ? 700 : 300;
  const fraccion15 = tipoVehiculo === 'auto' ? 175 : 75;
  let base = tarifaHora;
  if (duracionMin > 60) base += Math.ceil((duracionMin - 60) / 15) * fraccion15;
  const final = esDigital ? Math.round(base * 0.8) : base;
  return { base, final };
}

async function main() {
  console.log(`🌱 seed-refresh — últimos ${DIAS} días (UTC)`);

  const permis = await rest('permisionarios?select=id&estado=eq.activo');
  const cuadras = await rest('cuadras_habilitadas?select=id&habilitada_diurno=eq.true');
  if (!permis?.length || !cuadras?.length) throw new Error('No hay permisionarios activos o cuadras diurnas');
  console.log(`Permisionarios activos: ${permis.length}, cuadras diurnas: ${cuadras.length}`);

  const ahora = new Date();
  const hoyUTC = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()));

  const fechasTocadas = [];
  let totalSesiones = 0;

  for (let diasAtras = DIAS - 1; diasAtras >= 0; diasAtras--) {
    const fecha = new Date(hoyUTC);
    fecha.setUTCDate(fecha.getUTCDate() - diasAtras);
    if (fecha.getUTCDay() === 0) continue; // domingo: sin turno diurno
    const fechaStr = fecha.toISOString().slice(0, 10);
    fechasTocadas.push(fechaStr);

    // a. borrar sesiones del día (idempotencia)
    const sig = new Date(fecha);
    sig.setUTCDate(sig.getUTCDate() + 1);
    await rest(
      `parking_sessions?iniciada_a=gte.${fechaStr}T00:00:00Z&iniciada_a=lt.${sig.toISOString().slice(0, 10)}T00:00:00Z`,
      { method: 'DELETE' },
    );

    // b. asignaciones del día (upsert) + traer ids
    const asignacionesPayload = permis.map((p, idx) => ({
      permisionario_id: p.id,
      cuadra_id: cuadras[idx % cuadras.length].id,
      fecha: fechaStr,
      turno: 'diurno',
      hora_inicio_real: new Date(fecha.getTime() + 10 * 3600 * 1000).toISOString(),
      hora_fin_real: new Date(fecha.getTime() + 24 * 3600 * 1000).toISOString(),
    }));
    const asignaciones = await rest(
      'asignaciones_diarias?on_conflict=permisionario_id,fecha,turno',
      { method: 'POST', body: asignacionesPayload, prefer: 'resolution=merge-duplicates,return=representation' },
    );

    // c. generar sesiones
    const sesiones = [];
    for (const asignacion of asignaciones) {
      const cuantas = 30 + Math.floor(Math.random() * 50);
      for (let i = 0; i < cuantas; i++) {
        const horaUTC = 10 + Math.floor(Math.random() * 12); // 10-21 UTC = 07-18 Salta
        const minuto = Math.floor(Math.random() * 60);
        const iniciadaA = new Date(Date.UTC(
          fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate(), horaUTC, minuto, 0,
        ));
        const duracionMin = DURACIONES[Math.floor(Math.random() * DURACIONES.length)];
        const cubiertaHasta = new Date(iniciadaA.getTime() + duracionMin * 60_000);
        const esDigital = Math.random() < 0.7;
        const tipoVehiculo = Math.random() < 0.85 ? 'auto' : 'moto';
        const { base, final } = montoDe(tipoVehiculo, duracionMin, esDigital);
        const sigueActiva = diasAtras === 0 && iniciadaA <= ahora && cubiertaHasta > ahora;

        sesiones.push({
          patente: randomPatente(sigueActiva),
          tipo_vehiculo: tipoVehiculo,
          permisionario_id: asignacion.permisionario_id,
          cuadra_id: asignacion.cuadra_id,
          asignacion_id: asignacion.id,
          iniciada_a: iniciadaA.toISOString(),
          cubierta_hasta: cubiertaHasta.toISOString(),
          duracion_minutos: duracionMin,
          monto: final,
          monto_sin_descuento: base,
          medio_pago: esDigital ? 'digital_mp' : 'efectivo',
          status: sigueActiva ? 'active' : 'expired',
          liberada_a: sigueActiva ? null : cubiertaHasta.toISOString(),
          liberada_por: sigueActiva ? null : 'auto_expired',
        });
      }
    }

    // insert en batches de 500
    let inserted = 0;
    for (let i = 0; i < sesiones.length; i += 500) {
      await rest('parking_sessions', { method: 'POST', body: sesiones.slice(i, i + 500), prefer: 'return=minimal' });
      inserted += Math.min(500, sesiones.length - i);
    }
    totalSesiones += inserted;
    const activas = sesiones.filter((s) => s.status === 'active').length;
    console.log(`  ${fechaStr}: ${inserted} sesiones${activas ? ` (${activas} activas)` : ''}`);
  }

  // d. recalcular métricas de cada día tocado
  for (const f of fechasTocadas) {
    await rest('rpc/calcular_metricas_diarias', { method: 'POST', body: { p_fecha: f } });
  }

  console.log(`✔ Listo: ${totalSesiones} sesiones en ${fechasTocadas.length} días. Métricas recalculadas.`);
}

main().catch((e) => {
  console.error('💥 seed-refresh falló:', e.message);
  process.exit(1);
});
