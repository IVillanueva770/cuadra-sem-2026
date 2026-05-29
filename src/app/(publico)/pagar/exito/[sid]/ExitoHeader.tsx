'use client';

import {motion, useReducedMotion} from 'motion/react';
import {CircleCheck} from 'lucide-react';

interface Props {
  cubiertaHasta: string;
}

export default function ExitoHeader({cubiertaHasta}: Props) {
  const reduced = useReducedMotion();

  return (
    <header className="space-y-3 text-center">
      <motion.div
        className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50"
        aria-hidden="true"
        initial={reduced ? false : {opacity: 0, scale: 0.85}}
        animate={reduced ? {} : {opacity: 1, scale: 1}}
        transition={{duration: 0.2, ease: [0.4, 0, 0.2, 1]}}
      >
        <CircleCheck
          className="h-10 w-10 text-emerald-600"
          aria-hidden="true"
        />
      </motion.div>
      <motion.div
        initial={reduced ? false : {opacity: 0, y: 6}}
        animate={reduced ? {} : {opacity: 1, y: 0}}
        transition={{duration: 0.2, ease: [0.4, 0, 0.2, 1], delay: 0.06}}
      >
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Listo, ya estás cubierto
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Tu estacionamiento está pago hasta las{' '}
          <strong className="text-gray-900">{cubiertaHasta}</strong>.
        </p>
      </motion.div>
    </header>
  );
}
