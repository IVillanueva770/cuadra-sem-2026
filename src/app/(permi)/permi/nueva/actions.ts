'use server';

import {createClient, createServiceClient} from '@/lib/supabase/server';
import {cargarContextoValidacion} from '@/lib/motor-reglas/db-helpers';
import {motorReglas} from '@/lib/motor-reglas';
import type {TipoVehiculo} from '@/lib/motor-reglas/tipos';

interface RegistrarInput {
  patente: string;
  tipoVehiculo: TipoVehiculo;
  duracionMinutos: number;
  emailConductor?: string;
  modo: 'calcular' | 'confirmar';
}

type RegistrarResult =
  | {ok: false; error: string}
  | {
      ok: true;
      modo: 'calcular';
      monto: number;
      montoSinDescuento: number;
      cuadraId: string;
      cuadraNombre: string;
      asignacionId: string | null;
    }
  | {ok: true; modo: 'confirmar'; sesionId: string; monto: number};

export async function registrarEfectivo(
  input: RegistrarInput
): Promise<RegistrarResult> {
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  // Obtener el usuario autenticado
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {ok: false, error: 'No autenticado.'};

  // Obtener el permisionario
  const {data: permisionario} = await supabase
    .from('permisionarios')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!permisionario) {
    return {ok: false, error: 'No encontramos tu perfil de permisionario.'};
  }

  // Obtener la asignación diaria activa
  const hoy = new Date().toISOString().slice(0, 10);
  const {data: asignacion} = await supabase
    .from('asignaciones_diarias')
    .select('id, cuadra_id')
    .eq('permisionario_id', permisionario.id)
    .eq('fecha', hoy)
    .order('created_at', {ascending: false})
    .limit(1)
    .maybeSingle();

  if (!asignacion) {
    return {
      ok: false,
      error:
        'No tenés una asignación de cuadra para hoy. Contactá a la Municipalidad.',
    };
  }

  // Obtener nombre de la cuadra
  const {data: cuadra} = await supabase
    .from('cuadras_habilitadas')
    .select('nombre_display')
    .eq('id', asignacion.cuadra_id)
    .single();

  const cuadraNombre = cuadra?.nombre_display ?? 'Cuadra asignada';

  // Cargar contexto y validar
  const ctx = await cargarContextoValidacion(asignacion.cuadra_id);
  const validacion = motorReglas.validarCobro(ctx);

  if (!validacion.permitido) {
    return {ok: false, error: validacion.mensaje_user};
  }

  // Verificar que la patente no tenga sesión activa
  const patente = input.patente.toUpperCase().replace(/\s/g, '');
  const {data: sesionActiva} = await supabase
    .from('parking_sessions')
    .select('id, cubierta_hasta')
    .eq('patente', patente)
    .eq('status', 'active')
    .maybeSingle();

  if (sesionActiva) {
    return {
      ok: false,
      error: `La patente ${patente} ya tiene una sesión activa hasta las ${new Date(
        sesionActiva.cubierta_hasta
      ).toLocaleTimeString('es-AR', {
        timeZone: 'America/Argentina/Salta',
        hour: '2-digit',
        minute: '2-digit',
      })}.`,
    };
  }

  // Calcular monto
  const calculo = motorReglas.calcularMonto({
    duracion_minutos: input.duracionMinutos,
    tipo_vehiculo: input.tipoVehiculo,
    medio_pago: 'efectivo',
    tarifas: ctx.tarifas,
  });

  if (input.modo === 'calcular') {
    return {
      ok: true,
      modo: 'calcular',
      monto: calculo.monto_total,
      montoSinDescuento: calculo.monto_sin_descuento,
      cuadraId: asignacion.cuadra_id,
      cuadraNombre,
      asignacionId: asignacion.id,
    };
  }

  // Confirmar: insertar sesión
  const iniciada_a = new Date();
  const cubierta_hasta = new Date(
    iniciada_a.getTime() + input.duracionMinutos * 60 * 1000
  );

  const {data: sesion, error: insertError} = await serviceClient
    .from('parking_sessions')
    .insert({
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
      medio_pago: 'efectivo',
      status: 'active',
      conductor_email: input.emailConductor || null,
    })
    .select('id')
    .single();

  if (insertError || !sesion) {
    return {
      ok: false,
      error: 'Error al registrar la sesión. Intentá de nuevo.',
    };
  }

  return {ok: true, modo: 'confirmar', sesionId: sesion.id, monto: calculo.monto_total};
}
