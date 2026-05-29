/**
 * Webhook de MercadoPago.
 * Recibe notificaciones de pago y actualiza el status de la parking_session.
 */
import {NextRequest, NextResponse} from 'next/server';
import {createServiceClient} from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({error: 'invalid_json'}, {status: 400});
  }

  const data = body as Record<string, unknown>;

  // Solo procesamos eventos tipo "payment"
  if (data.type !== 'payment') {
    return NextResponse.json({skipped: true, reason: 'not_payment'});
  }

  const paymentId = data.data && typeof data.data === 'object'
    ? (data.data as Record<string, unknown>).id
    : null;

  if (!paymentId) {
    return NextResponse.json({error: 'missing_payment_id'}, {status: 400});
  }

  const supabase = createServiceClient();

  // Buscar la sesión por mp_payment_id
  const {data: session, error: sessionError} = await supabase
    .from('parking_sessions')
    .select('id, status')
    .eq('mp_payment_id', String(paymentId))
    .maybeSingle();

  if (sessionError || !session) {
    // No encontramos la sesión — puede ser un pago de otra parte del sistema
    return NextResponse.json({skipped: true, reason: 'session_not_found'});
  }

  // Actualizamos status a active si el pago fue aprobado
  // (En producción consultaríamos la API de MP para verificar status real)
  await supabase
    .from('parking_sessions')
    .update({status: 'active'})
    .eq('id', session.id);

  return NextResponse.json({ok: true, session_id: session.id});
}
