import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Ingresar · Cuadra Permisionario',
};

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/permi');
  }

  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center p-6"
      style={{backgroundColor: 'var(--bg)'}}
    >
      <div className="w-full max-w-md space-y-8">
        {/* Header institucional */}
        <div className="text-center space-y-1">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{backgroundColor: 'var(--primary)'}}
            aria-hidden="true"
          >
            <span className="text-white text-2xl font-bold">C</span>
          </div>
          <h1 className="text-2xl font-bold" style={{color: 'var(--fg1)'}}>
            Cuadra · Permisionario
          </h1>
          <p className="text-base" style={{color: 'var(--fg2)'}}>
            Ingresá con tu DNI para empezar a cobrar.
          </p>
        </div>

        {/* Card de login */}
        <div
          className="rounded-2xl border p-6 shadow-sm"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-1)',
          }}
        >
          <LoginForm />
        </div>

        {/* Pie institucional */}
        <p
          className="text-center text-sm"
          style={{color: 'var(--fg3)'}}
        >
          Una iniciativa de la Municipalidad de la Ciudad de Salta
        </p>
      </div>
    </main>
  );
}
