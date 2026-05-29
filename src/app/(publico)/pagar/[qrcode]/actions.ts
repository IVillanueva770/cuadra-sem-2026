'use server';

import {createServiceClient} from '@/lib/supabase/server';
import {motorReglas} from '@/lib/motor-reglas';
import {cargarContextoValidacion} from '@/lib/motor-reglas/db-helpers';
import {mpClient, Payment} from '@/lib/mp/server';
import {buscarSesionVigente} from '@/lib/sesiones/patente-vigente';

interface ValidarInput {
  cuadraId: string;
  tipoVehiculo: 'auto' | 'moto';
  duracion: number;
  patente: string;
}

export async function validarYCalcular(input: ValidarInput): Promise<
  | {
      ok: true;
      calculo: {
        monto_total: number;
        monto_sin_descuento: number;
        descuento: number;
      };
    }
  | {ok: false; error: string}
> {
  // Validar formato patente (ABC123 o AB123CD)
  const patenteRegex = /^([A-Z]{3}\d{3}|[A-Z]{2}\d{3}[A-Z]{2})$/;
  if (!patenteRegex.test(input.patente)) {
    return {
      ok: false,
      error: 'Patente con formato incorrecto. Usá ABC123 o AB123CD.',
    };
  }

  // Verificar que no hay sesión activa y vigente para esa patente (D12)
  const sesionVigente = await buscarSesionVigente(input.patente);
  if (sesionVigente) {
    const hasta = new Date(sesionVigente.cubierta_hasta).toLocaleTimeString('es-AR', {
      timeZone: 'America/Argentina/Salta',
      hour: '2-digit',
      minute: '2-digit',
    });
    return {
      ok: false,
      error: `Esta patente ya está cubierta hasta las ${hasta} (le quedan ${sesionVigente.minutos_restantes} min). No hace falta pagar de nuevo.`,
    };
  }

  // Cargar contexto y validar con motor
  const ctx = await cargarContextoValidacion(input.cuadraId);
  const validacion = motorReglas.validarCobro(ctx);

  if (!validacion.permitido) {
    return {ok: false, error: validacion.mensaje_user};
  }

  // Calcular monto (digital)
  const calculo = motorReglas.calcularMonto({
    duracion_minutos: input.duracion,
    tipo_vehiculo: input.tipoVehiculo,
    medio_pago: 'digital_mp',
    tarifas: ctx.tarifas,
  });

  return {
    ok: true,
    calculo: {
      monto_total: calculo.monto_total,
      monto_sin_descuento: calculo.monto_sin_descuento,
      descuento: calculo.descuento_aplicado,
    },
  };
}

interface IniciarPagoInput {
  permisionarioId: string;
  cuadraId: string;
  patente: string;
  tipoVehiculo: 'auto' | 'moto';
  duracionMinutos: number;
  email?: string;
  paymentData: {
    token: string;
    installments: number;
    payment_method_id: string;
    issuer_id?: string;
    payer: {email: string};
  };
}

export async function iniciarPago(input: IniciarPagoInput): Promise<
  {ok: true; sessionId: string; paymentId: number} | {ok: false; error: string}
> {
  const supabase = createServiceClient();

  // Re-validar (timing attacks, double submit)
  const ctx = await cargarContextoValidacion(input.cuadraId);
  const validacion = motorReglas.validarCobro(ctx);
  if (!validacion.permitido) {
    return {ok: false, error: validacion.mensaje_user};
  }

  const calculo = motorReglas.calcularMonto({
    duracion_minutos: input.duracionMinutos,
    tipo_vehiculo: input.tipoVehiculo,
    medio_pago: 'digital_mp',
    tarifas: ctx.tarifas,
  });

  // Crear parking_session ANTES de procesar pago (para tener un ID de referencia)
  const ahora = new Date();
  const cubiertaHasta = new Date(ahora.getTime() + input.duracionMinutos * 60_000);

  // Buscar asignación
  const hoy = ahora.toISOString().slice(0, 10);
  const {data: asignacion} = await supabase
    .from('asignaciones_diarias')
    .select('id')
    .eq('permisionario_id', input.permisionarioId)
    .eq('fecha', hoy)
    .order('created_at', {ascending: false})
    .limit(1)
    .maybeSingle();

  const externalReference = `cuadra-${crypto.randomUUID()}`;

  const {data: session, error: sessionError} = await supabase
    .from('parking_sessions')
    .insert({
      patente: input.patente,
      tipo_vehiculo: input.tipoVehiculo,
      permisionario_id: input.permisionarioId,
      cuadra_id: input.cuadraId,
      asignacion_id: asignacion?.id,
      iniciada_a: ahora.toISOString(),
      cubierta_hasta: cubiertaHasta.toISOString(),
      duracion_minutos: input.duracionMinutos,
      monto: calculo.monto_total,
      monto_sin_descuento: calculo.monto_sin_descuento,
      medio_pago: 'digital_mp',
      status: 'extended_pending', // hasta que MP confirme
      conductor_email: input.email || input.paymentData.payer.email,
    })
    .select('id')
    .single();

  if (sessionError || !session) {
    console.error('Session create error:', sessionError);
    return {ok: false, error: 'Error al crear sesión. Probá de nuevo.'};
  }

  // Crear payment en MP con X-Idempotency-Key
  try {
    const paymentResource = new Payment(mpClient);
    const payment = await paymentResource.create({
      body: {
        transaction_amount: calculo.monto_total,
        token: input.paymentData.token,
        description: `Estacionamiento Salta - Patente ${input.patente}`,
        installments: input.paymentData.installments,
        payment_method_id: input.paymentData.payment_method_id,
        issuer_id: input.paymentData.issuer_id
          ? Number(input.paymentData.issuer_id)
          : undefined,
        payer: {
          email: input.paymentData.payer.email,
        },
        external_reference: externalReference,
        notification_url: `${process.env.APP_URL ?? ''}/api/webhooks/mp`,
        metadata: {
          parking_session_id: session.id,
          permisionario_id: input.permisionarioId,
          cuadra_id: input.cuadraId,
          patente: input.patente,
        },
      },
      requestOptions: {
        idempotencyKey: externalReference,
      },
    });

    // Actualizar sesión con mp_payment_id
    const newStatus =
      payment.status === 'approved'
        ? 'active'
        : payment.status === 'in_process' || payment.status === 'pending'
          ? 'extended_pending'
          : 'rejected';

    await supabase
      .from('parking_sessions')
      .update({
        mp_payment_id: String(payment.id),
        mp_payment_status: payment.status,
        status: newStatus,
      })
      .eq('id', session.id);

    return {ok: true, sessionId: session.id, paymentId: payment.id!};
  } catch (error) {
    console.error('MP payment error:', error);
    // Marcar sesión como rejected
    await supabase
      .from('parking_sessions')
      .update({status: 'rejected'})
      .eq('id', session.id);
    return {ok: false, error: 'Error al procesar el pago. Probá de nuevo.'};
  }
}
