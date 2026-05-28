import {describe, test, expect} from 'vitest';
import {validarCobro} from '../validaciones';
import {TARIFAS, HORARIOS, CONFIG} from './fixtures';

const CUADRA_DIURNA = {habilitada_diurno: true, habilitada_nocturno: false};
const CUADRA_NOCTURNA = {habilitada_diurno: false, habilitada_nocturno: true};

describe('validarCobro', () => {
  test('Lunes 14:00 cuadra diurna = permitido', () => {
    const r = validarCobro({
      momento: new Date(2026, 4, 25, 14, 0),
      cuadra: CUADRA_DIURNA,
      tarifas: TARIFAS,
      horarios: HORARIOS,
      feriados: [],
      config: CONFIG,
    });
    expect(r.permitido).toBe(true);
  });

  test('Lunes 20:55 = bloqueado por fin_turno_proximo (D21)', () => {
    const r = validarCobro({
      momento: new Date(2026, 4, 25, 20, 55),
      cuadra: CUADRA_DIURNA,
      tarifas: TARIFAS,
      horarios: HORARIOS,
      feriados: [],
      config: CONFIG,
    });
    expect(r.permitido).toBe(false);
    if (!r.permitido) expect(r.razon).toBe('fin_turno_proximo');
  });

  test('Lunes 21:30 = bloqueado por sin_turno_activo', () => {
    const r = validarCobro({
      momento: new Date(2026, 4, 25, 21, 30),
      cuadra: CUADRA_DIURNA,
      tarifas: TARIFAS,
      horarios: HORARIOS,
      feriados: [],
      config: CONFIG,
    });
    expect(r.permitido).toBe(false);
    if (!r.permitido) expect(r.razon).toBe('sin_turno_activo');
  });

  test('Feriado diurno = bloqueado', () => {
    const r = validarCobro({
      momento: new Date(2026, 4, 25, 14, 0),
      cuadra: CUADRA_DIURNA,
      tarifas: TARIFAS,
      horarios: HORARIOS,
      feriados: [{fecha: '2026-05-25', descripcion: 'Revolución de Mayo', permite_diurno: false, permite_nocturno: true}],
      config: CONFIG,
    });
    expect(r.permitido).toBe(false);
    if (!r.permitido) expect(r.razon).toBe('feriado_no_permite_diurno');
  });

  test('Cuadra no habilitada diurno = bloqueado', () => {
    const r = validarCobro({
      momento: new Date(2026, 4, 25, 14, 0),
      cuadra: CUADRA_NOCTURNA, // solo nocturno
      tarifas: TARIFAS,
      horarios: HORARIOS,
      feriados: [],
      config: CONFIG,
    });
    expect(r.permitido).toBe(false);
    if (!r.permitido) expect(r.razon).toBe('cuadra_no_habilitada_diurno');
  });

  test('Cuadra nocturna habilitada en horario nocturno = permitido', () => {
    const r = validarCobro({
      momento: new Date(2026, 4, 25, 23, 0),
      cuadra: CUADRA_NOCTURNA,
      tarifas: TARIFAS,
      horarios: HORARIOS,
      feriados: [],
      config: CONFIG,
    });
    expect(r.permitido).toBe(true);
    if (r.permitido) expect(r.turno_actual).toBe('nocturno');
  });
});
