'use client';

import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {Sparkles} from 'lucide-react';
import {createClient} from '@/lib/supabase/client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
function typeInto(setter: (v: string) => void, text: string, speed = 35) {
  return new Promise<void>((res) => {
    let i = 1;
    const tick = () => {
      setter(text.slice(0, i));
      if (i < text.length) {
        i++;
        setTimeout(tick, speed);
      } else res();
    };
    tick();
  });
}

export default function LoginAdminForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.signOut().catch(() => {});
  }, []);

  async function autocompletarDemo() {
    if (typing || loading) return;
    setError(null);
    setTyping(true);
    setEmail('');
    setPassword('');
    await typeInto(setEmail, 'admin@municipalidadsalta.gob.ar', 30);
    await wait(170);
    await typeInto(setPassword, 'muni2026', 70);
    setTyping(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {error: authError} = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Credenciales incorrectas. Verificá tu email y contraseña.');
      setLoading(false);
      return;
    }

    router.replace('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium" style={{color: 'var(--fg1)'}}>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@municipalidadsalta.gob.ar"
          disabled={loading}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium" style={{color: 'var(--fg1)'}}>
          Contraseña
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={loading}
        />
      </div>

      {error && (
        <p
          className="text-sm rounded-lg px-4 py-3"
          style={{
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error)',
          }}
          role="alert"
        >
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar al panel'}
      </Button>

      {/* DEMO — autocompletar credenciales de prueba (con efecto de tipeo) */}
      <button
        type="button"
        onClick={autocompletarDemo}
        disabled={loading || typing}
        className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed py-2.5 text-sm transition-all duration-150 hover:bg-[var(--blue-50)] hover:border-[var(--primary)] active:scale-[0.98] disabled:opacity-70"
        style={{borderColor: 'var(--border)', color: 'var(--fg3)'}}
      >
        <Sparkles className={`h-4 w-4 ${typing ? 'animate-pulse' : ''}`} style={{color: typing ? 'var(--primary)' : undefined}} aria-hidden="true" />
        {typing ? 'Escribiendo…' : 'Autocompletar datos de demo'}
      </button>
    </form>
  );
}
