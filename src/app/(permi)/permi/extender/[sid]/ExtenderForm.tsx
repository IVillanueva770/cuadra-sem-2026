'use client';

import {useState, useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {AlertTriangle, CheckCircle2, AlertCircle, Mail} from 'lucide-react';
import {formatARS, formatHora} from '@/lib/utils';
import {marcarExtension} from './actions';

const DURACIONES_EXTRA = [15, 30, 45, 60] as const;

interface Sesion {
  id: string;
  patente: string;
  tipo_vehiculo: string;
  cubierta_hasta: string;
  conductor_email: string | null;
  monto: number;
  duracion_minutos: number;
}

interface Props {
  sesion: Sesion;
}

export default function ExtenderForm({sesion}: Props) {
  const router = useRouter();
  const [duracionExtra, setDuracionExtra] = useState<number>(30);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{
    extensionId: string;
    emailEnviado: boolean;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Calcular monto extra proporcional
  const montoPorMinuto = sesion.monto / sesion.duracion_minutos;
  const montoExtra = Math.round(montoPorMinuto * duracionExtra);

  function handleConfirmar() {
    setError(null);
    startTransition(async () => {
      const res = await marcarExtension({
        sesionId: sesion.id,
        duracionExtraMinutos: duracionExtra,
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }

      setResultado({extensionId: res.extensionId, emailEnviado: res.emailEnviado});
    });
  }

  // — ÉXITO —
  if (resultado) {
    return (
      <div className="p-6 space-y-6 text-center">
        <div
          className="mx-auto flex items-center justify-center w-16 h-16 rounded-full"
          style={{backgroundColor: 'var(--success-bg)'}}
          aria-hidden="true"
        >
          <CheckCircle2 className="h-8 w-8" style={{color: 'var(--success)'}} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold" style={{color: 'var(--fg1)'}}>
            Extensión marcada
          </h2>
          <p
            className="font-mono text-lg font-semibold tracking-wider"
            style={{color: 'var(--primary)'}}
          >
            {sesion.patente}
          </p>
          <p className="text-base" style={{color: 'var(--fg2)'}}>
            +{duracionExtra} min · {formatARS(montoExtra)}
          </p>
        </div>

        {resultado.emailEnviado && sesion.conductor_email && (
          <div
            className="flex items-center gap-2 justify-center rounded-[10px] border px-4 py-3"
            style={{
              backgroundColor: 'var(--success-bg)',
              borderColor: 'var(--success)',
              color: '#166534',
            }}
          >
            <Mail className="h-4 w-4 flex-none" aria-hidden="true" />
            <span className="text-sm">
              Email enviado a {sesion.conductor_email}
            </span>
          </div>
        )}

        {!resultado.emailEnviado && (
          <p className="text-sm" style={{color: 'var(--fg3)'}}>
            {sesion.conductor_email
              ? 'No se pudo enviar el email. El link de pago está disponible internamente.'
              : 'El conductor no dejó email. Informale del vencimiento en persona.'}
          </p>
        )}

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
      <div>
        <h1 className="text-2xl font-bold" style={{color: 'var(--fg1)'}}>
          Marcar extensión
        </h1>
        <p className="text-base mt-1" style={{color: 'var(--fg2)'}}>
          El conductor necesita más tiempo. Registrá la extensión para que pueda
          pagar digitalmente.
        </p>
      </div>

      {/* Info sesión */}
      <div
        className="rounded-2xl border p-4 space-y-1"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{color: 'var(--fg2)'}}>
            Patente
          </span>
          <span
            className="font-mono text-lg font-bold tracking-wider"
            style={{color: 'var(--fg1)'}}
          >
            {sesion.patente}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{color: 'var(--fg2)'}}>
            Vence
          </span>
          <span
            className="text-base font-semibold"
            style={{color: 'var(--warning)'}}
          >
            {formatHora(sesion.cubierta_hasta)}
          </span>
        </div>
        {sesion.conductor_email && (
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{color: 'var(--fg2)'}}>
              Email conductor
            </span>
            <span className="text-sm" style={{color: 'var(--fg3)'}}>
              {sesion.conductor_email}
            </span>
          </div>
        )}
      </div>

      {/* Aviso */}
      <div
        className="flex items-start gap-2 rounded-[10px] border px-4 py-3"
        style={{
          backgroundColor: 'var(--warning-bg)',
          borderColor: 'var(--warning)',
          color: '#92400E',
        }}
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
        <p className="text-sm">
          El conductor pagará la extensión con Mercado Pago. Hasta que pague,
          la sesión queda en estado &quot;Extensión pendiente&quot;.
        </p>
      </div>

      {/* Tiempo extra */}
      <div className="space-y-2">
        <span className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
          Tiempo extra
        </span>
        <div className="grid grid-cols-2 gap-3">
          {DURACIONES_EXTRA.map((mins) => {
            const active = duracionExtra === mins;
            const monto = Math.round(montoPorMinuto * mins);
            return (
              <button
                key={mins}
                type="button"
                onClick={() => setDuracionExtra(mins)}
                aria-pressed={active}
                disabled={isPending}
                className="rounded-[10px] border-2 py-3 px-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                style={{
                  borderColor: active ? 'var(--primary)' : 'var(--border-strong)',
                  backgroundColor: active ? 'var(--blue-50)' : 'var(--bg-surface)',
                }}
              >
                <span
                  className="block text-lg font-bold"
                  style={{color: active ? 'var(--primary)' : 'var(--fg1)'}}
                >
                  {mins} min
                </span>
                <span className="block text-sm" style={{color: 'var(--fg2)'}}>
                  {formatARS(monto)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[10px] border p-3 text-sm"
          style={{
            borderColor: 'var(--error)',
            backgroundColor: 'var(--error-bg)',
            color: '#991B1B',
          }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleConfirmar}
        disabled={isPending}
        className="w-full h-14 rounded-[10px] text-base font-semibold transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        style={{backgroundColor: 'var(--primary)', color: 'white'}}
      >
        {isPending ? 'Registrando…' : 'Confirmar extensión'}
      </button>

      <button
        type="button"
        onClick={() => router.back()}
        disabled={isPending}
        className="w-full h-12 rounded-[10px] text-base font-medium border transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
        style={{borderColor: 'var(--border-strong)', color: 'var(--fg1)'}}
      >
        Cancelar
      </button>
    </div>
  );
}
