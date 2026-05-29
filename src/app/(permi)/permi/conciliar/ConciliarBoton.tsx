'use client';

import {useState, useTransition} from 'react';
import {ClipboardCheck, CheckCircle2, AlertCircle} from 'lucide-react';
import {createClient} from '@/lib/supabase/client';

interface Props {
  asignacionId: string | null;
  totalEfectivo: number;
  saldoARendir: number;
  disabled?: boolean;
}

export default function ConciliarBoton({
  asignacionId,
  totalEfectivo,
  saldoARendir,
  disabled = false,
}: Props) {
  const [resultado, setResultado] = useState<'idle' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConciliar() {
    if (!asignacionId) {
      setErrorMsg('No hay asignación activa para conciliar.');
      setResultado('error');
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const {
        data: {user},
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMsg('No autenticado.');
        setResultado('error');
        return;
      }

      const {data: permisionario} = await supabase
        .from('permisionarios')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!permisionario) {
        setErrorMsg('No encontramos tu perfil.');
        setResultado('error');
        return;
      }

      const {error} = await supabase.from('conciliaciones_efectivo').insert({
        permisionario_id: permisionario.id,
        asignacion_id: asignacionId,
        total_efectivo_recaudado: totalEfectivo,
        saldo_a_rendir: saldoARendir,
        status: 'pending',
      });

      if (error) {
        setErrorMsg('Error al registrar el cierre. Intentá de nuevo.');
        setResultado('error');
        return;
      }

      setResultado('ok');
    });
  }

  if (resultado === 'ok') {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl border p-4"
        style={{
          backgroundColor: 'var(--success-bg)',
          borderColor: 'var(--success)',
          color: '#166534',
        }}
        role="status"
      >
        <CheckCircle2 className="h-6 w-6 flex-none" aria-hidden="true" />
        <div>
          <p className="font-semibold">Cierre registrado</p>
          <p className="text-sm">
            La Municipalidad procesará la rendición. Gracias.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {resultado === 'error' && errorMsg && (
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
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleConciliar}
        disabled={isPending || disabled || !asignacionId}
        className="flex items-center justify-center gap-2 w-full h-14 rounded-[10px] text-base font-semibold transition-all duration-150 active:scale-[0.98] hover:brightness-[0.97] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        style={{backgroundColor: 'var(--primary)', color: 'white'}}
      >
        <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
        {isPending ? 'Registrando cierre…' : 'Registrar cierre del día'}
      </button>
    </div>
  );
}
