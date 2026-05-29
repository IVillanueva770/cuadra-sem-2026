/**
 * Seed del DÍA ACTUAL para Cuadra (demo PunaTech 2026).
 *
 * El seed completo (seed-dinamico.ts) genera los últimos 21 días relativos al
 * momento en que se corre. Como "hoy" se mueve, la actividad del día queda
 * vieja al día siguiente: KPIs del día en cero, dashboard del permisionario
 * vacío, etc.
 *
 * Este script refresca SOLO el día de hoy de forma idempotente:
 *   1. Borra las parking_sessions de hoy (no toca el histórico).
 *   2. Garantiza asignaciones diarias de hoy (upsert).
 *   3. Genera sesiones del día (mezcla active/expired).
 *   4. Recalcula metricas_diarias de hoy.
 *
 * NOTA TIMEZONE: el dashboard (admin y permisionario) calcula "hoy" con
 * new Date().toISOString() — es decir, el día en UTC. Para que las sesiones
 * generadas caigan en el mismo "hoy" que el dashboard lee, este script usa el
 * día UTC y genera las sesiones en horas UTC 10-21 (= 07-18 hora Salta, dentro
 * del horario laboral). De día en Salta el día UTC y el día local coinciden;
 * de noche (después de las 21 Salta = 00 UTC) el día UTC ya rotó: por eso
 * conviene correr este script el día de la demo, idealmente de día.
 *
 * Correr el DÍA DE LA DEMO:
 *   pnpm seed:hoy
 */
import {createClient} from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '❌ Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Corré con --env-file=.env.local',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {persistSession: false},
});

function randomPatente(): string {
  const formatos = ['ABC', 'DEF', 'GHI', 'JKL', 'AB', 'CD'];
  const sufijos = ['XY', 'ZX', 'YZ'];
  const prefix = formatos[Math.floor(Math.random() * formatos.length)];
  const num = 100 + Math.floor(Math.random() * 900);
  const suf = sufijos[Math.floor(Math.random() * sufijos.length)];
  return `${prefix}${num}${suf}`;
}

async function main() {
  const ahora = new Date();
  // "Hoy" en UTC, igual criterio que el dashboard (new Date().toISOString()).
  const hoyStr = ahora.toISOString().slice(0, 10);
  const [y, m, d] = hoyStr.split('-').map(Number);

  console.log(`🌱 Seed del día ${hoyStr} (UTC) — empezando`);

  // Permisionarios activos + cuadras diurnas
  const [{data: permis, error: ePermi}, {data: cuadras, error: eCuad}] = await Promise.all([
    supabase.from('permisionarios').select('id, nombre_completo').eq('estado', 'activo'),
    supabase.from('cuadras_habilitadas').select('id, nombre_display').eq('habilitada_diurno', true),
  ]);
  if (ePermi) throw ePermi;
  if (eCuad) throw eCuad;
  if (!permis?.length || !cuadras?.length) throw new Error('No hay permisionarios o cuadras');

  console.log(`Permisionarios activos: ${permis.length}, cuadras diurnas: ${cuadras.length}`);

  // 1. Idempotencia: borrar sesiones de hoy (día UTC)
  const {error: delErr, count: borradas} = await supabase
    .from('parking_sessions')
    .delete({count: 'exact'})
    .gte('iniciada_a', `${hoyStr}T00:00:00Z`)
    .lt('iniciada_a', `${hoyStr}T23:59:59Z`);
  if (delErr) throw delErr;
  console.log(`Sesiones de hoy borradas (idempotencia): ${borradas ?? 0}`);

  // 2. Asignaciones de hoy (upsert). 07-21 Salta = 10-24 UTC.
  const asignaciones = permis.map((p, idx) => ({
    permisionario_id: p.id,
    cuadra_id: cuadras[idx % cuadras.length].id,
    fecha: hoyStr,
    turno: 'diurno' as const,
    hora_inicio_real: new Date(Date.UTC(y, m - 1, d, 10, 0, 0)).toISOString(),
    hora_fin_real: new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0)).toISOString(),
  }));

  const {data: asigData, error: asigErr} = await supabase
    .from('asignaciones_diarias')
    .upsert(asignaciones, {onConflict: 'permisionario_id,fecha,turno'})
    .select();
  if (asigErr) throw asigErr;

  // 3. Sesiones del día. Horas UTC 10-21 (= 07-18 Salta).
  const sesiones: Array<Record<string, unknown>> = [];
  for (const asignacion of asigData ?? []) {
    const sesionesPorPermi = 30 + Math.floor(Math.random() * 50);
    for (let i = 0; i < sesionesPorPermi; i++) {
      const horaUTC = 10 + Math.floor(Math.random() * 12); // 10-21 UTC = 07-18 Salta
      const minuto = Math.floor(Math.random() * 60);
      const iniciadaA = new Date(Date.UTC(y, m - 1, d, horaUTC, minuto, 0));

      const duraciones = [60, 60, 60, 90, 120, 75];
      const duracionMin = duraciones[Math.floor(Math.random() * duraciones.length)];
      const cubiertaHasta = new Date(iniciadaA.getTime() + duracionMin * 60_000);

      const esDigital = Math.random() < 0.7;
      const tipoVehiculo = Math.random() < 0.85 ? 'auto' : 'moto';

      const tarifaHora = tipoVehiculo === 'auto' ? 700 : 300;
      const fraccion15 = tipoVehiculo === 'auto' ? 175 : 75;
      let montoBase = tarifaHora;
      if (duracionMin > 60) {
        montoBase += Math.ceil((duracionMin - 60) / 15) * fraccion15;
      }
      const montoFinal = esDigital ? Math.round(montoBase * 0.8) : montoBase;

      // Activa si su ventana cubre el momento actual.
      const sigueActiva = iniciadaA <= ahora && cubiertaHasta > ahora;

      sesiones.push({
        patente: randomPatente(),
        tipo_vehiculo: tipoVehiculo,
        permisionario_id: asignacion.permisionario_id,
        cuadra_id: asignacion.cuadra_id,
        asignacion_id: asignacion.id,
        iniciada_a: iniciadaA.toISOString(),
        cubierta_hasta: cubiertaHasta.toISOString(),
        duracion_minutos: duracionMin,
        monto: montoFinal,
        monto_sin_descuento: montoBase,
        medio_pago: esDigital ? 'digital_mp' : 'efectivo',
        status: sigueActiva ? 'active' : 'expired',
        liberada_a: sigueActiva ? null : cubiertaHasta.toISOString(),
        liberada_por: sigueActiva ? null : 'auto_expired',
      });
    }
  }

  let inserted = 0;
  for (let i = 0; i < sesiones.length; i += 500) {
    const batch = sesiones.slice(i, i + 500);
    const {error: sesErr} = await supabase.from('parking_sessions').insert(batch);
    if (sesErr) {
      console.error(`Error sesiones batch offset ${i}:`, sesErr);
      break;
    }
    inserted += batch.length;
  }
  const activas = sesiones.filter((s) => s.status === 'active').length;
  console.log(`Sesiones de hoy insertadas: ${inserted} (${activas} activas ahora)`);

  // 4. Métricas de hoy
  const {error: metErr} = await supabase.rpc('calcular_metricas_diarias', {p_fecha: hoyStr});
  if (metErr) throw metErr;
  console.log('✔ Métricas de hoy calculadas');

  console.log(`🌱 Seed del día ${hoyStr} completo.`);
}

main().catch((err) => {
  console.error('💥 Falla en seed-hoy:', err);
  process.exit(1);
});
