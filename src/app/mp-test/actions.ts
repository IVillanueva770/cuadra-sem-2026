'use server';

import {mpClient, Payment} from '@/lib/mp/server';

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
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
