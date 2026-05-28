/**
 * Seed completo para Cuadra (demo PunaTech 2026).
 *
 * Carga:
 *  1. 15 permisionarios (nombres reales tipo NOA, mix de medios de cobro).
 *  2. 21 cuadras del microcentro real de Salta + zonas nocturnas (Balcarce/Güemes/Alvarado).
 *  3. Asignaciones diarias para los últimos 21 días (saltando domingos diurno).
 *  4. ~10k sesiones de estacionamiento distribuidas realistamente
 *     (70% digital / 30% efectivo, 85% autos / 15% motos).
 *  5. Métricas diarias calculadas vía RPC `calcular_metricas_diarias`.
 *
 * Usa SERVICE_ROLE_KEY para bypassear RLS.
 * Ejecutar con: pnpm tsx --env-file=.env.local scripts/seed-dinamico.ts
 */

import {createClient} from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    '❌ Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.\n' +
      'Corré el script con --env-file=.env.local'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {persistSession: false},
});

// ============================================================
// 1. Datos estáticos: permisionarios y cuadras
// ============================================================

const PERMISIONARIOS = [
  // Cuenta bancaria (más jóvenes con onboarding digital)
  {
    dni: '20184567',
    nombre_completo: 'María Cristina Aramayo',
    qr_code: 'CUADRA-001',
    telefono: '+5493874123456',
    email: 'mc.aramayo@gmail.com',
    medio_cobro_tipo: 'cuenta_bancaria',
    medio_cobro_datos: {cbu: '0000000000000000000001', alias: 'ARAMAYO.SALTA'},
    estado: 'activo',
  },
  {
    dni: '22345678',
    nombre_completo: 'Juan Carlos Tolaba',
    qr_code: 'CUADRA-002',
    telefono: '+5493874234567',
    email: null,
    medio_cobro_tipo: 'cuenta_bancaria',
    medio_cobro_datos: {cbu: '0000000000000000000002', alias: 'TOLABA.JUAN'},
    estado: 'activo',
  },
  {
    dni: '14523678',
    nombre_completo: 'Rosa Elena Cardozo',
    qr_code: 'CUADRA-003',
    telefono: '+5493874345678',
    email: null,
    medio_cobro_tipo: 'cuenta_bancaria',
    medio_cobro_datos: {cbu: '0000000000000000000003', alias: 'CARDOZO.ROSA'},
    estado: 'activo',
  },
  // Cuenta MP propia
  {
    dni: '11234567',
    nombre_completo: 'José Luis Cruz',
    qr_code: 'CUADRA-004',
    telefono: '+5493874456789',
    email: 'jose.cruz.51@gmail.com',
    medio_cobro_tipo: 'mp',
    medio_cobro_datos: {mp_email: 'jose.cruz.51@gmail.com'},
    estado: 'activo',
  },
  {
    dni: '15678901',
    nombre_completo: 'Marta Susana Burgos',
    qr_code: 'CUADRA-005',
    telefono: '+5493874567890',
    email: null,
    medio_cobro_tipo: 'mp',
    medio_cobro_datos: {mp_email: 'martaburgos@hotmail.com'},
    estado: 'activo',
  },
  // Efectivo en sucursal (la mayoría de los más mayores)
  {
    dni: '8123456',
    nombre_completo: 'Hugo Daniel Yapura',
    qr_code: 'CUADRA-006',
    telefono: '+5493874678901',
    email: null,
    medio_cobro_tipo: 'efectivo_sucursal',
    medio_cobro_datos: null,
    estado: 'activo',
  },
  {
    dni: '9234567',
    nombre_completo: 'Norma Beatriz Sosa',
    qr_code: 'CUADRA-007',
    telefono: '+5493874789012',
    email: null,
    medio_cobro_tipo: 'efectivo_sucursal',
    medio_cobro_datos: null,
    estado: 'activo',
  },
  {
    dni: '10345678',
    nombre_completo: 'Antonio Ramón Velázquez',
    qr_code: 'CUADRA-008',
    telefono: '+5493874890123',
    email: null,
    medio_cobro_tipo: 'efectivo_sucursal',
    medio_cobro_datos: null,
    estado: 'activo',
  },
  {
    dni: '7456789',
    nombre_completo: 'Carmen Rosa Quipildor',
    qr_code: 'CUADRA-009',
    telefono: '+5493874901234',
    email: null,
    medio_cobro_tipo: 'efectivo_sucursal',
    medio_cobro_datos: null,
    estado: 'activo',
  },
  {
    dni: '11890123',
    nombre_completo: 'Ramón Alberto Choque',
    qr_code: 'CUADRA-010',
    telefono: '+5493874012345',
    email: null,
    medio_cobro_tipo: 'efectivo_sucursal',
    medio_cobro_datos: null,
    estado: 'activo',
  },
  {
    dni: '12345678',
    nombre_completo: 'Estela Mary Lamas',
    qr_code: 'CUADRA-011',
    telefono: '+5493874123455',
    email: null,
    medio_cobro_tipo: 'efectivo_sucursal',
    medio_cobro_datos: null,
    estado: 'activo',
  },
  {
    dni: '13456789',
    nombre_completo: 'Domingo Felipe Salva',
    qr_code: 'CUADRA-012',
    telefono: '+5493874234566',
    email: null,
    medio_cobro_tipo: 'efectivo_sucursal',
    medio_cobro_datos: null,
    estado: 'activo',
  },
  {
    dni: '14567890',
    nombre_completo: 'Lucía Magdalena Vilte',
    qr_code: 'CUADRA-013',
    telefono: '+5493874345677',
    email: null,
    medio_cobro_tipo: 'efectivo_sucursal',
    medio_cobro_datos: null,
    estado: 'activo',
  },
  {
    dni: '15678902',
    nombre_completo: 'Raúl Enrique Aban',
    qr_code: 'CUADRA-014',
    telefono: '+5493874456788',
    email: null,
    medio_cobro_tipo: 'efectivo_sucursal',
    medio_cobro_datos: null,
    estado: 'activo',
  },
  // Uno suspendido (para mostrar estados distintos en admin)
  {
    dni: '16789012',
    nombre_completo: 'Carlos Alberto Maidana',
    qr_code: 'CUADRA-015',
    telefono: '+5493874567899',
    email: null,
    medio_cobro_tipo: 'efectivo_sucursal',
    medio_cobro_datos: null,
    estado: 'suspendido',
  },
];

