'use client';

import {useState} from 'react';
import Link from 'next/link';
import {motion, AnimatePresence} from 'motion/react';
import {Car, Bike, Clock, CheckCircle2, AlertTriangle, QrCode, X} from 'lucide-react';
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

function duracionMin(desde: string, hasta: string): number {
  return Math.max(0, Math.round((new Date(hasta).getTime() - new Date(desde).getTime()) / 60000));
}

function StatusBadge({status, medioPago}: {status: string; medioPago: string}) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{backgroundColor: 'var(--success-bg)', color: '#166534'}}>
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
        Activa
      </span>
    );
  }
  if (status === 'extended_pending' && medioPago === 'digital_mp') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{backgroundColor: '#FEF3C7', color: '#92400E'}}>
        <QrCode className="h-3 w-3" aria-hidden="true" />
        Esperando pago
      </span>
    );
  }
  if (status === 'extended_pending') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{backgroundColor: 'var(--warning-bg)', color: '#92400E'}}>
        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
        Extensión pendiente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{backgroundColor: 'var(--bg-subtle)', color: 'var(--fg2)'}}>
      Vencida
    </span>
  );
}

export default function SesionItem({sesion}: Props) {
  const [open, setOpen] = useState(false);
  const isActive = sesion.status === 'active';
  const mins = isActive ? minutosRestantes(sesion.cubierta_hasta) : 0;
  const VehicleIcon = sesion.tipo_vehiculo === 'auto' ? Car : Bike;
  const lid = `sesion-${sesion.id}`;

  return (
    <>
      {/* ── Card (tocable: abre el foco) ── */}
      <motion.button
        layoutId={lid}
        type="button"
        onClick={() => setOpen(true)}
        whileTap={{scale: 0.985}}
        className="block w-full text-left rounded-2xl border p-4 space-y-3 transition-shadow hover:shadow-[var(--shadow-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: isActive ? 'var(--primary)' : 'var(--border)',
          boxShadow: 'var(--shadow-1)',
          borderWidth: isActive ? '2px' : '1px',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-none" style={{backgroundColor: isActive ? 'var(--blue-50)' : 'var(--bg-subtle)', color: isActive ? 'var(--primary)' : 'var(--fg3)'}} aria-hidden="true">
              <VehicleIcon className="h-5 w-5" />
            </div>
            <div>
              <span className="font-mono text-xl font-semibold tracking-wider block" style={{color: 'var(--fg1)'}}>{sesion.patente}</span>
              <span className="text-sm" style={{color: 'var(--fg2)'}}>{sesion.tipo_vehiculo === 'auto' ? 'Auto' : 'Moto'} · Iniciada {formatHora(sesion.iniciada_a)}</span>
            </div>
          </div>
          <div className="text-right flex-none">
            <span className="font-mono text-lg font-semibold block" style={{color: 'var(--fg1)'}}>{formatARS(sesion.monto)}</span>
            <span className="text-xs" style={{color: 'var(--fg3)'}}>{sesion.medio_pago === 'efectivo' ? 'Efectivo' : 'Digital'}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <StatusBadge status={sesion.status} medioPago={sesion.medio_pago} />
          {isActive ? (
            <div className="flex items-center gap-1 text-sm" style={{color: mins <= 10 ? 'var(--warning)' : 'var(--fg2)'}}>
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>{mins > 0 ? `Vence en ${mins} min` : `Vence ${formatHora(sesion.cubierta_hasta)}`}</span>
            </div>
          ) : (
            <span className="text-sm" style={{color: 'var(--fg3)'}}>Venció {formatHora(sesion.cubierta_hasta)}</span>
          )}
        </div>
      </motion.button>

      {/* ── Foco: la misma card al frente y más grande ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center p-5"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.2}}
            style={{backgroundColor: 'rgba(16,24,40,0.5)', backdropFilter: 'blur(3px)'}}
            onClick={() => setOpen(false)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              layoutId={lid}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border p-6"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                borderWidth: isActive ? '2px' : '1px',
                boxShadow: '0 24px 70px rgba(16,24,40,0.4)',
              }}
            >
              <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 0.12}}>
                {/* Encabezado */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl flex-none" style={{backgroundColor: isActive ? 'var(--blue-50)' : 'var(--bg-subtle)', color: isActive ? 'var(--primary)' : 'var(--fg3)'}} aria-hidden="true">
                      <VehicleIcon className="h-6 w-6" />
                    </div>
                    <StatusBadge status={sesion.status} medioPago={sesion.medio_pago} />
                  </div>
                  <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--bg-subtle)] active:scale-95" style={{color: 'var(--fg3)'}}>
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Patente — grande y clara */}
                <p className="font-mono font-bold tracking-widest leading-none" style={{color: 'var(--fg1)', fontSize: '2.6rem'}}>{sesion.patente}</p>
                <p className="text-base mt-1" style={{color: 'var(--fg2)'}}>{sesion.tipo_vehiculo === 'auto' ? 'Automóvil' : 'Motocicleta'}</p>

                {/* Datos grandes */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl p-4" style={{backgroundColor: 'var(--bg-subtle)'}}>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{color: 'var(--fg3)'}}>Inició</p>
                    <p className="font-mono text-2xl font-bold" style={{color: 'var(--fg1)'}}>{formatHora(sesion.iniciada_a)}</p>
                  </div>
                  <div className="rounded-2xl p-4" style={{backgroundColor: isActive ? 'var(--blue-50)' : 'var(--bg-subtle)'}}>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{color: 'var(--fg3)'}}>{isActive ? 'Vence' : 'Venció'}</p>
                    <p className="font-mono text-2xl font-bold" style={{color: isActive ? 'var(--primary)' : 'var(--fg1)'}}>{formatHora(sesion.cubierta_hasta)}</p>
                  </div>
                </div>

                {isActive && (
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl py-3" style={{backgroundColor: mins <= 10 ? 'var(--warning-bg)' : 'var(--success-bg)'}}>
                    <Clock className="h-5 w-5" style={{color: mins <= 10 ? 'var(--warning)' : '#166534'}} aria-hidden="true" />
                    <span className="text-lg font-semibold" style={{color: mins <= 10 ? 'var(--warning)' : '#166534'}}>{mins > 0 ? `Quedan ${mins} minutos` : 'Por vencer'}</span>
                  </div>
                )}

                {/* Monto / medio / duración */}
                <div className="mt-4 flex items-end justify-between border-t pt-4" style={{borderColor: 'var(--border)'}}>
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-0.5" style={{color: 'var(--fg3)'}}>{sesion.medio_pago === 'efectivo' ? 'Cobrado en efectivo' : 'Cobrado digital'}</p>
                    <p className="text-xs" style={{color: 'var(--fg3)'}}>Duración {duracionMin(sesion.iniciada_a, sesion.cubierta_hasta)} min</p>
                  </div>
                  <span className="font-mono text-3xl font-bold" style={{color: 'var(--fg1)'}}>{formatARS(sesion.monto)}</span>
                </div>

                {/* Acción */}
                {isActive && sesion.status !== 'extended_pending' && (
                  <Link href={`/permi/extender/${sesion.id}`} className="mt-5 flex items-center justify-center gap-2 w-full h-12 rounded-[12px] text-base font-semibold transition-all hover:brightness-95 active:scale-[0.98]" style={{backgroundColor: 'var(--primary)', color: 'var(--on-primary)'}}>
                    <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                    Agregar tiempo (extensión)
                  </Link>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
