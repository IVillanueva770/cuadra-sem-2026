'use client';

import Link from 'next/link';
import {Car, Bike, Clock, CheckCircle2, AlertTriangle} from 'lucide-react';
import {formatARS, formatHora} from '@/lib/utils';

interface Sesion {
  id: string;
  patente: string;
  tipo_vehiculo: 'auto' | 'moto';
  monto: number;
  medio_pago: string;
  status: string;
  iniciada_a: string;
  cubierta_hasta: string;
}

interface Props {
  sesion: Sesion;
}

function minutosRestantes(hasta: string): number {
  const diff = new Date(hasta).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 60000));
}

function StatusBadge({status}: {status: string}) {
  if (status === 'active') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
        style={{backgroundColor: 'var(--success-bg)', color: '#166534'}}
      >
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
        Activa
      </span>
    );
  }
  if (status === 'extended_pending') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
        style={{backgroundColor: 'var(--warning-bg)', color: '#92400E'}}
      >
        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
        Extensión pendiente
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{backgroundColor: 'var(--bg-subtle)', color: 'var(--fg2)'}}
    >
      Vencida
    </span>
  );
}

export default function SesionItem({sesion}: Props) {
  const isActive = sesion.status === 'active';
  const mins = isActive ? minutosRestantes(sesion.cubierta_hasta) : 0;
  const VehicleIcon = sesion.tipo_vehiculo === 'auto' ? Car : Bike;

  return (
    <div
      className="rounded-2xl border p-4 space-y-3"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: isActive ? 'var(--primary)' : 'var(--border)',
        boxShadow: 'var(--shadow-1)',
        borderWidth: isActive ? '2px' : '1px',
      }}
    >
      {/* Fila principal */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl flex-none"
            style={{
              backgroundColor: isActive ? 'var(--blue-50)' : 'var(--bg-subtle)',
              color: isActive ? 'var(--primary)' : 'var(--fg3)',
            }}
            aria-hidden="true"
          >
            <VehicleIcon className="h-5 w-5" />
          </div>
          <div>
            <span
              className="font-mono text-xl font-semibold tracking-wider block"
              style={{color: 'var(--fg1)'}}
            >
              {sesion.patente}
            </span>
            <span className="text-sm" style={{color: 'var(--fg2)'}}>
              {sesion.tipo_vehiculo === 'auto' ? 'Auto' : 'Moto'} · Iniciada{' '}
              {formatHora(sesion.iniciada_a)}
            </span>
          </div>
        </div>

        <div className="text-right flex-none">
          <span
            className="font-mono text-lg font-semibold block"
            style={{color: 'var(--fg1)'}}
          >
            {formatARS(sesion.monto)}
          </span>
          <span className="text-xs" style={{color: 'var(--fg3)'}}>
            {sesion.medio_pago === 'efectivo' ? 'Efectivo' : 'Digital'}
          </span>
        </div>
      </div>

      {/* Estado y tiempo */}
      <div className="flex items-center justify-between">
        <StatusBadge status={sesion.status} />
        {isActive && (
          <div
            className="flex items-center gap-1 text-sm"
            style={{color: mins <= 10 ? 'var(--warning)' : 'var(--fg2)'}}
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>
              {mins > 0
                ? `Vence en ${mins} min`
                : `Vence a las ${formatHora(sesion.cubierta_hasta)}`}
            </span>
          </div>
        )}
        {!isActive && (
          <span className="text-sm" style={{color: 'var(--fg3)'}}>
            Venció {formatHora(sesion.cubierta_hasta)}
          </span>
        )}
      </div>

      {/* Botón extensión */}
      {isActive && sesion.status !== 'extended_pending' && (
        <Link
          href={`/permi/extender/${sesion.id}`}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-[10px] border text-sm font-medium transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{
            borderColor: 'var(--border-strong)',
            color: 'var(--fg1)',
          }}
        >
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          Marcar extensión
        </Link>
      )}
    </div>
  );
}
