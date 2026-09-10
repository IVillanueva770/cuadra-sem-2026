'use server';

import {permisionarioLogueado} from '@/lib/auth-demo/servidor';
import {asignacionDelDia, contextoValidacion, crearSesion, cuadraPorId, fechaISO} from '@/lib/datos';
import {recordarSesionPropia, rehidratarSesionesPropias} from '@/lib/datos/sesiones-propias';
import {motorReglas} from '@/lib/motor-reglas';
import type {TipoVehiculo} from '@/lib/motor-reglas/tipos';
import {buscarSesionVigente} from '@/lib/sesiones/patente-vigente';

interface RegistrarInput {
  patente: string;
  tipoVehiculo: TipoVehiculo;
  duracionMinutos: number;
  emailConductor?: string;
  modo: 'calcular' | 'confirmar';
  medio?: 'efectivo' | 'digital';
}

type RegistrarResult =
  | {ok: false; error: string}
  | {
      ok: true;
      modo: 'vigente';
      sesionId: string;
      patente: string;
      cubierta_hasta: string;
      minutos_restantes: number;
    }
  | {
      ok: true;
      modo: 'calcular';
      montoEfectivo: number;
      montoDigital: number;
      cuadraId: string;
      cuadraNombre: string;
      asignacionId: string | null;
    }
  | {ok: true; modo: 'confirmar'; sesionId: string; monto: number; medio: 'efectivo' | 'digital'};

export async function registrarEfectivo(
  input: RegistrarInput
): Promise<RegistrarResult> {
  const permisionario = await permisionarioLogueado();
  if (!permisionario) return {ok: false, error: 'No autenticado.'};

  // Obtener la asignación diaria activa
  const hoy = fechaISO();
  const asignacion = asignacionDelDia(permisionario.id, hoy);

  if (!asignacion) {
    return {
      ok: false,
      error:
        'No tenés una asignación de cuadra para hoy. Contactá a la Municipalidad.',
    };
  }

  const cuadraNombre = cuadraPorId(asignacion.cuadra_id)?.nombre_display ?? 'Cuadra asignada';

  // Cargar contexto y validar
  const ctx = contextoValidacion(asignacion.cuadra_id);
  const validacion = motorReglas.validarCobro(ctx);

  if (!validacion.permitido) {
    return {ok: false, error: validacion.mensaje_user};
  }

  // Normalizar patente
  const patente = input.patente.toUpperCase().replace(/\s/g, '');

  // Verificar si la patente ya tiene sesión vigente
  if (input.modo === 'calcular') {
    await rehidratarSesionesPropias();
    const sesionVigente = await buscarSesionVigente(patente);
    if (sesionVigente) {
      return {
        ok: true,
        modo: 'vigente',
        sesionId: sesionVigente.id,
        patente: sesionVigente.patente,
        cubierta_hasta: sesionVigente.cubierta_hasta,
        minutos_restantes: sesionVigente.minutos_restantes,
      };
    }
  }

  // Calcular AMBOS montos (efectivo y digital)
  const calculoEfectivo = motorReglas.calcularMonto({
    duracion_minutos: input.duracionMinutos,
    tipo_vehiculo: input.tipoVehiculo,
    medio_pago: 'efectivo',
    tarifas: ctx.tarifas,
  });

  const calculoDigital = motorReglas.calcularMonto({
    duracion_minutos: input.duracionMinutos,
    tipo_vehiculo: input.tipoVehiculo,
    medio_pago: 'digital_mp',
    tarifas: ctx.tarifas,
  });

  if (input.modo === 'calcular') {
    return {
      ok: true,
      modo: 'calcular',
      montoEfectivo: calculoEfectivo.monto_total,
      montoDigital: calculoDigital.monto_total,
      cuadraId: asignacion.cuadra_id,
      cuadraNombre,
      asignacionId: asignacion.id,
    };
  }

  // CONFIRMAR
  const medio = input.medio ?? 'efectivo';
  const calculo = medio === 'digital' ? calculoDigital : calculoEfectivo;

  const iniciada_a = new Date();
  const cubierta_hasta = new Date(
    iniciada_a.getTime() + input.duracionMinutos * 60 * 1000
  );

  // Efectivo: sesión activa al instante. Digital: extended_pending hasta que MP confirme.
  const sesion = crearSesion({
    patente,
    tipo_vehiculo: input.tipoVehiculo,
    permisionario_id: permisionario.id,
    cuadra_id: asignacion.cuadra_id,
    asignacion_id: asignacion.id,
    iniciada_a: iniciada_a.toISOString(),
    cubierta_hasta: cubierta_hasta.toISOString(),
    duracion_minutos: input.duracionMinutos,
    monto: calculo.monto_total,
    monto_sin_descuento: calculo.monto_sin_descuento,
    medio_pago: medio === 'digital' ? 'digital_mp' : 'efectivo',
    status: medio === 'digital' ? 'extended_pending' : 'active',
    conductor_email: input.emailConductor || null,
  });
  await recordarSesionPropia(sesion);

  return {ok: true, modo: 'confirmar', sesionId: sesion.id, monto: calculo.monto_total, medio};
}
