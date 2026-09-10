/**
 * Semilla de la demo: los datos maestros (permisionarios, cuadras, tarifas,
 * horarios, feriados, zonas, config) y el generador DETERMINISTA de la
 * actividad de estacionamiento.
 *
 * Determinista quiere decir: para una misma fecha, la actividad generada es
 * exactamente la misma en cualquier instancia y en cualquier momento del día.
 * Eso reemplaza al `seed-refresh.mjs` (aleatorio, corría por GitHub Action
 * contra Supabase) y hace que dos lambdas de Vercel vean los mismos datos
 * sin compartir nada.
 *
 * El perfil de la actividad es el mismo que usaba el seed original:
 * 30 a 79 sesiones por permisionario y día, 70% digital, 85% autos,
 * duraciones de 1 a 2 horas, entre las 07:00 y las 18:59 de Salta (UTC-3),
 * y sin actividad diurna los domingos.
 */

import type {
  AsignacionDiaria,
  ConfigItem,
  Cuadra,
  FeriadoRow,
  HorarioTurnoRow,
  ParkingSession,
  Permisionario,
  TarifaVigente,
  ZonaNocturna,
} from './tipos';

// ─── Datos maestros ──────────────────────────────────────────────────────────

const ALTA = '2026-05-28T12:00:00.000Z';

export const PERMISIONARIOS: Permisionario[] = [
  {id: 'permi-001', dni: '20184567', nombre_completo: 'María Cristina Aramayo', qr_code: 'CUADRA-001', telefono: '+5493874123456', email: 'mc.aramayo@gmail.com', medio_cobro_tipo: 'cuenta_bancaria', medio_cobro_datos: {cbu: '0000000000000000000001', alias: 'ARAMAYO.SALTA'}, estado: 'activo', fecha_alta: ALTA},
  {id: 'permi-002', dni: '22345678', nombre_completo: 'Juan Carlos Tolaba', qr_code: 'CUADRA-002', telefono: '+5493874234567', email: null, medio_cobro_tipo: 'cuenta_bancaria', medio_cobro_datos: {cbu: '0000000000000000000002', alias: 'TOLABA.JUAN'}, estado: 'activo', fecha_alta: ALTA},
  {id: 'permi-003', dni: '14523678', nombre_completo: 'Rosa Elena Cardozo', qr_code: 'CUADRA-003', telefono: '+5493874345678', email: null, medio_cobro_tipo: 'cuenta_bancaria', medio_cobro_datos: {cbu: '0000000000000000000003', alias: 'CARDOZO.ROSA'}, estado: 'activo', fecha_alta: ALTA},
  {id: 'permi-004', dni: '11234567', nombre_completo: 'José Luis Cruz', qr_code: 'CUADRA-004', telefono: '+5493874456789', email: 'jose.cruz.51@gmail.com', medio_cobro_tipo: 'mp', medio_cobro_datos: {mp_email: 'jose.cruz.51@gmail.com'}, estado: 'activo', fecha_alta: ALTA},
  {id: 'permi-005', dni: '15678901', nombre_completo: 'Marta Susana Burgos', qr_code: 'CUADRA-005', telefono: '+5493874567890', email: null, medio_cobro_tipo: 'mp', medio_cobro_datos: {mp_email: 'martaburgos@hotmail.com'}, estado: 'activo', fecha_alta: ALTA},
  {id: 'permi-006', dni: '8123456', nombre_completo: 'Hugo Daniel Yapura', qr_code: 'CUADRA-006', telefono: '+5493874678901', email: null, medio_cobro_tipo: 'efectivo_sucursal', medio_cobro_datos: null, estado: 'activo', fecha_alta: ALTA},
  {id: 'permi-007', dni: '9234567', nombre_completo: 'Norma Beatriz Sosa', qr_code: 'CUADRA-007', telefono: '+5493874789012', email: null, medio_cobro_tipo: 'efectivo_sucursal', medio_cobro_datos: null, estado: 'activo', fecha_alta: ALTA},
  {id: 'permi-008', dni: '10345678', nombre_completo: 'Antonio Ramón Velázquez', qr_code: 'CUADRA-008', telefono: '+5493874890123', email: null, medio_cobro_tipo: 'efectivo_sucursal', medio_cobro_datos: null, estado: 'activo', fecha_alta: ALTA},
  {id: 'permi-009', dni: '7456789', nombre_completo: 'Carmen Rosa Quipildor', qr_code: 'CUADRA-009', telefono: '+5493874901234', email: null, medio_cobro_tipo: 'efectivo_sucursal', medio_cobro_datos: null, estado: 'activo', fecha_alta: ALTA},
  {id: 'permi-010', dni: '11890123', nombre_completo: 'Ramón Alberto Choque', qr_code: 'CUADRA-010', telefono: '+5493874012345', email: null, medio_cobro_tipo: 'efectivo_sucursal', medio_cobro_datos: null, estado: 'activo', fecha_alta: ALTA},
  {id: 'permi-011', dni: '12345678', nombre_completo: 'Estela Mary Lamas', qr_code: 'CUADRA-011', telefono: '+5493874123455', email: null, medio_cobro_tipo: 'efectivo_sucursal', medio_cobro_datos: null, estado: 'activo', fecha_alta: ALTA},
  {id: 'permi-012', dni: '13456789', nombre_completo: 'Domingo Felipe Salva', qr_code: 'CUADRA-012', telefono: '+5493874234566', email: null, medio_cobro_tipo: 'efectivo_sucursal', medio_cobro_datos: null, estado: 'activo', fecha_alta: ALTA},
  {id: 'permi-013', dni: '14567890', nombre_completo: 'Lucía Magdalena Vilte', qr_code: 'CUADRA-013', telefono: '+5493874345677', email: null, medio_cobro_tipo: 'efectivo_sucursal', medio_cobro_datos: null, estado: 'activo', fecha_alta: ALTA},
  {id: 'permi-014', dni: '15678902', nombre_completo: 'Raúl Enrique Aban', qr_code: 'CUADRA-014', telefono: '+5493874456788', email: null, medio_cobro_tipo: 'efectivo_sucursal', medio_cobro_datos: null, estado: 'activo', fecha_alta: ALTA},
  // Uno suspendido, para mostrar estados distintos en el panel
  {id: 'permi-015', dni: '16789012', nombre_completo: 'Carlos Alberto Maidana', qr_code: 'CUADRA-015', telefono: '+5493874567899', email: null, medio_cobro_tipo: 'efectivo_sucursal', medio_cobro_datos: null, estado: 'suspendido', fecha_alta: ALTA},
];

