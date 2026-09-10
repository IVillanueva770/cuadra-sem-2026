import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import {permisionarioLogueado} from '@/lib/auth-demo/servidor';
import {asignacionDelDia, fechaISO, sesionesDelPermisionarioHoy} from '@/lib/datos';
import {rehidratarSesionesPropias} from '@/lib/datos/sesiones-propias';
import {formatARS} from '@/lib/utils';
import ConciliarBoton from './ConciliarBoton';

export const metadata: Metadata = {
  title: 'Cierre del día · Cuadra',
};

export const dynamic = 'force-dynamic';

export default async function ConciliarPage() {
  const permisionario = await permisionarioLogueado();
  if (!permisionario) redirect('/login');

  const hoy = fechaISO();
  await rehidratarSesionesPropias();
  const todasLasSesiones = sesionesDelPermisionarioHoy(permisionario.id);

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
  const asignacion = asignacionDelDia(permisionario.id, hoy);

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
          <span className="font-mono text-base font-medium tabular-nums" style={{color: 'var(--fg2)'}}>
            {sesionesCompletadas.length}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-base" style={{color: 'var(--fg1)'}}>
            Cobro digital (MP)
          </span>
          <span className="font-mono text-base font-medium tabular-nums" style={{color: 'var(--fg2)'}}>
            {formatARS(totalDigital)}
          </span>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-base" style={{color: 'var(--fg1)'}}>
            Cobro en efectivo
          </span>
          <span className="font-mono text-base font-medium tabular-nums" style={{color: 'var(--fg2)'}}>
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

        <div
          className="flex items-center justify-between px-4 py-4"
          style={{backgroundColor: 'var(--success-bg)'}}
        >
          <div>
            <span className="text-base font-semibold" style={{color: '#166534'}}>
              Tu parte (80%)
            </span>
            <p className="text-xs" style={{color: '#15803d'}}>
              Incluye lo digital ya en tu cuenta
            </p>
          </div>
          <span
            className="font-mono text-2xl font-bold tabular-nums"
            style={{color: '#166534'}}
          >
            {formatARS(partePermisionario)}
          </span>
        </div>

        <div
          className="flex items-center justify-between px-4 py-4"
          style={{backgroundColor: '#FEF3C7'}}
        >
          <div>
            <span className="text-base font-semibold" style={{color: '#92400E'}}>
              A rendir a la Muni
            </span>
            <p className="text-xs" style={{color: '#B45309'}}>
              20% del efectivo cobrado
            </p>
          </div>
          <span
            className="font-mono text-2xl font-bold tabular-nums"
            style={{color: '#B45309'}}
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
