import type {HorarioTurno, Turno} from './tipos';

/**
 * Determina qué turno está activo en un momento dado.
 * Retorna null si no hay ningún turno activo (gap entre turnos).
 */
export function turnoActivo(
  momento: Date,
  horarios: HorarioTurno[]
): Turno | null {
  const diaSemana = momento.getDay();
  const horaMinuto = momento.getHours() * 60 + momento.getMinutes();

  for (const h of horarios) {
    if (h.dia_semana !== diaSemana) continue;

    const [hiH, hiM] = h.hora_inicio.split(':').map(Number);
    const [hfH, hfM] = h.hora_fin.split(':').map(Number);
    const inicio = hiH * 60 + hiM;
    const fin = hfH * 60 + hfM;

    if (inicio < fin) {
      if (horaMinuto >= inicio && horaMinuto < fin) {
        return h.turno;
      }
    } else {
      // Cruza medianoche
      if (horaMinuto >= inicio || horaMinuto < fin) {
        return h.turno;
      }
    }
  }

  return null;
}

/**
 * Cuántos minutos faltan para que termine el turno actual.
 */
export function minutosHastaFinTurno(
  momento: Date,
  horarios: HorarioTurno[]
): number {
  const turno = turnoActivo(momento, horarios);
  if (!turno) return 0;

  const diaSemana = momento.getDay();
  const horaActual = momento.getHours() * 60 + momento.getMinutes();

  const h = horarios.find(
    (h) => h.turno === turno && h.dia_semana === diaSemana
  );
  if (!h) return 0;

  const [hfH, hfM] = h.hora_fin.split(':').map(Number);
  const fin = hfH * 60 + hfM;

  if (fin > horaActual) {
    return fin - horaActual;
  } else {
    return 24 * 60 - horaActual + fin;
  }
}
