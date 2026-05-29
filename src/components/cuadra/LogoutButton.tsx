'use client';

import {useRouter} from 'next/navigation';
import {LogOut} from 'lucide-react';
import {createClient} from '@/lib/supabase/client';

interface Props {
  /** A dónde volver tras cerrar sesión */
  redirectTo?: string;
  /** 'light' para headers de color sólido (texto blanco), 'default' para fondos claros */
  tone?: 'light' | 'default';
}

export default function LogoutButton({redirectTo = '/login', tone = 'default'}: Props) {
  const router = useRouter();
  const light = tone === 'light';

  async function handleLogout() {
    await createClient().auth.signOut();
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label="Cerrar sesión"
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all duration-150 active:scale-95"
      style={{
        color: light ? 'rgba(255,255,255,0.9)' : 'var(--fg2)',
        backgroundColor: light ? 'rgba(255,255,255,0.14)' : 'transparent',
      }}
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">Salir</span>
    </button>
  );
}
