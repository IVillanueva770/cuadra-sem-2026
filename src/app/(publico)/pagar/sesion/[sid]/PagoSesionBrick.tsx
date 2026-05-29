'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {initMercadoPago, Payment} from '@mercadopago/sdk-react';
import {CircleAlert} from 'lucide-react';
import {pagarSesion} from './actions';

interface Props {
  sid: string;
  amount: number;
  email?: string;
}

// Lo que el Brick devuelve en onSubmit (subset de IPaymentFormData)
type BrickSubmitData = {
  formData: {
    token?: string;
    installments?: number;
    payment_method_id?: string;
    issuer_id?: string;
    payer?: {email?: string};
    transaction_amount?: number;
  };
};

export default function PagoSesionBrick({sid, amount, email}: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, {locale: 'es-AR'});
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500">
        Cargando medios de pago…
      </div>
    );
  }

  return (
    <div>
      <Payment
        initialization={{
          amount,
          payer: email ? {email} : undefined,
        }}
        customization={{
          // Sólo medios digitales: el efectivo lo cobra el permisionario en mano.
          // 'ticket' (Rapipago/Pago Fácil) se omite a propósito → no se ofrece.
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            mercadoPago: 'all',
          },
        }}
        onSubmit={async (param: unknown) => {
          const submitData = param as BrickSubmitData;
          const fd = submitData.formData ?? {};
          const res = await pagarSesion(sid, {
            token: fd.token ?? '',
            installments: fd.installments ?? 1,
            payment_method_id: fd.payment_method_id ?? '',
            issuer_id: fd.issuer_id,
            payer: {email: fd.payer?.email ?? email ?? ''},
          });

          if (!res.ok) {
            setError(res.error);
            return;
          }

          const okRes = res as {sessionId: string; paymentId?: number; alreadyPaid?: boolean};
          if (okRes.paymentId != null) {
            router.push(`/pagar/exito/${okRes.sessionId}?paymentId=${okRes.paymentId}`);
          } else {
            router.push(`/pagar/exito/${okRes.sessionId}`);
          }
        }}
        onError={(err) => {
          console.error('Brick error:', err);
          setError('Error en el formulario de pago');
        }}
      />
      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm text-red-900"
        >
          <CircleAlert className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
