import type {ContextoValidacion, ValidacionResult} from './tipos';
import {turnoActivo, minutosHastaFinTurno} from './horarios';
import {esFeriado} from './feriados';

// ⚠️ DEMO ONLY — permite cobrar fuera de horario para grabar el video.
// Poner en false para restaurar el cumplimiento normativo real (Ord. 12.170).
const DEMO_PERMITIR_FUERA_DE_HORARIO = true;

export function validarCobro(ctx: ContextoValidacion): ValidacionResult {
  const turno = turnoActivo(ctx.momento, ctx.horarios);

  if (DEMO_PERMITIR_FUERA_DE_HORARIO) {
    // Salteamos sólo los bloqueos por tiempo (turno/horario/feriado/fin de turno).
    // El resto del flujo (cálculo de monto, patente vigente, etc.) sigue igual.
    return {permitido: true, turno_actual: turno ?? 'diurno'};
  }

  if (!turno) {
    return {
      permitido: false,
      razon: 'sin_turno_activo',
      mensaje_user: 'Fuera de horario. No se puede registrar cobro ahora.',
    };
  }

  if (turno === 'diurno' && !ctx.cuadra.habilitada_diurno) {
    return {
      permitido: false,
      razon: 'cuadra_no_habilitada_diurno',
      mensaje_user: 'Esta cuadra no está habilitada para cobro diurno.',
    };
  }

  if (turno === 'nocturno' && !ctx.cuadra.habilitada_nocturno) {
    return {
      permitido: false,
      razon: 'cuadra_no_habilitada_nocturno',
      mensaje_user: 'Esta cuadra no está habilitada para cobro nocturno.',
    };
  }

  const feriado = esFeriado(ctx.momento, ctx.feriados);
  if (feriado) {
    if (turno === 'diurno' && !feriado.permite_diurno) {
      return {
        permitido: false,
        razon: 'feriado_no_permite_diurno',
        mensaje_user: `Hoy es ${feriado.descripcion}. No se cobra estacionamiento diurno en feriados.`,
      };
    }
    if (turno === 'nocturno' && !feriado.permite_nocturno) {
      return {
        permitido: false,
        razon: 'feriado_no_permite_nocturno',
        mensaje_user: `Hoy es ${feriado.descripcion}. Tampoco se cobra de noche.`,
      };
    }
  }

  const minutosRestantes = minutosHastaFinTurno(ctx.momento, ctx.horarios);
  if (minutosRestantes < ctx.config.minutos_min_antes_fin_turno) {
    return {
      permitido: false,
      razon: 'fin_turno_proximo',
      mensaje_user: `Faltan ${minutosRestantes} minutos para fin de turno. No se puede registrar nueva sesión.`,
    };
  }

  return {permitido: true, turno_actual: turno};
}
