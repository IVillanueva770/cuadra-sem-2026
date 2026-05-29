'use client';

import {useEffect, useState, useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {QRCodeSVG} from 'qrcode.react';
import {CircleCheck, CircleAlert} from 'lucide-react';
import {createClient} from '@/lib/supabase/client';
import {formatARS} from '@/lib/utils';

interface Props {
  sid: string;
  patente: string;
  monto: number;
  duracionMinutos: number;
  pagoUrl: string;
}

function formatDuracion(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

async function cancelarCobro(sid: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from('parking_sessions')
    .update({status: 'rejected'})
    .eq('id', sid);
}

export default function CobroQRClient({sid, patente, monto, duracionMinutos, pagoUrl}: Props) {
  const router = useRouter();
  const [pagado, setPagado] = useState(false);
  const [isCancelling, startCancel] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`cobro-${sid}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'parking_sessions',
          filter: `id=eq.${sid}`,
        },
        (payload) => {
          const updated = payload.new as {status?: string};
          if (updated.status === 'active') {
            setPagado(true);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [sid]);

  function handleCancelar() {
    startCancel(async () => {
      await cancelarCobro(sid);
      router.push('/permi');
    });
  }

  if (pagado) {
    return (
      <div className="p-6 space-y-6 text-center">
        <div
          className="mx-auto flex items-center justify-center w-20 h-20 rounded-full"
          style={{backgroundColor: 'var(--success-bg)'}}
          aria-hidden="true"
        >
          <CircleCheck className="h-10 w-10" style={{color: 'var(--success)'}} />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold" style={{color: 'var(--fg1)'}}>
            Pago confirmado
          </h2>
          <p className="text-base font-mono tracking-wider" style={{color: 'var(--primary)'}}>
            {patente}
          </p>
          <p className="text-sm" style={{color: 'var(--fg2)'}}>
            {formatDuracion(duracionMinutos)} · {formatARS(monto)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/permi')}
          className="w-full h-14 rounded-[10px] text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{backgroundColor: 'var(--primary)', color: 'white'}}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold" style={{color: 'var(--fg1)'}}>
          Pago digital
        </h1>
        <p className="text-sm" style={{color: 'var(--fg2)'}}>
          Pedile al conductor que escanee este código y pague desde su celular.
        </p>
      </div>

      {/* Datos de la sesión */}
      <div
        className="rounded-2xl border divide-y"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm" style={{color: 'var(--fg2)'}}>Patente</span>
          <span className="text-base font-mono font-bold tracking-wider" style={{color: 'var(--fg1)'}}>
            {patente}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm" style={{color: 'var(--fg2)'}}>Duración</span>
          <span className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
            {formatDuracion(duracionMinutos)}
          </span>
        </div>
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <span className="text-base font-semibold" style={{color: 'var(--fg1)'}}>Total</span>
            <p className="text-xs" style={{color: 'var(--success)'}}>
              20% de descuento digital
            </p>
          </div>
          <span className="font-mono text-2xl font-bold" style={{color: 'var(--primary)'}}>
            {formatARS(monto)}
          </span>
        </div>
      </div>

      {/* QR */}
      <div className="flex flex-col items-center gap-4">
        <div
          className="rounded-2xl border p-5"
          style={{
            backgroundColor: 'white',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-1)',
          }}
        >
          <QRCodeSVG value={pagoUrl} size={220} />
        </div>
        <p className="text-xs text-center" style={{color: 'var(--fg3)'}}>
          Esperando que el conductor complete el pago…
        </p>
      </div>

      {/* Indicador animado de espera */}
      <div
        className="rounded-[10px] border p-3 flex items-center gap-2"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <CircleAlert className="h-4 w-4 flex-none animate-pulse" style={{color: 'var(--primary)'}} aria-hidden="true" />
        <span className="text-sm" style={{color: 'var(--fg2)'}}>
          Esta pantalla se actualiza automáticamente cuando el conductor pague.
        </span>
      </div>

      {/* Cancelar */}
      <button
        type="button"
        onClick={handleCancelar}
        disabled={isCancelling}
        className="w-full h-12 rounded-[10px] text-base font-medium border transition-colors hover:bg-gray-50 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        style={{borderColor: 'var(--border-strong)', color: 'var(--fg2)'}}
      >
        {isCancelling ? 'Cancelando…' : 'Cancelar cobro'}
      </button>
    </div>
  );
}
