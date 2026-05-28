import {describe, test, expect} from 'vitest';
import {turnoActivo, minutosHastaFinTurno} from '../horarios';
import {HORARIOS} from './fixtures';

describe('turnoActivo', () => {
  test('Lunes 14:00 = diurno', () => {
    // 2026-05-25 es Lunes (verificar con date.getDay())
    const d = new Date(2026, 4, 25, 14, 0);
    expect(turnoActivo(d, HORARIOS)).toBe('diurno');
  });

  test('Lunes 21:30 = null (gap)', () => {
    const d = new Date(2026, 4, 25, 21, 30);
    expect(turnoActivo(d, HORARIOS)).toBe(null);
  });

  test('Lunes 23:00 = nocturno', () => {
    const d = new Date(2026, 4, 25, 23, 0);
    expect(turnoActivo(d, HORARIOS)).toBe('nocturno');
  });

  test('Lunes 03:00 = nocturno (cruza medianoche)', () => {
    const d = new Date(2026, 4, 25, 3, 0);
    expect(turnoActivo(d, HORARIOS)).toBe('nocturno');
  });

  test('Sábado 12:00 = diurno', () => {
    // 2026-05-30 es Sábado
    const d = new Date(2026, 4, 30, 12, 0);
    expect(turnoActivo(d, HORARIOS)).toBe('diurno');
  });

  test('Sábado 15:00 = null (sábado tarde sin turno)', () => {
    const d = new Date(2026, 4, 30, 15, 0);
    expect(turnoActivo(d, HORARIOS)).toBe(null);
  });

  test('Domingo 10:00 = null (no hay diurno)', () => {
    const d = new Date(2026, 4, 31, 10, 0);
    expect(turnoActivo(d, HORARIOS)).toBe(null);
  });

  test('Domingo 23:00 = nocturno', () => {
    const d = new Date(2026, 4, 31, 23, 0);
    expect(turnoActivo(d, HORARIOS)).toBe('nocturno');
  });
});

describe('minutosHastaFinTurno', () => {
  test('Lunes 20:30 quedan 30 min para fin turno diurno (21:00)', () => {
    const d = new Date(2026, 4, 25, 20, 30);
    expect(minutosHastaFinTurno(d, HORARIOS)).toBe(30);
  });

  test('Lunes 20:55 quedan 5 min', () => {
    const d = new Date(2026, 4, 25, 20, 55);
    expect(minutosHastaFinTurno(d, HORARIOS)).toBe(5);
  });

  test('Lunes 21:30 = 0 (sin turno)', () => {
    const d = new Date(2026, 4, 25, 21, 30);
    expect(minutosHastaFinTurno(d, HORARIOS)).toBe(0);
  });
});
