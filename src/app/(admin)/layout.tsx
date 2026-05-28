'use client';

import {useEffect, useState} from 'react';
import {useRouter, usePathname} from 'next/navigation';
import {createClient} from '@/lib/supabase/client';
import SidebarAdmin from './admin/SidebarAdmin';

export default function AdminLayout({children}: {children: React.ReactNode}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Login page no requiere guard
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({data: {user}}) => {
      if (!user) {
        router.replace('/admin/login');
        return;
      }
      // Guard de email @municipalidadsalta.gob.ar — RELAJADO para demo:
      // if (!user.email?.endsWith('@municipalidadsalta.gob.ar')) {
      //   supabase.auth.signOut();
      //   router.replace('/admin/login?error=no_autorizado');
      //   return;
      // }
      setLoading(false);
    });
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{backgroundColor: 'var(--bg)'}}
      >
        <p className="text-base" style={{color: 'var(--fg2)'}}>
          Verificando sesión...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{backgroundColor: 'var(--bg)'}}>
      <SidebarAdmin />
      <main
        className="flex-1 min-w-0 overflow-auto"
        style={{marginLeft: '200px'}}
      >
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
