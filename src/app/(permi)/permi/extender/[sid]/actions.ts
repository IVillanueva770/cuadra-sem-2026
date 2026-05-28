'use server';

import {createClient, createServiceClient} from '@/lib/supabase/server';
import {randomBytes} from 'crypto';

interface ExtenderInput {
  sesionId: string;
  duracionExtraMinutos: number;
}

type ExtenderResult =
  | {ok: false; error: string}
  | {ok: true; extensionId: string; emailEnviado: boolean};

export async function marcarExtension(
  input: ExtenderInput
): Promise<ExtenderResult> {
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) return {ok: false, error: 'No autenticado.'};

  const {data: permisionario} = await supabase
    .from('permisionarios')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!permisionario) {
    return {ok: false, error: 'No encontramos tu perfil.'};
  }

  // Verificar que la sesión existe y pertenece al permisionario
  const {data: sesion} = await supabase
    .from('parking_sessions')
    .select(
      'id, patente, tipo_vehiculo, cubierta_hasta, status, conductor_email, monto, duracion_minutos, cuadra_id'
    )
    .eq('id', input.sesionId)
    .eq('permisionario_id', permisionario.id)
    .single();

  if (!sesion) {
    return {ok: false, error: 'Sesión no encontrada o no te pertenece.'};
  }

  if (sesion.status !== 'active') {
    return {ok: false, error: 'Solo se puede extender una sesión activa.'};
  }

  // Calcular monto extra proporcional (misma tarifa/hora)
  const montoPorMinuto = Number(sesion.monto) / Number(sesion.duracion_minutos);
  const montoExtra = Math.round(montoPorMinuto * input.duracionExtraMinutos);

  const horaEstimadaExtension = new Date(
    new Date(sesion.cubierta_hasta).getTime() - 5 * 60 * 1000
  );

  const token = randomBytes(32).toString('hex');
  const expira = new Date(Date.now() + 30 * 60 * 1000); // 30 min

  // Insertar en sesiones_extendidas
  const {data: extension, error: extError} = await serviceClient
    .from('sesiones_extendidas')
    .insert({
      sesion_original_id: input.sesionId,
      permisionario_id: permisionario.id,
      hora_estimada_extension: horaEstimadaExtension.toISOString(),
      duracion_extra_minutos: input.duracionExtraMinutos,
      monto_extra: montoExtra,
      link_pago_token: token,
      link_pago_expira: expira.toISOString(),
      status: 'pending',
      email_enviado_a: sesion.conductor_email || null,
    })
    .select('id')
    .single();

  if (extError || !extension) {
    return {ok: false, error: 'Error al registrar la extensión. Intentá de nuevo.'};
  }

  // Actualizar status de la sesión
  await serviceClient
    .from('parking_sessions')
    .update({status: 'extended_pending'})
    .eq('id', input.sesionId);

  // Enviar email si hay conductor_email y Resend configurado
  let emailEnviado = false;

  if (sesion.conductor_email && process.env.RESEND_API_KEY) {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      const linkPago = `${baseUrl}/pagar/extension/${token}`;

      const {Resend} = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: 'Cuadra SEM <noreply@cuadra.gob.ar>',
        to: sesion.conductor_email,
        subject: `Tu estacionamiento en ${sesion.patente} está por vencer`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h1 style="font-size: 20px; color: #145FB0;">Estacionamiento por vencer</h1>
            <p>Tu sesión para <strong>${sesion.patente}</strong> está por vencer.</p>
            <p>Podés extenderla ${input.duracionExtraMinutos} minutos más pagando $${montoExtra} con Mercado Pago.</p>
            <a href="${linkPago}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background-color: #145FB0; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Pagar extensión
            </a>
            <p style="margin-top: 24px; font-size: 12px; color: #6B7280;">
              Este link expira en 30 minutos. Cuadra — Estacionamiento Medido, Municipalidad de Salta.
            </p>
          </div>
        `,
      });

      emailEnviado = true;

      await serviceClient
        .from('sesiones_extendidas')
        .update({
          email_enviado_a: sesion.conductor_email,
          email_enviado_at: new Date().toISOString(),
        })
        .eq('id', extension.id);
    } catch (e) {
      // Email falla gracefully — la extensión ya se registró
      console.warn('[cuadra] Error enviando email de extensión:', e);
    }
  }

  return {ok: true, extensionId: extension.id, emailEnviado};
}
