'use server';

import {createServiceClient} from '@/lib/supabase/server';
import {mpClient, Payment} from '@/lib/mp/server';

export async function pagarSesion(
  sid: string,
  paymentData: {
    token: string;
    installments: number;
    payment_method_id: string;
    issuer_id?: string;
    payer: {email: string};
  }
): Promise<{ok: true; sessionId: string; paymentId: number} | {ok: true; sessionId: string; alreadyPaid: true} | {ok: false; error: string}> {
  const supabase = createServiceClient();

  const {data: sesion} = await supabase
    .from('parking_sessions')
    .select('id, patente, monto, status, permisionario_id, cuadra_id')
    .eq('id', sid)
    .maybeSingle();

  if (!sesion) return {ok: false, error: 'Sesión no encontrada.'};
  if (sesion.status === 'active') return {ok: true, sessionId: sid, alreadyPaid: true};
  if (sesion.status === 'rejected') {
    return {
      ok: false,
      error: 'Este cobro fue cancelado. Pedile al permisionario que lo genere de nuevo.',
    };
  }

  const externalReference = `cuadra-sesion-${sid}`;

  try {
    const payment = await new Payment(mpClient).create({
      body: {
        transaction_amount: Number(sesion.monto),
        token: paymentData.token,
        description: `Estacionamiento Salta - Patente ${sesion.patente}`,
        installments: paymentData.installments,
        payment_method_id: paymentData.payment_method_id,
        issuer_id: paymentData.issuer_id ? Number(paymentData.issuer_id) : undefined,
        payer: {email: paymentData.payer.email},
        external_reference: externalReference,
        notification_url: `${process.env.APP_URL ?? ''}/api/webhooks/mp`,
        metadata: {
          parking_session_id: sesion.id,
          permisionario_id: sesion.permisionario_id,
          cuadra_id: sesion.cuadra_id,
          patente: sesion.patente,
        },
      },
      requestOptions: {idempotencyKey: externalReference},
    });

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
      .eq('id', sid);

    return {ok: true, sessionId: sid, paymentId: payment.id!};
  } catch (e) {
    console.error('pagarSesion MP error', e);
    return {ok: false, error: 'Error al procesar el pago. Probá de nuevo.'};
  }
}
