import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {formatARS} from '@/lib/utils';
import ConciliarBoton from './ConciliarBoton';

export const metadata: Metadata = {
  title: 'Cierre del día · Cuadra',
};

export default async function ConciliarPage() {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const {data: permisionario} = await supabase
    .from('permisionarios')
    .select('id, nombre_completo')
    .eq('user_id', user.id)
    .single();

  if (!permisionario) redirect('/permi');

  const hoy = new Date().toISOString().slice(0, 10);

  // Sesiones del día
  const {data: sesiones} = await supabase
    .from('parking_sessions')
    .select('id, monto, medio_pago, status')
    .eq('permisionario_id', permisionario.id)
    .gte('iniciada_a', `${hoy}T00:00:00`);

  const todasLasSesiones = sesiones ?? [];

  const sesionesCompletadas = todasLasSesiones.filter(
    (s) => s.status !== 'rejected'
  );

  const totalDigital = sesionesCompletadas
    .filter((s) => s.medio_pago === 'digital_mp')
    .reduce((sum, s) => sum + Number(s.monto), 0);

  const totalEfectivo = sesionesCompletadas
    .filter((s) => s.medio_pago === 'efectivo')
    .reduce((sum, s) => sum + Number(s.monto), 0);

  const totalGeneral = totalDigital + totalEfectivo;

  // El permisionario se queda con el 80% del total; rinde el 20% del efectivo a la Muni
  const partePermisionario = totalGeneral * 0.8;
  const aRendirMuni = totalEfectivo * 0.2;

  // Asignación del día
  const {data: asignacion} = await supabase
    .from('asignaciones_diarias')
    .select('id')
    .eq('permisionario_id', permisionario.id)
    .eq('fecha', hoy)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-md p-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{color: 'var(--fg1)'}}>
          Cierre del día
        </h1>
        <p className="text-base mt-1" style={{color: 'var(--fg2)'}}>
          Resumen de {hoy.split('-').reverse().join('/')}
        </p>
      </div>

      {/* Desglose por medio de pago */}
      <div
        className="rounded-2xl border divide-y overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        <div className="px-4 py-3">
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{color: 'var(--fg3)'}}
          >
            Recaudación del día
          </p>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-base" style={{color: 'var(--fg1)'}}>
            Sesiones completadas
          </span>
          <span className="font-mono text-base font-semibold" style={{color: 'var(--fg1)'}}>
            {sesionesCompletadas.length}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-base" style={{color: 'var(--fg1)'}}>
            Cobro digital (MP)
          </span>
          <span className="font-mono text-base font-semibold" style={{color: 'var(--fg1)'}}>
            {formatARS(totalDigital)}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-base" style={{color: 'var(--fg1)'}}>
            Cobro en efectivo
          </span>
          <span className="font-mono text-base font-semibold" style={{color: 'var(--fg1)'}}>
            {formatARS(totalEfectivo)}
          </span>
        </div>

        <div
          className="flex items-center justify-between px-4 py-4"
          style={{backgroundColor: 'var(--blue-50)'}}
        >
          <span className="text-base font-bold" style={{color: 'var(--fg1)'}}>
            Total recaudado
          </span>
          <span
            className="font-mono text-2xl font-bold"
            style={{color: 'var(--primary)'}}
          >
            {formatARS(totalGeneral)}
          </span>
        </div>
      </div>

      {/* Distribución */}
      <div
        className="rounded-2xl border divide-y overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        <div className="px-4 py-3">
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{color: 'var(--fg3)'}}
          >
            Distribución
          </p>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <span className="text-base" style={{color: 'var(--fg1)'}}>
              Tu parte (80%)
            </span>
            <p className="text-xs" style={{color: 'var(--fg3)'}}>
              Incluye lo digital ya en tu cuenta
            </p>
          </div>
          <span
            className="font-mono text-lg font-semibold"
            style={{color: 'var(--success)'}}
          >
            {formatARS(partePermisionario)}
          </span>
        </div>

        <div
          className="flex items-center justify-between px-4 py-4"
          style={{backgroundColor: 'var(--gold-50)'}}
        >
          <div>
            <span className="text-base font-semibold" style={{color: 'var(--gold-700)'}}>
              A rendir a la Muni
            </span>
            <p className="text-xs" style={{color: 'var(--gold-600)'}}>
              20% del efectivo cobrado
            </p>
          </div>
          <span
            className="font-mono text-2xl font-bold"
            style={{color: 'var(--gold-700)'}}
          >
            {formatARS(aRendirMuni)}
          </span>
        </div>
      </div>

      {/* Aviso si no hay sesiones */}
      {sesionesCompletadas.length === 0 && (
        <div
          className="rounded-2xl border p-6 text-center"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border)',
          }}
        >
          <p className="text-base" style={{color: 'var(--fg2)'}}>
            No hay sesiones registradas hoy.
          </p>
        </div>
      )}

      {/* Botón conciliar */}
      <ConciliarBoton
        asignacionId={asignacion?.id ?? null}
        totalEfectivo={totalEfectivo}
        saldoARendir={aRendirMuni}
        disabled={sesionesCompletadas.length === 0}
      />

      <p className="text-sm text-center" style={{color: 'var(--fg3)'}}>
        Una iniciativa de la Municipalidad de la Ciudad de Salta
      </p>
    </div>
  );
}
