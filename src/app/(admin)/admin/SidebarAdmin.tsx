'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {AnimatePresence, motion} from 'motion/react';
import {LayoutDashboard, Users, Settings, FileText, LogOut, Menu, X} from 'lucide-react';
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
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/admin/login');
  }

  const SidebarContent = (
    <>
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-b"
        style={{borderColor: 'var(--primary-active)', backgroundColor: 'var(--primary)'}}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5">
          <Image src="/icons/cuadra-symbol.svg" alt="" width={32} height={32} priority />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-tight" style={{color: 'white'}}>
            Cuadra
          </p>
          <p className="text-xs leading-tight" style={{color: 'rgba(255,255,255,0.78)'}}>
            Estacionamiento Medido de Salta
          </p>
        </div>
      </div>
      <p className="px-5 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
        Panel Muni
      </p>

      {/* Nav */}
      <nav className="flex-1 py-2 overflow-y-auto" aria-label="Navegación admin">
        <ul className="space-y-0.5 px-2">
          {NAV_ITEMS.map(({href, label, icon: Icon}) => {
            const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--blue-50)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--fg2)',
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={18} style={{color: isActive ? 'var(--primary)' : 'var(--fg3)'}} aria-hidden="true" />
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
          <LogOut size={18} className="group-hover:text-red-600 transition-colors" style={{color: 'var(--fg3)'}} aria-hidden="true" />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Botón hamburguesa — solo mobile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        className="md:hidden fixed top-3 left-3 z-30 flex h-10 w-10 items-center justify-center rounded-lg border"
        style={{backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-1)'}}
      >
        <Menu size={20} style={{color: 'var(--fg1)'}} aria-hidden="true" />
      </button>

      {/* Sidebar fijo — desktop */}
      <aside
        className="hidden md:flex fixed top-0 left-0 h-screen w-[200px] flex-col border-r z-40"
        style={{backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-1)'}}
      >
        {SidebarContent}
      </aside>

      {/* Drawer — mobile */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-40"
              style={{backgroundColor: 'rgba(16,24,40,0.4)'}}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.18}}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              className="md:hidden fixed top-0 left-0 h-screen w-[260px] flex flex-col border-r z-50"
              style={{backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)'}}
              initial={{x: '-100%'}}
              animate={{x: 0}}
              exit={{x: '-100%'}}
              transition={{type: 'tween', duration: 0.22, ease: [0.4, 0, 0.2, 1]}}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg"
                style={{color: 'white'}}
              >
                <X size={20} aria-hidden="true" />
              </button>
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
