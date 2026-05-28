export type TipoVehiculo = 'auto' | 'moto';
export type MedioPago = 'digital_mp' | 'efectivo';
export type Turno = 'diurno' | 'nocturno';

export interface Tarifa {
  tipo_vehiculo: TipoVehiculo;
  monto_por_hora: number;
  monto_por_fraccion_15min: number;
  descuento_digital_pct: number;
}

export interface HorarioTurno {
  turno: Turno;
  dia_semana: number; // 0=domingo, 6=sábado
  hora_inicio: string; // "HH:MM"
  hora_fin: string;
}

export interface Feriado {
  fecha: string; // "YYYY-MM-DD"
  descripcion: string;
  permite_diurno: boolean;
  permite_nocturno: boolean;
}

export interface CuadraInfo {
  habilitada_diurno: boolean;
  habilitada_nocturno: boolean;
  zona_nocturna?: string;
}

export interface ConfigSistema {
  tolerancia_minutos: number;
  minutos_min_antes_fin_turno: number;
}

export interface ContextoValidacion {
  momento: Date;
  cuadra: CuadraInfo;
  tarifas: Tarifa[];
  horarios: HorarioTurno[];
  feriados: Feriado[];
  config: ConfigSistema;
}

export type ValidacionResult =
  | {permitido: true; turno_actual: Turno}
  | {permitido: false; razon: string; mensaje_user: string};

export interface CalculoInput {
  duracion_minutos: number;
  tipo_vehiculo: TipoVehiculo;
  medio_pago: MedioPago;
  tarifas: Tarifa[];
}

export interface CalculoResult {
  monto_total: number;
  monto_sin_descuento: number;
  descuento_aplicado: number;
  desglose: {
    primera_hora: number;
    fracciones_15min: number;
    total_fracciones: number;
  };
}
