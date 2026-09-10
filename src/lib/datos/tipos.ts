/**
 * Tipos de la capa de datos de Cuadra.
 *
 * Es el modelo que antes vivía en Postgres (Supabase). Desde la salida de
 * Supabase (2026-09) la demo corre sobre datos sembrados en memoria: este
 * archivo es la única fuente de verdad del modelo. Si algún día vuelve a
 * haber una base, se implementa contra estos mismos tipos.
 */

import type {MedioPago, TipoVehiculo, Turno} from '@/lib/motor-reglas/tipos';

export type MedioCobroTipo = 'cuenta_bancaria' | 'mp' | 'efectivo_sucursal';
export type EstadoPermisionario = 'activo' | 'suspendido' | 'baja';

export interface Permisionario {
  id: string;
  dni: string;
  nombre_completo: string;
  qr_code: string;
  telefono: string | null;
  email: string | null;
  medio_cobro_tipo: MedioCobroTipo;
  medio_cobro_datos: Record<string, string> | null;
  estado: EstadoPermisionario;
  fecha_alta: string;
}

export interface Cuadra {
  id: string;
  calle: string;
  altura_desde: number;
  altura_hasta: number;
  nombre_display: string;
  habilitada_diurno: boolean;
  habilitada_nocturno: boolean;
  lat: number;
  lng: number;
  activa: boolean;
}

export interface AsignacionDiaria {
  id: string;
  permisionario_id: string;
  cuadra_id: string;
  fecha: string; // YYYY-MM-DD
  turno: Turno;
  hora_inicio_real: string | null;
  hora_fin_real: string | null;
  created_at: string;
}

export interface TarifaVigente {
  id: string;
  tipo_vehiculo: TipoVehiculo;
  monto_por_hora: number;
  monto_por_fraccion_15min: number;
  descuento_digital_pct: number;
  vigente_desde: string;
  vigente_hasta: string | null;
}

export interface HorarioTurnoRow {
  id: string;
  turno: Turno;
  dia_semana: number;
  hora_inicio: string; // HH:MM
  hora_fin: string;
  activo: boolean;
}

export interface FeriadoRow {
  id: string;
  fecha: string;
  descripcion: string;
  permite_nocturno: boolean;
  permite_diurno: boolean;
}

export interface ZonaNocturna {
  id: string;
  nombre: string;
  activa: boolean;
  created_at: string;
}

export interface ConfigItem {
  id: string;
  clave: string;
  valor: unknown;
  descripcion: string | null;
}

export type MedioPagoSesion = MedioPago | 'extension_digital';
export type StatusSesion = 'active' | 'expired' | 'left_early' | 'extended_pending' | 'rejected';
export type LiberadaPor = 'auto_expired' | 'conductor' | 'permisionario';

export interface ParkingSession {
  id: string;
  patente: string;
  tipo_vehiculo: TipoVehiculo;
  permisionario_id: string;
  cuadra_id: string;
  asignacion_id: string | null;
  iniciada_a: string;
  cubierta_hasta: string;
  duracion_minutos: number;
  monto: number;
  monto_sin_descuento: number;
  medio_pago: MedioPagoSesion;
  mp_payment_id: string | null;
  mp_payment_status: string | null;
  status: StatusSesion;
  liberada_a: string | null;
  liberada_por: LiberadaPor | null;
  conductor_email: string | null;
  /** true para las sesiones sembradas; false para las creadas en vivo desde la app */
  sembrada: boolean;
  /** Última modificación (ISO). Decide qué copia gana entre memoria y cookie. */
  updated_at: string;
}

export interface SesionExtendida {
  id: string;
  sesion_original_id: string;
  permisionario_id: string;
  hora_estimada_extension: string;
  duracion_extra_minutos: number;
  monto_extra: number;
  link_pago_token: string;
  link_pago_expira: string;
  status: 'pending' | 'paid' | 'expired';
  email_enviado_a: string | null;
  email_enviado_at: string | null;
  created_at: string;
}

export interface ConciliacionEfectivo {
  id: string;
  permisionario_id: string;
  asignacion_id: string;
  total_efectivo_recaudado: number;
  saldo_a_rendir: number;
  status: 'pending' | 'rendido' | 'failed';
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  source: string;
  event_type: string;
  payment_id: string | null;
  payload: unknown;
  processed: boolean;
  error_message: string | null;
  received_at: string;
  processed_at: string | null;
}

/** Agregado por permisionario y día (antes: tabla metricas_diarias, hoy se calcula al leer). */
export interface MetricaDiaria {
  permisionario_id: string;
  fecha: string;
  sesiones_total: number;
  sesiones_digital: number;
  sesiones_efectivo: number;
  recaudacion_total: number;
  recaudacion_digital: number;
  recaudacion_efectivo: number;
  ratio_digital: number;
}