function cuadra(
  n: number,
  calle: string,
  desde: number,
  diurno: boolean,
  nocturno: boolean,
  lat: number,
  lng: number
): Cuadra {
  return {
    id: `cuadra-${String(n).padStart(3, '0')}`,
    calle,
    altura_desde: desde,
    altura_hasta: desde + 99,
    nombre_display: `${calle} ${desde}`,
    habilitada_diurno: diurno,
    habilitada_nocturno: nocturno,
    lat,
    lng,
    activa: true,
  };
}

/** Cuadras del microcentro real de Salta. Mismas 21 del seed original. */
export const CUADRAS: Cuadra[] = [
  cuadra(1, 'Caseros', 700, true, false, -24.7867, -65.4115),
  cuadra(2, 'Caseros', 800, true, false, -24.7868, -65.4118),
  cuadra(3, 'Caseros', 900, true, false, -24.7869, -65.4121),
  cuadra(4, 'Mitre', 100, true, false, -24.79, -65.4108),
  cuadra(5, 'Mitre', 200, true, false, -24.7898, -65.4111),
  cuadra(6, 'España', 400, true, false, -24.7901, -65.408),
  cuadra(7, 'España', 500, true, false, -24.79, -65.4083),
  cuadra(8, 'Florida', 100, true, false, -24.789, -65.41),
  cuadra(9, 'Florida', 200, true, false, -24.7891, -65.4103),
  cuadra(10, 'Pueyrredón', 100, true, false, -24.791, -65.4097),
  cuadra(11, 'Pueyrredón', 200, true, false, -24.7911, -65.41),
  cuadra(12, 'Rivadavia', 800, true, false, -24.7878, -65.407),
  cuadra(13, 'Leguizamón', 700, true, false, -24.786, -65.4145),
  cuadra(14, 'Gorriti', 100, true, false, -24.7895, -65.409),
  cuadra(15, 'Balcarce', 800, false, true, -24.782, -65.408),
  cuadra(16, 'Balcarce', 900, false, true, -24.7818, -65.4082),
  cuadra(17, 'Balcarce', 1000, false, true, -24.7815, -65.4085),
  cuadra(18, 'Güemes', 700, true, true, -24.795, -65.412),
  cuadra(19, 'Güemes', 800, true, true, -24.7948, -65.4123),
  cuadra(20, 'Alvarado', 600, true, true, -24.791, -65.406),
  cuadra(21, 'Alvarado', 700, true, true, -24.7912, -65.4063),
];

