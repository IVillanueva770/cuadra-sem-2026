'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Sparkles} from 'lucide-react';
import {createClient} from '@/lib/supabase/client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

export default function LoginAdminForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      {/* DEMO — autocompletar credenciales de prueba */}
      <button
        type="button"
        onClick={() => {
          setEmail('admin@municipalidadsalta.gob.ar');
          setPassword('muni2026');
          setError(null);
        }}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed py-2.5 text-sm transition-colors"
        style={{borderColor: 'var(--border)', color: 'var(--fg3)'}}
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Autocompletar datos de demo
      </button>
    </form>
  );
}
