'use server';

import {mpClient, Payment} from '@/lib/mp/server';

/**
 * Extrae un mensaje legible de un error. El SDK de MercadoPago no lanza
 * instancias de Error, sino objetos planos con la forma
 * { message, status, cause: [{ code, description }] }, por lo que String(error)
 * devolvería "[object Object]".
 */
function mensajeDeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    if (Array.isArray(e.cause) && e.cause[0] && typeof e.cause[0] === 'object') {
      const c = e.cause[0] as Record<string, unknown>;
      if (typeof c.description === 'string') return c.description;
    }
    if (typeof e.message === 'string') return e.message;
    try {
      return JSON.stringify(error);
    } catch {
      return 'Error desconocido al procesar el pago.';
    }
  }
  return String(error);
}

export async function procesarPagoTest(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): Promise<{status: string; paymentId?: number; error?: string}> {
  try {
    const payment = new Payment(mpClient);
    const result = await payment.create({
      body: {
        transaction_amount: 100,
        token: data.formData.token,
        description: 'Cuadra MP Hello World — Test',
        installments: data.formData.installments,
        payment_method_id: data.formData.payment_method_id,
        issuer_id: data.formData.issuer_id,
        payer: {
          email: data.formData.payer.email,
        },
        external_reference: `mp-test-${crypto.randomUUID()}`,
      },
      requestOptions: {
        idempotencyKey: crypto.randomUUID(),
      },
    });

    return {
      status: result.status ?? 'unknown',
      paymentId: result.id,
    };
  } catch (error) {
    console.error('procesarPagoTest error:', error);
    return {
      status: 'error',
      error: mensajeDeError(error),
    };
  }
}
