'use client';

/**
 * Animación de apertura de Cuadra: sobre fondo azul institucional, se dibuja un
 * cartel cuadrado blanco y un auto entra y "estaciona" dentro, luego sube el
 * wordmark. Recreación fiel del splash del design system (logo-explorations/splash.html).
 *
 * Se muestra una vez por sesión (sessionStorage). Para re-verla, el FAB de demo
 * dispara el evento `cuadra:replay-splash`.
 */

import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';

const AZUL = '#145FB0';

export default function SplashScreen() {
  const pathname = usePathname();
  // Visible desde el PRIMER render en la home → el overlay azul ya está en el HTML
  // inicial, no hay flash de la landing antes del splash. Sin sessionStorage: cada
  // carga completa de la home relanza la intro (no reaparece en navegación SPA porque
  // el layout no se vuelve a montar).
  const [show, setShow] = useState(pathname === '/');
  const reduce = useReducedMotion();

  // Auto-cierre cada vez que el splash se muestra (carga inicial o replay).
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => setShow(false), reduce ? 900 : 3100);
    return () => clearTimeout(t);
  }, [show, reduce]);

  // Permite re-disparar la intro desde el menú de demo.
  useEffect(() => {
    const onReplay = () => setShow(true);
    window.addEventListener('cuadra:replay-splash', onReplay);
    return () => window.removeEventListener('cuadra:replay-splash', onReplay);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-9"
          style={{backgroundColor: AZUL}}
          initial={{opacity: 1}}
          exit={{opacity: 0}}
          transition={{duration: 0.5, ease: [0.4, 0, 0.2, 1]}}
          aria-hidden="true"
        >
          <div className="relative h-[168px] w-[168px]">
            <svg viewBox="0 0 168 168" className="block h-full w-full overflow-visible">
              {/* Cuadro: trazo que se dibuja */}
              <motion.rect
                x={6}
                y={6}
                width={156}
                height={156}
                rx={36}
                fill="none"
                stroke="#fff"
                strokeWidth={5}
                initial={{pathLength: reduce ? 1 : 0}}
                animate={{pathLength: 1}}
                transition={{duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.2, ease: [0.65, 0, 0.35, 1]}}
              />
              {/* Cuadro: relleno blanco */}
              <motion.rect
                x={6}
                y={6}
                width={156}
                height={156}
                rx={36}
                fill="#fff"
                initial={{opacity: reduce ? 1 : 0}}
                animate={{opacity: 1}}
                transition={{duration: reduce ? 0 : 0.45, delay: reduce ? 0 : 0.8, ease: 'easeOut'}}
              />
              {/* Auto entra desde la izquierda y estaciona */}
              <motion.g
                initial={{opacity: reduce ? 1 : 0, x: reduce ? 0 : -150}}
                animate={{opacity: 1, x: 0}}
                transition={{duration: reduce ? 0 : 0.95, delay: reduce ? 0 : 1.05, ease: [0.34, 1.32, 0.5, 1]}}
              >
                <path
                  d="M40 100 v-9 a6.5 6.5 0 0 1 4.6 -6.2 l6 -1.6 l9.2 -12.4 a11 11 0 0 1 8.7 -4.3 h27.3 a11 11 0 0 1 8.2 3.7 l9.7 11 l8.2 2.4 a6.5 6.5 0 0 1 4.6 6.2 V100 a5.5 5.5 0 0 1 -5.5 5.5 H45.5 A5.5 5.5 0 0 1 40 100 Z"
                  fill={AZUL}
                />
                <path
                  d="M70 76 h23 a5 5 0 0 1 3.8 1.7 l6.4 7.3 h-40 l4 -7.3 a5 5 0 0 1 2.8 -1.7 Z"
                  fill="#fff"
                />
                <circle cx={66} cy={104} r={9.5} fill={AZUL} />
                <circle cx={66} cy={104} r={4} fill="#fff" />
                <circle cx={108} cy={104} r={9.5} fill={AZUL} />
                <circle cx={108} cy={104} r={4} fill="#fff" />
              </motion.g>
              {/* Línea del lugar de estacionamiento */}
              <motion.rect
                x={50}
                y={118}
                width={68}
                height={7}
                rx={3.5}
                fill={AZUL}
                initial={{opacity: 0}}
                animate={{opacity: 0.5}}
                transition={{duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 1.75, ease: 'easeOut'}}
              />
            </svg>
          </div>

          <div className="text-center">
            <motion.div
              className="text-[40px] font-bold tracking-tight text-white"
              initial={{opacity: reduce ? 1 : 0, y: reduce ? 0 : 12}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: reduce ? 0 : 0.55, delay: reduce ? 0 : 1.95, ease: [0.2, 0.7, 0.3, 1]}}
            >
              Cuadra
            </motion.div>
            <motion.div
              className="mt-2.5 text-sm font-medium"
              style={{color: '#DBE9F8'}}
              initial={{opacity: reduce ? 1 : 0, y: reduce ? 0 : 10}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: reduce ? 0 : 0.55, delay: reduce ? 0 : 2.2, ease: [0.2, 0.7, 0.3, 1]}}
            >
              El estacionamiento medido de Salta
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
