import type {CalculoInput, CalculoResult} from './tipos';

/**
 * Cálculo según Ord 12.170:
 * - Primera hora completa.
 * - 2da hora en adelante: bloques de 15 min.
 * - Descuento 20% si digital.
 */
export function calcularMonto(input: CalculoInput): CalculoResult {
  const tarifa = input.tarifas.find(
    (t) => t.tipo_vehiculo === input.tipo_vehiculo
  );

  if (!tarifa) {
    throw new Error(`Tarifa no encontrada para ${input.tipo_vehiculo}`);
  }

  const duracion = input.duracion_minutos;

  if (duracion <= 0) {
    return {
      monto_total: 0,
      monto_sin_descuento: 0,
      descuento_aplicado: 0,
      desglose: {primera_hora: 0, fracciones_15min: 0, total_fracciones: 0},
    };
  }

  let total = tarifa.monto_por_hora;
  let totalFracciones = 0;

  if (duracion > 60) {
    const minutosExtras = duracion - 60;
    totalFracciones = Math.ceil(minutosExtras / 15);
    total += totalFracciones * tarifa.monto_por_fraccion_15min;
  }

  let descuento = 0;
  if (input.medio_pago === 'digital_mp') {
    descuento = total * (tarifa.descuento_digital_pct / 100);
  }

  return {
    monto_total: Math.round(total - descuento),
    monto_sin_descuento: Math.round(total),
    descuento_aplicado: Math.round(descuento),
    desglose: {
      primera_hora: tarifa.monto_por_hora,
      fracciones_15min: tarifa.monto_por_fraccion_15min,
      total_fracciones: totalFracciones,
    },
  };
}
