'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';

interface Props {
  /** Cada cuántos segundos se vuelve a pedir la página al servidor. */
  segundos?: number;
}

/**
 * Reemplazo del realtime de Supabase: vuelve a renderizar la página desde el
 * servidor cada N segundos. Sin base ni websockets, es la forma más simple de
 * que un dashboard refleje lo que otro celular acaba de cobrar.
 */
export default function AutoRefresh({segundos = 10}: Props) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), segundos * 1000);
    return () => clearInterval(id);
  }, [router, segundos]);
  return null;
}
