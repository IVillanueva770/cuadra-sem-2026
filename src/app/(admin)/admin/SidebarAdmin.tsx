'use client';

import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {LayoutDashboard, Users, Settings, FileText, LogOut} from 'lucide-react';
import {createClient} from '@/lib/supabase/client';

const NAV_ITEMS = [
  {href: '/admin', label: 'Dashboard', icon: LayoutDashboard},
  {href: '/admin/permisionarios', label: 'Permisionarios', icon: Users},
  {href: '/admin/configuracion', label: 'Configuración', icon: Settings},
  {href: '/admin/auditoria', label: 'Auditoría', icon: FileText},
];

export default function SidebarAdmin() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/admin/login');
  }

  return (
    <aside
      className="fixed top-0 left-0 h-screen w-[200px] flex flex-col border-r z-40"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-1)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--primary)',
        }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold"
          style={{backgroundColor: 'rgba(255,255,255,0.18)', color: 'white'}}
          aria-hidden="true"
        >
          C
        </div>
        <div>
          <p className="font-semibold text-sm leading-tight" style={{color: 'white'}}>
            Cuadra
          </p>
          <p className="text-xs leading-tight" style={{color: 'rgba(255,255,255,0.7)'}}>
            Panel Muni
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto" aria-label="Navegación admin">
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map(({href, label, icon: Icon}) => {
            const isActive =
              href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--blue-50)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--fg2)',
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    size={16}
                    style={{color: isActive ? 'var(--primary)' : 'var(--fg3)'}}
                    aria-hidden="true"
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t" style={{borderColor: 'var(--border)'}}>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-red-50 group"
          style={{color: 'var(--fg2)'}}
        >
          <LogOut
            size={16}
            className="group-hover:text-red-600 transition-colors"
            style={{color: 'var(--fg3)'}}
            aria-hidden="true"
          />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