export const TARIFAS: TarifaVigente[] = [
  {id: 'tarifa-auto', tipo_vehiculo: 'auto', monto_por_hora: 700, monto_por_fraccion_15min: 175, descuento_digital_pct: 20, vigente_desde: '2026-01-01', vigente_hasta: null},
  {id: 'tarifa-moto', tipo_vehiculo: 'moto', monto_por_hora: 300, monto_por_fraccion_15min: 75, descuento_digital_pct: 20, vigente_desde: '2026-01-01', vigente_hasta: null},
];

export const HORARIOS: HorarioTurnoRow[] = [
  ...[1, 2, 3, 4, 5].map<HorarioTurnoRow>((d) => ({id: `hor-diurno-${d}`, turno: 'diurno', dia_semana: d, hora_inicio: '07:00', hora_fin: '21:00', activo: true})),
  {id: 'hor-diurno-6', turno: 'diurno', dia_semana: 6, hora_inicio: '07:00', hora_fin: '14:00', activo: true},
  ...[0, 1, 2, 3, 4, 5, 6].map<HorarioTurnoRow>((d) => ({id: `hor-nocturno-${d}`, turno: 'nocturno', dia_semana: d, hora_inicio: '22:00', hora_fin: '05:00', activo: true})),
];

export const FERIADOS: FeriadoRow[] = [
  ['2026-01-01', 'Año Nuevo'],
  ['2026-03-24', 'Día de la Memoria'],
  ['2026-04-02', 'Día del Veterano de Malvinas'],
  ['2026-04-03', 'Viernes Santo'],
  ['2026-05-01', 'Día del Trabajador'],
  ['2026-05-25', 'Revolución de Mayo'],
  ['2026-06-17', 'Paso a la Inmortalidad de Güemes'],
  ['2026-06-20', 'Día de la Bandera'],
  ['2026-07-09', 'Día de la Independencia'],
  ['2026-08-17', 'Paso a la Inmortalidad de San Martín'],
  ['2026-10-12', 'Diversidad Cultural'],
  ['2026-11-20', 'Soberanía Nacional'],
  ['2026-12-08', 'Inmaculada Concepción'],
  ['2026-12-25', 'Navidad'],
].map(([fecha, descripcion]) => ({
  id: `feriado-${fecha}`,
  fecha,
  descripcion,
  permite_nocturno: true,
  permite_diurno: false,
}));

export const ZONAS: ZonaNocturna[] = [
  {id: 'zona-balcarce', nombre: 'Paseo Balcarce', activa: true, created_at: ALTA},
  {id: 'zona-guemes', nombre: 'Paseo Güemes', activa: true, created_at: ALTA},
  {id: 'zona-alvarado', nombre: 'Plaza Alvarado', activa: true, created_at: ALTA},
];

export const CONFIG: ConfigItem[] = [
  {id: 'cfg-tolerancia', clave: 'tolerancia_minutos', valor: 5, descripcion: 'Tolerancia post-expiración de sesión'},
  {id: 'cfg-min-fin-turno', clave: 'minutos_min_antes_fin_turno', valor: 10, descripcion: 'Minutos antes de fin de turno donde se bloquea registro nuevo (D21)'},
  {id: 'cfg-saldo-favor', clave: 'saldo_favor_enabled', valor: false, descripcion: 'Habilita saldo a favor por patente (D13, off por default)'},
  {id: 'cfg-tel-soporte', clave: 'telefono_soporte', valor: '147', descripcion: 'Línea ciudadana Muni'},
  {id: 'cfg-email-soporte', clave: 'email_soporte', valor: 'estacionamientomedido@municipalidadsalta.gob.ar', descripcion: 'Email oficial Muni'},
];

// ─── Generador determinista ──────────────────────────────────────────────────

