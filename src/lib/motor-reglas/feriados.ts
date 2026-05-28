import type {Feriado} from './tipos';

export function esFeriado(momento: Date, feriados: Feriado[]): Feriado | null {
  const fechaStr = momento.toISOString().slice(0, 10);
  return feriados.find((f) => f.fecha === fechaStr) ?? null;
}
