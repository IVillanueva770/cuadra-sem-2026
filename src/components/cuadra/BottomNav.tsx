'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
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
      <ul className="mx-auto flex max-w-md items-stretch" role="list">
        {NAV_ITEMS.map(({href, label, icon: Icon, exact}) => {
          const active = isActive(href, exact);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className="flex flex-col items-center justify-center gap-1 py-3 min-h-[56px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
                style={{
                  color: active ? 'var(--primary)' : 'var(--fg3)',
                  backgroundColor: active ? 'var(--blue-50)' : 'transparent',
                }}
              >
                <Icon
                  className="h-6 w-6"
                  aria-hidden="true"
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className="text-xs font-medium"
                  style={{
                    color: active ? 'var(--primary)' : 'var(--fg3)',
                    fontWeight: active ? 600 : 500,
                  }}
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
