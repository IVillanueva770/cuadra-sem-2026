'use client';

/**
 * ============================================================================
 *  DEMO ONLY — Navegador flotante para el pitch del hackathon.
 *  Permite a cualquiera que entre (cel o PC) recorrer las 3 experiencias del
 *  sistema sin tipear URLs.
 *
 *  PARA QUITARLO EN PRODUCCIÓN:
 *    1. Borrar la línea <DemoNav /> en src/app/layout.tsx
 *    2. Borrar este archivo (src/components/demo/DemoNav.tsx)
 *    (opcional) desinstalar `motion` si no se usa en otro lado.
 * ============================================================================
 */

import {useState} from 'react';
import Link from 'next/link';
import {AnimatePresence, motion} from 'motion/react';
import {Car, Ticket, Building2, X, LayoutGrid, ChevronRight, Sparkles} from 'lucide-react';

type Pantalla = {label: string; href: string};
type Grupo = {
  rol: string;
  detalle: string;
  icon: typeof Car;
  pantallas: Pantalla[];
};

const GRUPOS: Grupo[] = [
  {
    rol: 'Conductor',
    detalle: 'Paga por QR, sin registrarse',
    icon: Car,
    pantallas: [
      {label: 'Pagar estacionamiento', href: '/pagar/CUADRA-001'},
      {label: 'Verificar patente', href: '/verificar/ABC123'},
      {label: 'Ver la Ordenanza', href: '/ordenanza'},
    ],
  },
  {
    rol: 'Permisionario',
    detalle: 'Ingresar con DNI 20184567 · clave test123',
    icon: Ticket,
    pantallas: [
      {label: 'Ingresar', href: '/login'},
      {label: 'Mi dashboard', href: '/permi'},
    ],
  },
  {
    rol: 'Municipalidad',
    detalle: 'admin@municipalidadsalta.gob.ar · clave muni2026',
    icon: Building2,
    pantallas: [
      {label: 'Login admin', href: '/admin/login'},
      {label: 'Dashboard Muni', href: '/admin'},
    ],
  },
];

export default function DemoNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[59]"
            style={{backgroundColor: 'rgba(16, 24, 40, 0.35)'}}
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.18}}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Navegación de demo"
            className="fixed bottom-40 right-4 z-[60] w-[min(330px,calc(100vw-2rem))] overflow-hidden rounded-2xl border"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border)',
              boxShadow: '0 12px 40px rgba(16, 24, 40, 0.22)',
              transformOrigin: 'bottom right',
            }}
            initial={{opacity: 0, scale: 0.92, y: 12}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.92, y: 12}}
            transition={{type: 'spring', stiffness: 420, damping: 32}}
          >
            <div
              className="px-4 py-3 border-b"
              style={{borderColor: 'var(--border)'}}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{color: 'var(--primary)'}}
              >
                Modo demo
              </p>
              <p className="text-sm" style={{color: 'var(--fg2)'}}>
                Recorré las 3 experiencias del sistema
              </p>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {GRUPOS.map((grupo, gi) => {
                const Icon = grupo.icon;
                return (
                  <motion.div
                    key={grupo.rol}
                    className="px-2 py-2"
                    initial={{opacity: 0, x: 10}}
                    animate={{opacity: 1, x: 0}}
                    transition={{delay: 0.05 + gi * 0.06, duration: 0.2}}
                  >
                    <div className="flex items-center gap-2 px-1 pb-1.5">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{backgroundColor: 'var(--blue-50)'}}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{color: 'var(--primary)'}}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-sm font-semibold leading-tight"
                          style={{color: 'var(--fg1)'}}
                        >
                          {grupo.rol}
                        </p>
                        <p
                          className="text-[11px] leading-tight"
                          style={{color: 'var(--fg3)'}}
                        >
                          {grupo.detalle}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      {grupo.pantallas.map((p) => (
                        <Link
                          key={p.href}
                          href={p.href}
                          onClick={() => setOpen(false)}
                          className="group flex items-center justify-between rounded-lg px-2 py-2 text-sm transition-colors"
                          style={{color: 'var(--fg2)'}}
                        >
                          <span>{p.label}</span>
                          <ChevronRight
                            className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60"
                            aria-hidden="true"
                          />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                );
              })}

              <div className="px-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    window.dispatchEvent(new Event('cuadra:replay-splash'));
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                  style={{color: 'var(--fg3)'}}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Ver intro de nuevo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Cerrar navegación de demo' : 'Abrir navegación de demo'}
        aria-expanded={open}
        className="fixed bottom-24 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          backgroundColor: 'var(--primary)',
          color: 'white',
          boxShadow: '0 6px 20px rgba(20, 95, 176, 0.45)',
        }}
        whileHover={{scale: 1.06}}
        whileTap={{scale: 0.94}}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{rotate: -90, opacity: 0}}
              animate={{rotate: 0, opacity: 1}}
              exit={{rotate: 90, opacity: 0}}
              transition={{duration: 0.15}}
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{rotate: 90, opacity: 0}}
              animate={{rotate: 0, opacity: 1}}
              exit={{rotate: -90, opacity: 0}}
              transition={{duration: 0.15}}
            >
              <LayoutGrid className="h-6 w-6" aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
