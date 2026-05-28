import type {Tarifa, HorarioTurno, ConfigSistema} from '../tipos';

export const TARIFAS: Tarifa[] = [
  {tipo_vehiculo: 'auto', monto_por_hora: 700, monto_por_fraccion_15min: 175, descuento_digital_pct: 20},
  {tipo_vehiculo: 'moto', monto_por_hora: 300, monto_por_fraccion_15min: 75, descuento_digital_pct: 20},
];

export const HORARIOS: HorarioTurno[] = [
  {turno: 'diurno', dia_semana: 1, hora_inicio: '07:00', hora_fin: '21:00'},
  {turno: 'diurno', dia_semana: 2, hora_inicio: '07:00', hora_fin: '21:00'},
  {turno: 'diurno', dia_semana: 3, hora_inicio: '07:00', hora_fin: '21:00'},
  {turno: 'diurno', dia_semana: 4, hora_inicio: '07:00', hora_fin: '21:00'},
  {turno: 'diurno', dia_semana: 5, hora_inicio: '07:00', hora_fin: '21:00'},
  {turno: 'diurno', dia_semana: 6, hora_inicio: '07:00', hora_fin: '14:00'},
  {turno: 'nocturno', dia_semana: 0, hora_inicio: '22:00', hora_fin: '05:00'},
  {turno: 'nocturno', dia_semana: 1, hora_inicio: '22:00', hora_fin: '05:00'},
  {turno: 'nocturno', dia_semana: 2, hora_inicio: '22:00', hora_fin: '05:00'},
  {turno: 'nocturno', dia_semana: 3, hora_inicio: '22:00', hora_fin: '05:00'},
  {turno: 'nocturno', dia_semana: 4, hora_inicio: '22:00', hora_fin: '05:00'},
  {turno: 'nocturno', dia_semana: 5, hora_inicio: '22:00', hora_fin: '05:00'},
  {turno: 'nocturno', dia_semana: 6, hora_inicio: '22:00', hora_fin: '05:00'},
];

export const CONFIG: ConfigSistema = {
  tolerancia_minutos: 5,
  minutos_min_antes_fin_turno: 10,
};
