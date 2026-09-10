'use client';

import {useEffect, useState, useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {motion} from 'motion/react';

const RANGOS = [
  {value: 'hoy', label: 'Hoy'},
  {value: '7d', label: '7 días'},
  {value: '30d', label: '30 días'},
] as const;

type RangoValue = (typeof RANGOS)[number]['value'];

interface RangoSelectorProps {
  actual: RangoValue;
}

export default function RangoSelector({actual}: RangoSelectorProps) {
  const router = useRouter();
  // Estado optimista: el toggle se mueve al instante aunque los datos tarden en volver.
  const [seleccion, setSeleccion] = useState<RangoValue>(actual);
  const [isPending, startTransition] = useTransition();

  // Cuando la navegación termina (cambia la prop), sincronizamos.
  useEffect(() => setSeleccion(actual), [actual]);

  function elegir(value: RangoValue) {
    if (value === seleccion) return;
    setSeleccion(value); // animación inmediata
    startTransition(() => router.push(`/admin?rango=${value}`, {scroll: false}));
  }

  return (
    <div
      className="inline-flex items-center gap-1 rounded-xl p-1"
      style={{backgroundColor: 'var(--bg-subtle)', opacity: isPending ? 0.85 : 1, transition: 'opacity .2s'}}
      role="group"
      aria-label="Filtrar por rango temporal"
    >
      {RANGOS.map((r) => {
        const isActive = r.value === seleccion;
        return (
          <button
            key={r.value}
            onClick={() => elegir(r.value)}
            className="relative px-4 py-1.5 text-sm font-medium rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{color: isActive ? 'var(--fg1)' : 'var(--fg3)', zIndex: 1, transition: 'color .25s'}}
            aria-pressed={isActive}
          >
            {isActive && (
              <motion.div
                layoutId="rango-activo"
                className="absolute inset-0 rounded-lg"
                style={{backgroundColor: 'var(--bg-surface)', boxShadow: '0 1px 3px rgba(16,24,40,0.12)'}}
                transition={{type: 'spring', stiffness: 500, damping: 38, mass: 0.7}}
              />
            )}
            <span className="relative z-10">{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
