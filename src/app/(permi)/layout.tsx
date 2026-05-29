import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import BottomNav from '@/components/cuadra/BottomNav';
import CuadraMark from '@/components/cuadra/CuadraMark';

export default async function PermiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Obtener datos del permisionario
  const {data: permisionario} = await supabase
    .from('permisionarios')
    .select('id, nombre_completo, dni')
    .eq('user_id', user.id)
    .single();

  const nombre = permisionario?.nombre_completo ?? 'Permisionario';
  const iniciales = nombre
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{backgroundColor: 'var(--bg)'}}
    >
      {/* Header institucional */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: 'var(--primary)',
          borderColor: 'var(--primary-active)',
        }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <CuadraMark size={36} tone="dark" />
            <span
              className="font-semibold text-base"
              style={{color: 'white'}}
            >
              Cuadra
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{color: 'rgba(255,255,255,0.85)'}}>
              {nombre.split(' ')[0]}
            </span>
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
              }}
              aria-label={`Usuario: ${nombre}`}
            >
              {iniciales}
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main
        className="flex-1 pb-20"
        style={{backgroundColor: 'var(--bg)'}}
      >
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