const CUADRAS = [
  // Diurno solo
  {calle: 'Caseros', altura_desde: 700, altura_hasta: 799, nombre_display: 'Caseros 700', habilitada_diurno: true, habilitada_nocturno: false, lat: -24.7867, lng: -65.4115},
  {calle: 'Caseros', altura_desde: 800, altura_hasta: 899, nombre_display: 'Caseros 800', habilitada_diurno: true, habilitada_nocturno: false, lat: -24.7868, lng: -65.4118},
  {calle: 'Caseros', altura_desde: 900, altura_hasta: 999, nombre_display: 'Caseros 900', habilitada_diurno: true, habilitada_nocturno: false, lat: -24.7869, lng: -65.4121},
  {calle: 'Mitre', altura_desde: 100, altura_hasta: 199, nombre_display: 'Mitre 100', habilitada_diurno: true, habilitada_nocturno: false, lat: -24.7900, lng: -65.4108},
  {calle: 'Mitre', altura_desde: 200, altura_hasta: 299, nombre_display: 'Mitre 200', habilitada_diurno: true, habilitada_nocturno: false, lat: -24.7898, lng: -65.4111},
  {calle: 'España', altura_desde: 400, altura_hasta: 499, nombre_display: 'España 400', habilitada_diurno: true, habilitada_nocturno: false, lat: -24.7901, lng: -65.4080},
  {calle: 'España', altura_desde: 500, altura_hasta: 599, nombre_display: 'España 500', habilitada_diurno: true, habilitada_nocturno: false, lat: -24.7900, lng: -65.4083},
  {calle: 'Florida', altura_desde: 100, altura_hasta: 199, nombre_display: 'Florida 100', habilitada_diurno: true, habilitada_nocturno: false, lat: -24.7890, lng: -65.4100},
  {calle: 'Florida', altura_desde: 200, altura_hasta: 299, nombre_display: 'Florida 200', habilitada_diurno: true, habilitada_nocturno: false, lat: -24.7891, lng: -65.4103},
  {calle: 'Pueyrredón', altura_desde: 100, altura_hasta: 199, nombre_display: 'Pueyrredón 100', habilitada_diurno: true, habilitada_nocturno: false, lat: -24.7910, lng: -65.4097},
  {calle: 'Pueyrredón', altura_desde: 200, altura_hasta: 299, nombre_display: 'Pueyrredón 200', habilitada_diurno: true, habilitada_nocturno: false, lat: -24.7911, lng: -65.4100},
  // Piloto QR 2024
  {calle: 'Rivadavia', altura_desde: 800, altura_hasta: 899, nombre_display: 'Rivadavia 800', habilitada_diurno: true, habilitada_nocturno: false, lat: -24.7878, lng: -65.4070},
  {calle: 'Leguizamón', altura_desde: 700, altura_hasta: 799, nombre_display: 'Leguizamón 700', habilitada_diurno: true, habilitada_nocturno: false, lat: -24.7860, lng: -65.4145},
  {calle: 'Gorriti', altura_desde: 100, altura_hasta: 199, nombre_display: 'Gorriti 100', habilitada_diurno: true, habilitada_nocturno: false, lat: -24.7895, lng: -65.4090},
  // Zona Balcarce (nocturno)
  {calle: 'Balcarce', altura_desde: 800, altura_hasta: 899, nombre_display: 'Balcarce 800', habilitada_diurno: false, habilitada_nocturno: true, lat: -24.7820, lng: -65.4080},
  {calle: 'Balcarce', altura_desde: 900, altura_hasta: 999, nombre_display: 'Balcarce 900', habilitada_diurno: false, habilitada_nocturno: true, lat: -24.7818, lng: -65.4082},
  {calle: 'Balcarce', altura_desde: 1000, altura_hasta: 1099, nombre_display: 'Balcarce 1000', habilitada_diurno: false, habilitada_nocturno: true, lat: -24.7815, lng: -65.4085},
  // Zona Güemes (nocturno)
  {calle: 'Güemes', altura_desde: 700, altura_hasta: 799, nombre_display: 'Güemes 700', habilitada_diurno: true, habilitada_nocturno: true, lat: -24.7950, lng: -65.4120},
  {calle: 'Güemes', altura_desde: 800, altura_hasta: 899, nombre_display: 'Güemes 800', habilitada_diurno: true, habilitada_nocturno: true, lat: -24.7948, lng: -65.4123},
  // Zona Plaza Alvarado (nocturno)
  {calle: 'Alvarado', altura_desde: 600, altura_hasta: 699, nombre_display: 'Alvarado 600', habilitada_diurno: true, habilitada_nocturno: true, lat: -24.7910, lng: -65.4060},
  {calle: 'Alvarado', altura_desde: 700, altura_hasta: 799, nombre_display: 'Alvarado 700', habilitada_diurno: true, habilitada_nocturno: true, lat: -24.7912, lng: -65.4063},
];

