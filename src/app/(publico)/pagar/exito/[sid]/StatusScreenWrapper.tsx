'use client';

import {useEffect, useState} from 'react';
import {initMercadoPago, StatusScreen} from '@mercadopago/sdk-react';

export default function StatusScreenWrapper({paymentId}: {paymentId: string}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, {locale: 'es-AR'});
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <StatusScreen initialization={{paymentId}} />;
}
