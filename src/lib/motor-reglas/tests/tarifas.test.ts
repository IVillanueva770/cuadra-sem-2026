import {describe, test, expect} from 'vitest';
import {calcularMonto} from '../tarifas';
import {TARIFAS} from './fixtures';

describe('calcularMonto - Auto', () => {
  test('1 hora exacta en efectivo = $700', () => {
    const r = calcularMonto({duracion_minutos: 60, tipo_vehiculo: 'auto', medio_pago: 'efectivo', tarifas: TARIFAS});
    expect(r.monto_total).toBe(700);
    expect(r.descuento_aplicado).toBe(0);
  });

  test('1 hora en digital = $560 (descuento 20%)', () => {
    const r = calcularMonto({duracion_minutos: 60, tipo_vehiculo: 'auto', medio_pago: 'digital_mp', tarifas: TARIFAS});
    expect(r.monto_total).toBe(560);
    expect(r.descuento_aplicado).toBe(140);
  });

  test('1h 30min en efectivo = $1050', () => {
    const r = calcularMonto({duracion_minutos: 90, tipo_vehiculo: 'auto', medio_pago: 'efectivo', tarifas: TARIFAS});
    expect(r.monto_total).toBe(1050);
    expect(r.desglose.total_fracciones).toBe(2);
  });

  test('1h 30min en digital = $840', () => {
    const r = calcularMonto({duracion_minutos: 90, tipo_vehiculo: 'auto', medio_pago: 'digital_mp', tarifas: TARIFAS});
    expect(r.monto_total).toBe(840);
    expect(r.descuento_aplicado).toBe(210);
  });

  test('2 horas en efectivo = $1400', () => {
    const r = calcularMonto({duracion_minutos: 120, tipo_vehiculo: 'auto', medio_pago: 'efectivo', tarifas: TARIFAS});
    expect(r.monto_total).toBe(1400);
  });

  test('1h 15min = $875 (1 fracción)', () => {
    const r = calcularMonto({duracion_minutos: 75, tipo_vehiculo: 'auto', medio_pago: 'efectivo', tarifas: TARIFAS});
    expect(r.monto_total).toBe(875);
    expect(r.desglose.total_fracciones).toBe(1);
  });

  test('Duración 0 = $0', () => {
    const r = calcularMonto({duracion_minutos: 0, tipo_vehiculo: 'auto', medio_pago: 'efectivo', tarifas: TARIFAS});
    expect(r.monto_total).toBe(0);
  });

  test('Duración 30 min (menos de 1h) = $700 (primera hora completa)', () => {
    const r = calcularMonto({duracion_minutos: 30, tipo_vehiculo: 'auto', medio_pago: 'efectivo', tarifas: TARIFAS});
    expect(r.monto_total).toBe(700);
  });
});

describe('calcularMonto - Moto', () => {
  test('1 hora en efectivo = $300', () => {
    const r = calcularMonto({duracion_minutos: 60, tipo_vehiculo: 'moto', medio_pago: 'efectivo', tarifas: TARIFAS});
    expect(r.monto_total).toBe(300);
  });

  test('1 hora en digital = $240', () => {
    const r = calcularMonto({duracion_minutos: 60, tipo_vehiculo: 'moto', medio_pago: 'digital_mp', tarifas: TARIFAS});
    expect(r.monto_total).toBe(240);
  });
});
