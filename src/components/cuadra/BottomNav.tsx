'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {motion} from 'motion/react';
import {Home, Plus, ClipboardCheck} from 'lucide-react';

const NAV_ITEMS = [
  {
    href: '/permi',
    label: 'Inicio',
    icon: Home,
    exact: true,
  },
  {
    href: '/permi/nueva',
    label: 'Cobrar',
    icon: Plus,
    exact: false,
  },
  {
    href: '/permi/conciliar',
    label: 'Cierre',
    icon: ClipboardCheck,
    exact: false,
  },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-50 border-t"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border)',
        boxShadow: '0 -1px 3px rgba(16, 24, 40, 0.06)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <ul className="mx-auto flex max-w-md items-stretch px-2 py-1.5" role="list">
        {NAV_ITEMS.map(({href, label, icon: Icon, exact}) => {
          const active = isActive(href, exact);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className="relative flex flex-col items-center justify-center gap-1 py-2.5 min-h-[54px] rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset active:scale-95 transition-transform"
                style={{color: active ? 'var(--primary)' : 'var(--fg3)'}}
              >
                {/* Pastilla deslizante: viaja al ítem activo al cambiar de pestaña */}
                {active && (
                  <motion.span
                    layoutId="permi-nav-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{backgroundColor: 'var(--blue-50)'}}
                    transition={{type: 'spring', stiffness: 480, damping: 38, mass: 0.7}}
                  />
                )}
                <Icon
                  className="relative h-6 w-6"
                  aria-hidden="true"
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className="relative text-xs"
                  style={{color: active ? 'var(--primary)' : 'var(--fg3)', fontWeight: active ? 600 : 500}}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
