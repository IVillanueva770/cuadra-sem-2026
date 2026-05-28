export * from './tipos';
import {validarCobro} from './validaciones';
import {calcularMonto} from './tarifas';
import {turnoActivo, minutosHastaFinTurno} from './horarios';
import {esFeriado} from './feriados';

export const motorReglas = {
  validarCobro,
  calcularMonto,
  turnoActivo,
  minutosHastaFinTurno,
  esFeriado,
};
