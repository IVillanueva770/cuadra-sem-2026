'use client';

import {useEffect, useState} from 'react';
import {initMercadoPago, Payment} from '@mercadopago/sdk-react';
import {procesarPagoTest} from './actions';
import {Card, CardContent} from '@/components/ui/card';

interface Props {
  amount: number;
}

export default function MPTestForm({amount}: Props) {
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<{status: string; paymentId?: number; error?: string} | null>(null);

  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, {locale: 'es-AR'});
    setMounted(true);
  }, []);

  if (!mounted) return <div className="body-m">Cargando Mercado Pago...</div>;

  return (
    <div>
      <Payment
        initialization={{amount}}
        customization={{
          paymentMethods: {
            creditCard: 'all',
            debitCard: 'all',
            mercadoPago: 'all',
            ticket: 'all',
          },
        }}
        onSubmit={async (formData: any) => {
          const res = await procesarPagoTest(formData);
          setResult(res);
        }}
        onError={(error: any) => {
          console.error('MP Brick error:', error);
          setResult({status: 'error', error: String(error)});
        }}
      />

      {result && (
        <Card className="mt-4">
          <CardContent
            className={`p-4 ${
              result.status === 'approved'
                ? 'bg-emerald-50 text-emerald-900'
                : result.status === 'error'
                ? 'bg-red-50 text-red-900'
                : 'bg-amber-50 text-amber-900'
            }`}
          >
            <div className="font-semibold">Resultado: {result.status}</div>
            {result.paymentId && <div className="mt-1 text-sm font-mono">Payment ID: {result.paymentId}</div>}
            {result.error && <div className="mt-1 text-sm">{result.error}</div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
