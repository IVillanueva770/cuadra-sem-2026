'use client';

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

  return (
    <div
      className="inline-flex items-center gap-1 rounded-xl p-1"
      style={{backgroundColor: 'var(--bg-subtle)'}}
      role="group"
      aria-label="Filtrar por rango temporal"
    >
      {RANGOS.map((r) => {
        const isActive = r.value === actual;
        return (
          <button
            key={r.value}
            onClick={() => router.push(`/admin?rango=${r.value}`)}
            className="relative px-4 py-1.5 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{
              color: isActive ? 'var(--fg1)' : 'var(--fg3)',
              zIndex: 1,
            }}
            aria-pressed={isActive}
          >
            {isActive && (
              <motion.div
                layoutId="rango-activo"
                className="absolute inset-0 rounded-lg"
                style={{backgroundColor: 'var(--bg-surface)'}}
                transition={{type: 'spring', stiffness: 400, damping: 35}}
              />
            )}
            <span className="relative z-10">{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
