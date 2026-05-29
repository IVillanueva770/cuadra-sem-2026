'use client';

import {useState, useTransition, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {LogIn, AlertCircle, Eye, EyeOff, Sparkles} from 'lucide-react';
import {createClient} from '@/lib/supabase/client';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

export default function LoginForm() {
  const router = useRouter();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Limpiar cualquier sesión previa (ej: si venías logueado como admin) al entrar al login
  useEffect(() => {
    createClient().auth.signOut().catch(() => {});
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!dni.trim() || !password) {
      setError('Ingresá tu DNI y contraseña.');
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const email = `${dni.trim()}@cuadra.local`;

      const {error: authError} = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('DNI o contraseña incorrectos. Intentá de nuevo.');
        return;
      }

      router.push('/permi');
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="dni" className="text-base font-semibold">
          DNI
        </Label>
        <Input
          id="dni"
          type="tel"
          inputMode="numeric"
          placeholder="12345678"
          value={dni}
          onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
          maxLength={8}
          autoComplete="username"
          autoFocus
          disabled={isPending}
          className="h-14 text-lg font-mono tracking-wider"
          aria-describedby="dni-hint"
        />
        <p id="dni-hint" className="text-sm" style={{color: 'var(--fg3)'}}>
          Solo números, sin puntos.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-base font-semibold">
          Contraseña
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={isPending}
            className="h-14 text-lg pr-14"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            tabIndex={0}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Eye className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[10px] border p-3 text-sm"
          style={{
            borderColor: 'var(--error)',
            backgroundColor: 'var(--error-bg)',
            color: '#991B1B',
          }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full h-14 text-base font-semibold"
        disabled={isPending || !dni || !password}
      >
        {isPending ? (
          'Ingresando…'
        ) : (
          <span className="flex items-center gap-2">
            <LogIn className="h-5 w-5" aria-hidden="true" />
            Ingresar
          </span>
        )}
      </Button>

      {/* DEMO — autocompletar credenciales de prueba */}
      <button
        type="button"
        onClick={() => {
          setDni('20184567');
          setPassword('test123');
          setError(null);
        }}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed py-2.5 text-sm transition-colors"
        style={{borderColor: 'var(--border)', color: 'var(--fg3)'}}
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Autocompletar datos de demo
      </button>
    </form>
  );
}
