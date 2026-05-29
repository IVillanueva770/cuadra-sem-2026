'use client';

import Image from 'next/image';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {AnimatePresence, motion} from 'motion/react';
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import {createClient} from '@/lib/supabase/client';

const NAV_ITEMS = [
  {href: '/admin', label: 'Dashboard', icon: LayoutDashboard},
  {href: '/admin/permisionarios', label: 'Permisionarios', icon: Users},
  {href: '/admin/configuracion', label: 'Configuración', icon: Settings},
  {href: '/admin/auditoria', label: 'Auditoría', icon: FileText},
];

interface Props {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export default function SidebarAdmin({collapsed, setCollapsed, mobileOpen, setMobileOpen}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace('/admin/login');
  }

  function Contenido({onNavigate, showCollapse}: {onNavigate: () => void; showCollapse?: boolean}) {
    return (
      <>
        {/* Logo */}
        <div
          className="relative flex items-center gap-3 px-4 py-4 border-b"
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
          {showCollapse && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Colapsar menú"
              className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-white/15 active:scale-95"
              style={{color: 'rgba(255,255,255,0.85)'}}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
          )}
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
                    onClick={onNavigate}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--bg-subtle)]"
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

        {/* Footer — cerrar sesión */}
        <div className="p-3 border-t" style={{borderColor: 'var(--border)'}}>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--fg2)] transition-all hover:bg-[var(--error-bg)] hover:text-[var(--error)] active:scale-[0.98]"
          >
            <LogOut size={18} aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Botón abrir — mobile (hamburguesa) */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
        className="md:hidden fixed top-3 left-3 z-30 flex h-10 w-10 items-center justify-center rounded-lg border transition-all active:scale-95"
        style={{backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-1)'}}
      >
        <Menu size={20} style={{color: 'var(--fg1)'}} aria-hidden="true" />
      </button>

      {/* Botón abrir — desktop, visible solo cuando colapsado */}
      <AnimatePresence>
        {collapsed && (
          <motion.button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Mostrar menú"
            className="hidden md:flex fixed top-4 left-4 z-40 h-10 w-10 items-center justify-center rounded-lg border"
            style={{backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-1)', color: 'var(--fg1)'}}
            initial={{opacity: 0, scale: 0.8}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: 0.8}}
            transition={{duration: 0.18, delay: collapsed ? 0.15 : 0}}
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
          >
            <Menu size={20} aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar — desktop (colapsable, animado) */}
      <motion.aside
        className="hidden md:flex fixed top-0 left-0 h-screen w-[200px] flex-col border-r z-40"
        style={{backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-1)'}}
        initial={false}
        animate={{x: collapsed ? -200 : 0}}
        transition={{type: 'tween', duration: 0.3, ease: [0.4, 0, 0.2, 1]}}
      >
        <Contenido onNavigate={() => {}} showCollapse />
      </motion.aside>

      {/* Drawer — mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-40"
              style={{backgroundColor: 'rgba(16,24,40,0.4)'}}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: 0.18}}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              className="md:hidden fixed top-0 left-0 h-screen w-[260px] flex flex-col border-r z-50"
              style={{backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)'}}
              initial={{x: '-100%'}}
              animate={{x: 0}}
              exit={{x: '-100%'}}
              transition={{type: 'tween', duration: 0.24, ease: [0.4, 0, 0.2, 1]}}
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Cerrar menú"
                className="absolute top-3.5 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/15 active:scale-95"
                style={{color: 'white'}}
              >
                <X size={20} aria-hidden="true" />
              </button>
              <Contenido onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
