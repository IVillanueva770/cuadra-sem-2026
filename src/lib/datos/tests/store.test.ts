/**
 * Tests del store en memoria: lo que antes garantizaba Postgres (unicidad,
 * agregados, expiración) ahora lo garantiza este módulo, así que se prueba acá.
 *
 * Qué NO ve este test: el comportamiento entre instancias de Vercel (la cookie
 * de sesiones propias se prueba a mano) y el reloj real (se inyecta `ahora`).
 */

import {beforeEach, describe, expect, test} from 'vitest';
import {generarDia} from '../semilla';
import {
  actualizarSesion,
  asignacionDelDia,
  contextoValidacion,
  crearSesion,
  metricasDiarias,
  obtenerSesion,
  permisionarioPorQr,
  reiniciarStore,
  sesionVigentePorPatente,
  sesionesActivas,
  sesionesContables,
  sesionesDelPermisionarioHoy,
} from '../store';

// Un jueves cualquiera, a las 12:00 de Salta (15:00 UTC)
const AHORA = new Date('2026-09-10T15:00:00Z');
const HOY = '2026-09-10';

beforeEach(() => reiniciarStore());

describe('semilla determinista', () => {
  test('el mismo día genera exactamente lo mismo dos veces', () => {
    const a = generarDia(HOY);
    const b = generarDia(HOY);
    expect(a.sesiones.length).toBeGreaterThan(400);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  test('días distintos generan actividad distinta', () => {
    const a = generarDia('2026-09-10');
    const b = generarDia('2026-09-11');
    expect(a.sesiones[0].id).not.toBe(b.sesiones[0].id);
  });

  test('el domingo no hay turno diurno', () => {
    const domingo = generarDia('2026-09-13');
    expect(domingo.asignaciones).toHaveLength(0);
    expect(domingo.sesiones).toHaveLength(0);
  });

  test('hay 14 asignaciones por día (los 14 permisionarios activos) y la demo tiene la suya', () => {
    const d = generarDia(HOY);
    expect(d.asignaciones).toHaveLength(14);
    const permi = permisionarioPorQr('CUADRA-001');
    expect(permi).not.toBeNull();
    expect(asignacionDelDia(permi!.id, HOY)).not.toBeNull();
  });

  test('las sesiones sembradas cobran exactamente lo que dice el motor de reglas', () => {
    const d = generarDia(HOY);
    const auto1hDigital = d.sesiones.find(
      (s) => s.tipo_vehiculo === 'auto' && s.duracion_minutos === 60 && s.medio_pago === 'digital_mp'
    );
    expect(auto1hDigital?.monto).toBe(560);
    expect(auto1hDigital?.monto_sin_descuento).toBe(700);
  });
});

describe('estado derivado del reloj', () => {
  test('las sesiones sembradas cuya ventana cubre el momento están activas, las demás no', () => {
    const activas = sesionesActivas(1000, AHORA);
    expect(activas.length).toBeGreaterThan(0);
    for (const s of activas) {
      expect(new Date(s.iniciada_a) <= AHORA).toBe(true);
      expect(new Date(s.cubierta_hasta) > AHORA).toBe(true);
    }
  });

  test('una sesión sembrada que todavía no empezó no aparece en el día', () => {
    const temprano = new Date('2026-09-10T10:05:00Z'); // 07:05 Salta
    const todas = sesionesContables(HOY, HOY, temprano);
    for (const s of todas) expect(new Date(s.iniciada_a) <= temprano).toBe(true);
    expect(todas.length).toBeLessThan(sesionesContables(HOY, HOY, AHORA).length);
  });

  test('una sesión creada en vivo vence sola pasada la tolerancia', () => {
    const s = crearSesion({
      patente: 'TST999',
      tipo_vehiculo: 'auto',
      permisionario_id: 'permi-001',
      cuadra_id: 'cuadra-001',
      asignacion_id: null,
      iniciada_a: AHORA.toISOString(),
      cubierta_hasta: new Date(AHORA.getTime() + 60 * 60_000).toISOString(),
      duracion_minutos: 60,
      monto: 560,
      monto_sin_descuento: 700,
      medio_pago: 'digital_mp',
      status: 'active',
      conductor_email: null,
    });
    expect(obtenerSesion(s.id, AHORA)?.status).toBe('active');
    const unMinutoDespues = new Date(AHORA.getTime() + 61 * 60_000);
    expect(obtenerSesion(s.id, unMinutoDespues)?.status).toBe('active'); // dentro de la tolerancia
    const despuesDeTolerancia = new Date(AHORA.getTime() + 66 * 60_000);
    expect(obtenerSesion(s.id, despuesDeTolerancia)?.status).toBe('expired');
  });
});

describe('patente vigente', () => {
  test('encuentra la sesión viva por patente y no una patente ajena', () => {
    crearSesion({
      patente: 'ABC123',
      tipo_vehiculo: 'auto',
      permisionario_id: 'permi-001',
      cuadra_id: 'cuadra-001',
      asignacion_id: null,
      iniciada_a: AHORA.toISOString(),
      cubierta_hasta: new Date(AHORA.getTime() + 30 * 60_000).toISOString(),
      duracion_minutos: 30,
      monto: 560,
      monto_sin_descuento: 700,
      medio_pago: 'efectivo',
      status: 'active',
      conductor_email: null,
    });
    expect(sesionVigentePorPatente('abc 123', AHORA)?.patente).toBe('ABC123');
    expect(sesionVigentePorPatente('ZZZ999', AHORA)).toBeNull();
  });
});

describe('escrituras', () => {
  test('actualizar una sesión sembrada la convierte en viva y la sembrada queda intacta', () => {
    const sembrada = sesionesContables(HOY, HOY, AHORA).find((s) => s.sembrada)!;
    const antes = generarDia(HOY).sesiones.find((s) => s.id === sembrada.id)!;
    actualizarSesion(sembrada.id, {status: 'left_early', liberada_por: 'conductor'});
    expect(obtenerSesion(sembrada.id, AHORA)?.status).toBe('left_early');
    expect(obtenerSesion(sembrada.id, AHORA)?.sembrada).toBe(false);
    expect(antes.status).toBe('expired');
  });

  test('las sesiones nuevas del permisionario aparecen en su día y en las métricas', () => {
    const permi = permisionarioPorQr('CUADRA-001')!;
    const antes = sesionesDelPermisionarioHoy(permi.id, AHORA).length;
    const recaudacionAntes = metricasDiarias(HOY, HOY, AHORA)
      .filter((m) => m.permisionario_id === permi.id)
      .reduce((acc, m) => acc + m.recaudacion_total, 0);
    crearSesion({
      patente: 'NEW001',
      tipo_vehiculo: 'moto',
      permisionario_id: permi.id,
      cuadra_id: 'cuadra-001',
      asignacion_id: null,
      iniciada_a: AHORA.toISOString(),
      cubierta_hasta: new Date(AHORA.getTime() + 60 * 60_000).toISOString(),
      duracion_minutos: 60,
      monto: 300,
      monto_sin_descuento: 300,
      medio_pago: 'efectivo',
      status: 'active',
      conductor_email: null,
    });
    expect(sesionesDelPermisionarioHoy(permi.id, AHORA)).toHaveLength(antes + 1);
    const recaudacionDespues = metricasDiarias(HOY, HOY, AHORA)
      .filter((m) => m.permisionario_id === permi.id)
      .reduce((acc, m) => acc + m.recaudacion_total, 0);
    expect(recaudacionDespues).toBe(recaudacionAntes + 300);
  });
});

describe('contexto del motor de reglas', () => {
  test('sale con las tarifas, horarios, feriados y config de la semilla', () => {
    const ctx = contextoValidacion('cuadra-001', AHORA);
    expect(ctx.tarifas).toHaveLength(2);
    expect(ctx.horarios).toHaveLength(13);
    expect(ctx.feriados.length).toBe(14);
    expect(ctx.config.tolerancia_minutos).toBe(5);
    expect(ctx.cuadra.habilitada_diurno).toBe(true);
  });
});