/** PRNG mulberry32: rápido, determinista, suficiente para una demo. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash FNV-1a de un string a 32 bits: convierte una fecha en una semilla. */
function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const DURACIONES = [60, 60, 60, 90, 120, 75];
const PREFIJOS = ['ABC', 'DEF', 'GHI', 'JKL', 'AB', 'CD'];
const SUFIJOS = ['XY', 'ZX', 'YZ'];

function elegir<T>(rng: () => number, lista: T[]): T {
  return lista[Math.floor(rng() * lista.length)];
}

function idDeterminista(rng: () => number, prefijo: string): string {
  const hex = Math.floor(rng() * 0xffffffff)
    .toString(16)
    .padStart(8, '0');
  return `${prefijo}${hex}`;
}

/** Mismo cálculo que el motor de reglas, hardcodeado como en el seed original. */
function montoDe(tipoVehiculo: 'auto' | 'moto', duracionMin: number, esDigital: boolean) {
  const tarifaHora = tipoVehiculo === 'auto' ? 700 : 300;
  const fraccion15 = tipoVehiculo === 'auto' ? 175 : 75;
  let base = tarifaHora;
  if (duracionMin > 60) base += Math.ceil((duracionMin - 60) / 15) * fraccion15;
  const final = esDigital ? Math.round(base * 0.8) : base;
  return {base, final};
}

export interface ActividadDia {
  asignaciones: AsignacionDiaria[];
  sesiones: ParkingSession[];
}

/**
 * Genera las asignaciones y sesiones de UN día (fecha en formato YYYY-MM-DD,
 * interpretada en UTC como hacía el seed original). Los domingos devuelven
 * listas vacías: no hay turno diurno.
 *
 * Todas las sesiones salen con `status: 'expired'`; el store decide cuáles
 * están activas comparando `cubierta_hasta` con el reloj (ver store.ts).
 */
export function generarDia(fechaStr: string): ActividadDia {
  const fecha = new Date(`${fechaStr}T00:00:00Z`);
  if (fecha.getUTCDay() === 0) return {asignaciones: [], sesiones: []};

  const rng = mulberry32(hash32(`cuadra-demo:${fechaStr}`));
  const activos = PERMISIONARIOS.filter((p) => p.estado === 'activo');
  const diurnas = CUADRAS.filter((c) => c.habilitada_diurno);

  const asignaciones: AsignacionDiaria[] = activos.map((p, idx) => ({
    id: `asig-${fechaStr}-${p.id}`,
    permisionario_id: p.id,
    cuadra_id: diurnas[idx % diurnas.length].id,
    fecha: fechaStr,
    turno: 'diurno',
    hora_inicio_real: new Date(fecha.getTime() + 10 * 3600 * 1000).toISOString(),
    hora_fin_real: new Date(fecha.getTime() + 24 * 3600 * 1000).toISOString(),
    created_at: fecha.toISOString(),
  }));

  const sesiones: ParkingSession[] = [];
  for (const asignacion of asignaciones) {
    const cuantas = 30 + Math.floor(rng() * 50);
    for (let i = 0; i < cuantas; i++) {
      const horaUTC = 10 + Math.floor(rng() * 12); // 10-21 UTC = 07-18 Salta
      const minuto = Math.floor(rng() * 60);
      const iniciadaA = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate(), horaUTC, minuto, 0));
      const duracionMin = elegir(rng, DURACIONES);
      const cubiertaHasta = new Date(iniciadaA.getTime() + duracionMin * 60_000);
      const esDigital = rng() < 0.7;
      const tipoVehiculo: 'auto' | 'moto' = rng() < 0.85 ? 'auto' : 'moto';
      const {base, final} = montoDe(tipoVehiculo, duracionMin, esDigital);
      const patente = `${elegir(rng, PREFIJOS)}${100 + Math.floor(rng() * 900)}${elegir(rng, SUFIJOS)}`;

      sesiones.push({
        id: idDeterminista(rng, 's'),
        patente,
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
        mp_payment_id: null,
        mp_payment_status: null,
        status: 'expired',
        liberada_a: cubiertaHasta.toISOString(),
        liberada_por: 'auto_expired',
        conductor_email: null,
        sembrada: true,
        updated_at: cubiertaHasta.toISOString(),
      });
    }
  }

  sesiones.sort((a, b) => a.iniciada_a.localeCompare(b.iniciada_a));
  return {asignaciones, sesiones};
}
