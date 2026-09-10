/**
 * Store en memoria de la demo de Cuadra.
 *
 * Reemplaza a Supabase (Postgres + Auth + Realtime) desde 2026-09. Reglas:
 *
 *  - Los datos maestros y la actividad histórica salen de `semilla.ts`, que es
 *    determinista por fecha: cualquier instancia genera lo mismo.
 *  - Lo que la app ESCRIBE (una sesión cobrada, una tarifa editada, un cierre
 *    del día) vive en memoria del proceso. En Vercel eso dura lo que dura la
 *    instancia: es una simulación, no persistencia, y se declara así en la UI.
 *  - El estado `active` / `expired` de una sesión se DERIVA del reloj al leer
 *    (antes lo hacía la función SQL `expirar_sesiones_vencidas`). Así no hay
 *    un job que acordarse de correr.
 *
 * Toda la app pasa por acá. Si vuelve a haber una base, se reimplementa este
 * módulo y nada más.
 */

import type {ContextoValidacion} from '@/lib/motor-reglas/tipos';
import {
  CONFIG,
  CUADRAS,
  FERIADOS,
  HORARIOS,
  PERMISIONARIOS,
  TARIFAS,
  ZONAS,
  generarDia,
  type ActividadDia,
} from './semilla';
import type {
  AsignacionDiaria,
  ConciliacionEfectivo,
  ConfigItem,
  Cuadra,
  FeriadoRow,
  HorarioTurnoRow,
  MetricaDiaria,
  ParkingSession,
  Permisionario,
  SesionExtendida,
  StatusSesion,
  TarifaVigente,
  WebhookEvent,
  ZonaNocturna,
} from './tipos';

interface Estado {
  dias: Map<string, ActividadDia>;
  permisionarios: Permisionario[];
  cuadras: Cuadra[];
  tarifas: TarifaVigente[];
  horarios: HorarioTurnoRow[];
  feriados: FeriadoRow[];
  zonas: ZonaNocturna[];
  config: ConfigItem[];
  /** Sesiones creadas o modificadas en vivo, por id. Pisan a la sembrada del mismo id. */
  sesionesVivas: Map<string, ParkingSession>;
  extensiones: SesionExtendida[];
  conciliaciones: ConciliacionEfectivo[];
  webhookEvents: WebhookEvent[];
}

declare global {
  // eslint-disable-next-line no-var
  var __cuadraStore: Estado | undefined;
}

function estadoInicial(): Estado {
  return {
    dias: new Map(),
    permisionarios: PERMISIONARIOS.map((p) => ({...p})),
    cuadras: CUADRAS.map((c) => ({...c})),
    tarifas: TARIFAS.map((t) => ({...t})),
    horarios: HORARIOS.map((h) => ({...h})),
    feriados: FERIADOS.map((f) => ({...f})),
    zonas: ZONAS.map((z) => ({...z})),
    config: CONFIG.map((c) => ({...c})),
    sesionesVivas: new Map(),
    extensiones: [],
    conciliaciones: [],
    webhookEvents: [],
  };
}

/** Singleton por proceso (sobrevive al hot reload de Next en dev). */
function estado(): Estado {
  if (!globalThis.__cuadraStore) globalThis.__cuadraStore = estadoInicial();
  return globalThis.__cuadraStore;
}

/** Solo para tests: vuelve el store a la semilla. */
export function reiniciarStore(): void {
  globalThis.__cuadraStore = estadoInicial();
}

// ─── Fechas ──────────────────────────────────────────────────────────────────

