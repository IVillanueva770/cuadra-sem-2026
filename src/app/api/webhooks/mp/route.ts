/**
 * Webhook de MercadoPago.
 *
 * Recibe notificaciones de pago, valida la firma HMAC, audita el evento en
 * el registro de webhooks y actualiza el status de la sesión consultando el
 * estado real del pago en la API de MP.
 *
 * Desde la salida de Supabase (2026-09) escribe en el store en memoria: la
 * sesión que busca solo existe si la instancia que atiende el webhook es la
 * misma que creó el pago. En sandbox eso es lo habitual; si no, responde
 * `session_not_found` y el flujo sigue igual (el status ya se fijó al crear
 * el pago, ver pagar/[qrcode]/actions.ts).
 *
 * Contrato de respuestas (cubierto por tests/integration/webhook-mp.test.ts):
 *   - Body no-JSON                  -> 400 { error: 'invalid_json' }
 *   - Evento no-payment             -> 200 { skipped: true, reason: 'not_payment' }
 *   - Evento payment sin data.id    -> 400 { error: 'missing_payment_id' }
 *   - Evento payment, sesión ausente-> 200 { skipped: true, reason: 'session_not_found' }
 *   - Evento payment procesado      -> 200 { ok: true, session_id }
 *   - Firma inválida (modo estricto)-> 401 { error: 'invalid_signature' }
 */
import {NextRequest, NextResponse} from 'next/server';
import crypto from 'crypto';
import {
  actualizarSesion,
  marcarWebhookProcesado,
  registrarWebhookEvent,
  sesionPorMpPaymentId,
  type StatusSesion,
} from '@/lib/datos';

// crypto (HMAC) y el SDK de MercadoPago requieren el runtime de Node.
export const runtime = 'nodejs';

/**
 * Valida la firma HMAC-SHA256 de MercadoPago.
 * x-signature: "ts=<timestamp>,v1=<hash>"
 * manifest:    "id:<data.id>;request-id:<x-request-id>;ts:<ts>;"
 */
function firmaMPValida(args: {
  signature: string | null;
  requestId: string | null;
  dataId: string;
  secret: string;
}): boolean {
  if (!args.signature) return false;
  let ts = '';
  let hash = '';
  for (const part of args.signature.split(',')) {
    const [k, v] = part.split('=');
    if (!k || v === undefined) continue;
    if (k.trim() === 'ts') ts = v.trim();
    if (k.trim() === 'v1') hash = v.trim();
  }
  if (!ts || !hash) return false;

  const manifest = `id:${args.dataId};request-id:${args.requestId ?? ''};ts:${ts};`;
  const expected = crypto
    .createHmac('sha256', args.secret)
    .update(manifest)
    .digest('hex');

  // Comparación en tiempo constante
  const a = Buffer.from(expected);
  const b = Buffer.from(hash);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  // Leemos el body como texto: necesario para la validación HMAC.
  const rawBody = await req.text();

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({error: 'invalid_json'}, {status: 400});
  }

  const dataObj =
    data.data && typeof data.data === 'object'
      ? (data.data as Record<string, unknown>)
      : null;
  const paymentId = dataObj?.id ?? null;

  // --- Validación de firma HMAC (solo si hay secret configurado) ---
  const webhookSecret = process.env.MP_WEBHOOK_SECRET;
  if (webhookSecret) {
    const url = new URL(req.url);
    // MP manda data.id como query param; si no, usamos el del body.
    const dataIdParaFirma =
      url.searchParams.get('data.id') ?? (paymentId ? String(paymentId) : '');
    const valido = firmaMPValida({
      signature: req.headers.get('x-signature'),
      requestId: req.headers.get('x-request-id'),
      dataId: dataIdParaFirma,
      secret: webhookSecret,
    });
    if (!valido) {
      console.warn('MP webhook: firma inválida', {dataId: dataIdParaFirma});
      // En modo estricto rechazamos; en MVP logueamos y seguimos.
      if (process.env.STRICT_WEBHOOK === 'true') {
        return NextResponse.json({error: 'invalid_signature'}, {status: 401});
      }
    }
  }

  // --- Auditoría: registrar el evento ---
  const eventType = typeof data.type === 'string' ? data.type : 'unknown';
  registrarWebhookEvent({
    source: 'mercadopago',
    event_type: eventType,
    payment_id: paymentId ? String(paymentId) : null,
    payload: data,
    processed: false,
    error_message: null,
  });

  // Solo procesamos eventos tipo "payment"
  if (data.type !== 'payment') {
    return NextResponse.json({skipped: true, reason: 'not_payment'});
  }

  if (!paymentId) {
    return NextResponse.json({error: 'missing_payment_id'}, {status: 400});
  }

  // Buscar la sesión asociada al pago
  const session = sesionPorMpPaymentId(String(paymentId));

  if (!session) {
    return NextResponse.json({skipped: true, reason: 'session_not_found'});
  }

  // Consultar el status real del pago en MP y mapearlo al status de la sesión.
  // Import dinámico: evita cargar el SDK de MP (y su config) fuera de este path.
  let nuevoStatus: StatusSesion = 'active';
  try {
    const {mpClient, Payment} = await import('@/lib/mp/server');
    const payment = await new Payment(mpClient).get({id: String(paymentId)});
    nuevoStatus =
      payment.status === 'approved'
        ? 'active'
        : payment.status === 'rejected' || payment.status === 'cancelled'
          ? 'rejected'
          : session.status;
  } catch (e) {
    // Si la consulta a MP falla, mantenemos el comportamiento previo (active).
    console.error('MP webhook: fallo al consultar el pago en MP', e);
  }

  actualizarSesion(session.id, {status: nuevoStatus});

  // Marcar el evento como procesado
  marcarWebhookProcesado(String(paymentId));

  return NextResponse.json({ok: true, session_id: session.id});
}

// Permite el GET de verificación desde el panel de MP.
export async function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Cuadra webhook MP. Use POST para notificaciones.',
  });
}