// ============================================================
// 2. Helpers
// ============================================================

function randomPatente(): string {
  const formatos = ['ABC', 'DEF', 'GHI', 'JKL', 'AB', 'CD'];
  const sufijos = ['XY', 'ZX', 'YZ'];
  const prefix = formatos[Math.floor(Math.random() * formatos.length)];
  const num = 100 + Math.floor(Math.random() * 900);
  const suf = sufijos[Math.floor(Math.random() * sufijos.length)];
  return `${prefix}${num}${suf}`;
}

// ============================================================
// 3. Seed estático: permisionarios + cuadras (upsert idempotente)
// ============================================================

async function seedEstatico() {
  console.log('→ Sembrando permisionarios...');
  const {error: errPermi} = await supabase
    .from('permisionarios')
    .upsert(PERMISIONARIOS, {onConflict: 'dni'});
  if (errPermi) throw errPermi;

  console.log('→ Sembrando cuadras...');
  const {error: errCuad} = await supabase
    .from('cuadras_habilitadas')
    .upsert(CUADRAS, {onConflict: 'calle,altura_desde,altura_hasta'});
  if (errCuad) throw errCuad;

  console.log('✔ Estáticos OK');
}

// ============================================================
// 4. Seed dinámico
// ============================================================

async function seedDinamico() {
  // Obtener permisionarios activos
  const {data: permis, error: errPermi} = await supabase
    .from('permisionarios')
    .select('id, nombre_completo')
    .eq('estado', 'activo');
  if (errPermi) throw errPermi;

  // Cuadras diurnas
  const {data: cuadras, error: errCuad} = await supabase
    .from('cuadras_habilitadas')
    .select('id, nombre_display')
    .eq('habilitada_diurno', true);
  if (errCuad) throw errCuad;

  if (!permis || !cuadras) throw new Error('No hay permisionarios o cuadras');

  console.log(`Permisionarios activos: ${permis.length}, Cuadras diurnas: ${cuadras.length}`);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let totalSesiones = 0;

  for (let diasAtras = 21; diasAtras >= 0; diasAtras--) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - diasAtras);
    const diaSemana = fecha.getDay();

    // Saltar domingos (no hay turno diurno en domingos según horarios)
    if (diaSemana === 0) continue;

    // 4.1 Asignaciones
    const asignaciones = permis.map((p, idx) => ({
      permisionario_id: p.id,
      cuadra_id: cuadras[idx % cuadras.length].id,
      fecha: fecha.toISOString().slice(0, 10),
      turno: 'diurno' as const,
      hora_inicio_real: new Date(fecha.getTime() + 7 * 3600 * 1000).toISOString(),
      hora_fin_real: new Date(fecha.getTime() + 21 * 3600 * 1000).toISOString(),
    }));

    const {data: asignacionesData, error: asigError} = await supabase
      .from('asignaciones_diarias')
      .upsert(asignaciones, {onConflict: 'permisionario_id,fecha,turno'})
      .select();

    if (asigError) {
      console.error(`Error asignaciones día ${diasAtras}:`, asigError);
      continue;
    }

    // 4.2 Sesiones (30-80 por permisionario)
    const sesiones: Array<Record<string, unknown>> = [];
    for (const asignacion of asignacionesData ?? []) {
      const sesionesPorPermi = 30 + Math.floor(Math.random() * 50);

      for (let i = 0; i < sesionesPorPermi; i++) {
        const horaSesion = 7 + Math.floor(Math.random() * 13); // 07-19
        const minutoSesion = Math.floor(Math.random() * 60);
        const iniciadaA = new Date(fecha);
        iniciadaA.setHours(horaSesion, minutoSesion, 0);

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

        const sigueActiva = diasAtras === 0 && cubiertaHasta > new Date();

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

    // Insert por batches de 500
    let inserted = 0;
    for (let i = 0; i < sesiones.length; i += 500) {
      const batch = sesiones.slice(i, i + 500);
      const {error: sesError} = await supabase.from('parking_sessions').insert(batch);
      if (sesError) {
        console.error(`Error sesiones batch día ${diasAtras} offset ${i}:`, sesError);
        break;
      }
      inserted += batch.length;
    }

    totalSesiones += inserted;
    console.log(
      `  día -${String(diasAtras).padStart(2, '0')} (${fecha.toISOString().slice(0, 10)}): ${inserted} sesiones`
    );
  }

  console.log(`✔ Sesiones totales insertadas: ${totalSesiones}`);

  // 4.3 Calcular métricas diarias
  console.log('→ Calculando métricas diarias...');
  for (let diasAtras = 21; diasAtras >= 0; diasAtras--) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - diasAtras);
    const fechaStr = fecha.toISOString().slice(0, 10);

    const {error} = await supabase.rpc('calcular_metricas_diarias', {p_fecha: fechaStr});
    if (error) {
      console.error(`Error métricas ${fechaStr}:`, error);
    }
  }
  console.log('✔ Métricas calculadas');
}

// ============================================================
// 5. Resumen final
// ============================================================

async function resumen() {
  console.log('\n========== RESUMEN ==========');
  const tablas = [
    'permisionarios',
    'cuadras_habilitadas',
    'asignaciones_diarias',
    'parking_sessions',
    'metricas_diarias',
  ];
  for (const t of tablas) {
    const {count, error} = await supabase.from(t).select('*', {count: 'exact', head: true});
    if (error) {
      console.log(`  ${t}: ERROR ${error.message}`);
    } else {
      console.log(`  ${t}: ${count}`);
    }
  }
  console.log('=============================\n');
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('🌱 Seed Cuadra — empezando');
  await seedEstatico();
  await seedDinamico();
  await resumen();
  console.log('🌱 Seed completo.');
}

main().catch((err) => {
  console.error('💥 Falla en seed:', err);
  process.exit(1);
});