/** YYYY-MM-DD en UTC, la misma convención que usaba la app contra Postgres. */
export function fechaISO(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function sumarDias(fechaStr: string, dias: number): string {
  const d = new Date(`${fechaStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return fechaISO(d);
}

function* rangoFechas(desde: string, hasta: string): Generator<string> {
  for (let f = desde; f <= hasta; f = sumarDias(f, 1)) yield f;
}

function dia(fechaStr: string): ActividadDia {
  const e = estado();
  let d = e.dias.get(fechaStr);
  if (!d) {
    d = generarDia(fechaStr);
    e.dias.set(fechaStr, d);
  }
  return d;
}

// ─── Sesiones: estado derivado del reloj ─────────────────────────────────────

function toleranciaMs(): number {
  const item = estado().config.find((c) => c.clave === 'tolerancia_minutos');
  return Number(item?.valor ?? 5) * 60_000;
}

/**
 * Devuelve la sesión con el status que le corresponde AHORA.
 *  - Sembradas: activas mientras el reloj esté dentro de su ventana.
 *  - En vivo: `active` vence pasada la tolerancia (igual que la función SQL).
 */
function conEstadoActual(s: ParkingSession, ahora: Date): ParkingSession {
  const inicio = new Date(s.iniciada_a).getTime();
  const fin = new Date(s.cubierta_hasta).getTime();
  const t = ahora.getTime();
  if (s.sembrada) {
    if (inicio <= t && t < fin) return {...s, status: 'active', liberada_a: null, liberada_por: null};
    return s;
  }
  if (s.status === 'active' && fin + toleranciaMs() < t) {
    return {...s, status: 'expired', liberada_a: s.cubierta_hasta, liberada_por: 'auto_expired'};
  }
  return s;
}

/** Sesiones de un día, sembradas más vivas, sin las que todavía no empezaron. */
function sesionesDelDiaCrudas(fechaStr: string, ahora: Date): ParkingSession[] {
  const e = estado();
  const vivas = e.sesionesVivas;
  const resultado: ParkingSession[] = [];
  for (const s of dia(fechaStr).sesiones) {
    if (vivas.has(s.id)) continue; // la versión viva pisa a la sembrada
    if (new Date(s.iniciada_a) > ahora) continue; // todavía no pasó
    resultado.push(conEstadoActual(s, ahora));
  }
  for (const s of vivas.values()) {
    if (s.iniciada_a.slice(0, 10) === fechaStr) resultado.push(conEstadoActual(s, ahora));
  }
  return resultado;
}

const STATUS_CONTABLES: StatusSesion[] = ['active', 'expired', 'left_early'];

// ─── Lecturas: maestros ──────────────────────────────────────────────────────

export function listarPermisionarios(): Permisionario[] {
  return [...estado().permisionarios].sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo, 'es'));
}

export function permisionarioPorId(id: string): Permisionario | null {
  return estado().permisionarios.find((p) => p.id === id) ?? null;
}

export function permisionarioPorQr(qr: string): Permisionario | null {
  return estado().permisionarios.find((p) => p.qr_code === qr) ?? null;
}

export function permisionarioPorDni(dni: string): Permisionario | null {
  return estado().permisionarios.find((p) => p.dni === dni) ?? null;
}

export function contarPermisionariosActivos(): number {
  return estado().permisionarios.filter((p) => p.estado === 'activo').length;
}

export function cuadraPorId(id: string): Cuadra | null {
  return estado().cuadras.find((c) => c.id === id) ?? null;
}

export function asignacionDelDia(permisionarioId: string, fechaStr: string): AsignacionDiaria | null {
  return dia(fechaStr).asignaciones.find((a) => a.permisionario_id === permisionarioId) ?? null;
}

export function tarifasVigentes(): TarifaVigente[] {
  return estado()
    .tarifas.filter((t) => t.vigente_hasta === null)
    .sort((a, b) => a.tipo_vehiculo.localeCompare(b.tipo_vehiculo));
}

export function listarHorarios(): HorarioTurnoRow[] {
  return [...estado().horarios].sort((a, b) => a.turno.localeCompare(b.turno) || a.dia_semana - b.dia_semana);
}

export function listarFeriados(): FeriadoRow[] {
  return [...estado().feriados].sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function listarZonas(): ZonaNocturna[] {
  return [...estado().zonas].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

export function zonasActivas(): ZonaNocturna[] {
  return listarZonas().filter((z) => z.activa);
}

export function listarConfig(): ConfigItem[] {
  return [...estado().config].sort((a, b) => a.clave.localeCompare(b.clave));
}

/** Contexto que consume el motor de reglas (antes: `cargarContextoValidacion` contra 5 tablas). */
export function contextoValidacion(cuadraId: string, momento: Date = new Date()): ContextoValidacion {
  const e = estado();
  const configMap: Record<string, unknown> = {};
  for (const c of e.config) configMap[c.clave] = c.valor;
  const cuadra = cuadraPorId(cuadraId);
  return {
    momento,
    cuadra: {
      habilitada_diurno: cuadra?.habilitada_diurno ?? false,
      habilitada_nocturno: cuadra?.habilitada_nocturno ?? false,
    },
    tarifas: tarifasVigentes().map((t) => ({
      tipo_vehiculo: t.tipo_vehiculo,
      monto_por_hora: t.monto_por_hora,
      monto_por_fraccion_15min: t.monto_por_fraccion_15min,
      descuento_digital_pct: t.descuento_digital_pct,
    })),
    horarios: e.horarios
      .filter((h) => h.activo)
      .map((h) => ({turno: h.turno, dia_semana: h.dia_semana, hora_inicio: h.hora_inicio, hora_fin: h.hora_fin})),
    feriados: e.feriados.map((f) => ({
      fecha: f.fecha,
      descripcion: f.descripcion,
      permite_diurno: f.permite_diurno,
      permite_nocturno: f.permite_nocturno,
    })),
    config: {
      tolerancia_minutos: Number(configMap.tolerancia_minutos ?? 5),
      minutos_min_antes_fin_turno: Number(configMap.minutos_min_antes_fin_turno ?? 10),
    },
  };
}

// ─── Lecturas: sesiones ──────────────────────────────────────────────────────

export function obtenerSesion(id: string, ahora: Date = new Date()): ParkingSession | null {
  const e = estado();
  const viva = e.sesionesVivas.get(id);
  if (viva) return conEstadoActual(viva, ahora);
  // Las sembradas llevan la fecha en su ventana: buscamos en los días cargados
  // y, si no está, en los últimos 60 días (una sesión sembrada nunca es de hoy
  // hacia adelante).
  for (const d of e.dias.values()) {
    const s = d.sesiones.find((x) => x.id === id);
    if (s) return conEstadoActual(s, ahora);
  }
  const hoy = fechaISO(ahora);
  for (let i = 0; i < 60; i++) {
    const f = sumarDias(hoy, -i);
    if (e.dias.has(f)) continue;
    const s = dia(f).sesiones.find((x) => x.id === id);
    if (s) return conEstadoActual(s, ahora);
  }
  return null;
}

/** Sesiones iniciadas entre dos fechas (inclusive), con el status derivado. */
export function sesionesEnRango(desde: string, hasta: string, ahora: Date = new Date()): ParkingSession[] {
  const todas: ParkingSession[] = [];
  for (const f of rangoFechas(desde, hasta)) todas.push(...sesionesDelDiaCrudas(f, ahora));
  return todas;
}

/** Sesiones contables (activas, vencidas o liberadas) de un rango. Es el filtro que usaba el dashboard. */
export function sesionesContables(desde: string, hasta: string, ahora: Date = new Date()): ParkingSession[] {
  return sesionesEnRango(desde, hasta, ahora).filter((s) => STATUS_CONTABLES.includes(s.status));
}

export function sesionesDelPermisionarioHoy(permisionarioId: string, ahora: Date = new Date()): ParkingSession[] {
  return sesionesDelDiaCrudas(fechaISO(ahora), ahora)
    .filter((s) => s.permisionario_id === permisionarioId)
    .sort((a, b) => b.iniciada_a.localeCompare(a.iniciada_a));
}

export function sesionesActivas(limite: number, ahora: Date = new Date()): ParkingSession[] {
  const hoy = fechaISO(ahora);
  // Una sesión activa arrancó hoy o ayer (máximo 4 h de duración).
  return [...sesionesDelDiaCrudas(sumarDias(hoy, -1), ahora), ...sesionesDelDiaCrudas(hoy, ahora)]
    .filter((s) => s.status === 'active')
    .sort((a, b) => b.iniciada_a.localeCompare(a.iniciada_a))
    .slice(0, limite);
}

/** Sesión activa y todavía vigente de una patente, o null (antes: `buscarSesionVigente` y `verificar_patente_activa`). */
export function sesionVigentePorPatente(patente: string, ahora: Date = new Date()): ParkingSession | null {
  const p = patente.toUpperCase().replace(/\s/g, '');
  return sesionesActivas(Number.MAX_SAFE_INTEGER, ahora)
    .filter((s) => s.patente === p && new Date(s.cubierta_hasta) > ahora)
    .sort((a, b) => b.cubierta_hasta.localeCompare(a.cubierta_hasta))[0] ?? null;
}

/** Agregado por permisionario y día (antes: tabla `metricas_diarias` + RPC `calcular_metricas_diarias`). */
export function metricasDiarias(desde: string, hasta: string, ahora: Date = new Date()): MetricaDiaria[] {
  const mapa = new Map<string, MetricaDiaria>();
  for (const s of sesionesContables(desde, hasta, ahora)) {
    const fecha = s.iniciada_a.slice(0, 10);
    const clave = `${s.permisionario_id}|${fecha}`;
    const m =
      mapa.get(clave) ??
      {
        permisionario_id: s.permisionario_id,
        fecha,
        sesiones_total: 0,
        sesiones_digital: 0,
        sesiones_efectivo: 0,
        recaudacion_total: 0,
        recaudacion_digital: 0,
        recaudacion_efectivo: 0,
        ratio_digital: 0,
      };
    m.sesiones_total += 1;
    m.recaudacion_total += s.monto;
    if (s.medio_pago === 'digital_mp') {
      m.sesiones_digital += 1;
      m.recaudacion_digital += s.monto;
    } else if (s.medio_pago === 'efectivo') {
      m.sesiones_efectivo += 1;
      m.recaudacion_efectivo += s.monto;
    }
    m.ratio_digital = m.sesiones_total > 0 ? m.sesiones_digital / m.sesiones_total : 0;
    mapa.set(clave, m);
  }
  return [...mapa.values()].sort((a, b) => a.fecha.localeCompare(b.fecha));
}

export function listarWebhookEvents(limite = 100): WebhookEvent[] {
  return [...estado().webhookEvents].sort((a, b) => b.received_at.localeCompare(a.received_at)).slice(0, limite);
}

export function listarExtensiones(): SesionExtendida[] {
  return [...estado().extensiones];
}

export function listarConciliaciones(): ConciliacionEfectivo[] {
  return [...estado().conciliaciones];
}

// ─── Escrituras ──────────────────────────────────────────────────────────────

type NuevaSesion = Omit<ParkingSession, 'id' | 'mp_payment_id' | 'mp_payment_status' | 'liberada_a' | 'liberada_por' | 'sembrada' | 'updated_at'> &
  Partial<Pick<ParkingSession, 'mp_payment_id' | 'mp_payment_status' | 'liberada_a' | 'liberada_por'>>;

export function crearSesion(datos: NuevaSesion): ParkingSession {
  const sesion: ParkingSession = {
    mp_payment_id: null,
    mp_payment_status: null,
    liberada_a: null,
    liberada_por: null,
    ...datos,
    id: crypto.randomUUID(),
    sembrada: false,
    updated_at: new Date().toISOString(),
  };
  estado().sesionesVivas.set(sesion.id, sesion);
  return sesion;
}

/**
 * Actualiza una sesión por id. Si era sembrada, la copia pasa a ser viva
 * (una sembrada nunca se muta: es la semilla compartida por todas las instancias).
 * Devuelve null si no existe.
 */
export function actualizarSesion(id: string, cambios: Partial<ParkingSession>): ParkingSession | null {
  const actual = obtenerSesion(id);
  if (!actual) return null;
  const nueva: ParkingSession = {...actual, ...cambios, id, sembrada: false, updated_at: new Date().toISOString()};
  estado().sesionesVivas.set(id, nueva);
  return nueva;
}

/**
 * Rehidrata una sesión viva desde afuera (la cookie del navegador). Gana la
 * copia con `updated_at` más nuevo: si la memoria ya la tiene más fresca, no toca.
 */
export function adoptarSesion(sesion: ParkingSession): void {
  const vivas = estado().sesionesVivas;
  const actual = vivas.get(sesion.id);
  if (actual && actual.updated_at >= sesion.updated_at) return;
  vivas.set(sesion.id, {...sesion, sembrada: false});
}

export function sesionPorMpPaymentId(paymentId: string): ParkingSession | null {
  for (const s of estado().sesionesVivas.values()) {
    if (s.mp_payment_id === paymentId) return conEstadoActual(s, new Date());
  }
  return null;
}

export function crearExtension(datos: Omit<SesionExtendida, 'id' | 'created_at'>): SesionExtendida {
  const ext: SesionExtendida = {...datos, id: crypto.randomUUID(), created_at: new Date().toISOString()};
  estado().extensiones.push(ext);
  return ext;
}

export function actualizarExtension(id: string, cambios: Partial<SesionExtendida>): void {
  const e = estado();
  e.extensiones = e.extensiones.map((x) => (x.id === id ? {...x, ...cambios, id} : x));
}

export function crearConciliacion(datos: Omit<ConciliacionEfectivo, 'id' | 'created_at'>): ConciliacionEfectivo {
  const c: ConciliacionEfectivo = {...datos, id: crypto.randomUUID(), created_at: new Date().toISOString()};
  estado().conciliaciones.push(c);
  return c;
}

export function actualizarTarifa(
  id: string,
  cambios: Pick<TarifaVigente, 'monto_por_hora' | 'monto_por_fraccion_15min' | 'descuento_digital_pct'>
): boolean {
  const t = estado().tarifas.find((x) => x.id === id);
  if (!t) return false;
  Object.assign(t, cambios);
  return true;
}

export function actualizarConfig(clave: string, valor: unknown): boolean {
  const c = estado().config.find((x) => x.clave === clave);
  if (!c) return false;
  c.valor = valor;
  return true;
}

export function borrarFeriado(id: string): boolean {
  const e = estado();
  const antes = e.feriados.length;
  e.feriados = e.feriados.filter((f) => f.id !== id);
  return e.feriados.length < antes;
}

export function registrarWebhookEvent(datos: Omit<WebhookEvent, 'id' | 'received_at' | 'processed_at'>): WebhookEvent {
  const ev: WebhookEvent = {...datos, id: crypto.randomUUID(), received_at: new Date().toISOString(), processed_at: null};
  estado().webhookEvents.push(ev);
  return ev;
}

export function marcarWebhookProcesado(paymentId: string): void {
  const ahora = new Date().toISOString();
  for (const ev of estado().webhookEvents) {
    if (ev.payment_id === paymentId && !ev.processed) {
      ev.processed = true;
      ev.processed_at = ahora;
    }
  }
}
