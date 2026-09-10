import {redirect} from 'next/navigation';
import Link from 'next/link';
import {Plus} from 'lucide-react';
import {permisionarioLogueado} from '@/lib/auth-demo/servidor';
import {sesionesDelPermisionarioHoy} from '@/lib/datos';
import {rehidratarSesionesPropias} from '@/lib/datos/sesiones-propias';
import {formatARS, formatFecha} from '@/lib/utils';
import SesionItem from './SesionItem';
import AnterioresList from './AnterioresList';
import AutoRefresh from '@/components/cuadra/AutoRefresh';
import AnimatedPermiDashboard, {AnimatedPermiItem, FadeUpItem} from './AnimatedPermiDashboard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const permisionario = await permisionarioLogueado();
  if (!permisionario) redirect('/login');

  await rehidratarSesionesPropias();
  const todasLasSesiones = sesionesDelPermisionarioHoy(permisionario.id);
  const activas = todasLasSesiones.filter((s) => s.status === 'active');
  const esperandoPago = todasLasSesiones.filter(
    (s) => s.status === 'extended_pending' && s.medio_pago === 'digital_mp'
  );
  const anteriores = todasLasSesiones.filter(
    (s) => s.status !== 'active' && !(s.status === 'extended_pending' && s.medio_pago === 'digital_mp')
  );

  const totalRecaudado = todasLasSesiones.reduce(
    (sum, s) => sum + Number(s.monto),
    0
  );
  const totalEfectivo = todasLasSesiones
    .filter((s) => s.medio_pago === 'efectivo')
    .reduce((sum, s) => sum + Number(s.monto), 0);
  const aRendir = totalEfectivo * 0.2;

  return (
    <div className="mx-auto max-w-md p-4 space-y-5">
      <AutoRefresh segundos={8} />

      {/* Fecha */}
      <p className="overline text-xs" style={{color: 'var(--fg3)'}}>
        {formatFecha(new Date())}
      </p>

      {/* KPIs */}
      <AnimatedPermiDashboard className="grid grid-cols-3 gap-3">
        <AnimatedPermiItem>
          <div
            className="rounded-2xl border p-4 text-center min-h-[7rem] h-full flex flex-col justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-2)]"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-1)',
            }}
          >
            <span
              className="font-mono text-3xl font-bold block"
              style={{color: 'var(--primary)'}}
            >
              {activas.length}
            </span>
            <span className="text-xs" style={{color: 'var(--fg3)'}}>
              Activas
            </span>
          </div>
        </AnimatedPermiItem>
        <AnimatedPermiItem>
          <div
            className="rounded-2xl border p-4 text-center min-h-[7rem] h-full flex flex-col justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-2)]"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-1)',
            }}
          >
            <span
              className="font-mono text-3xl font-bold block"
              style={{color: 'var(--fg1)'}}
            >
              {todasLasSesiones.length}
            </span>
            <span className="text-xs" style={{color: 'var(--fg3)'}}>
              Total hoy
            </span>
          </div>
        </AnimatedPermiItem>
        <AnimatedPermiItem>
          <div
            className="rounded-2xl border p-4 text-center min-h-[7rem] h-full flex flex-col justify-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-2)]"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-1)',
            }}
          >
            <span
              className="font-mono text-xl font-bold block"
              style={{color: 'var(--fg1)'}}
            >
              {formatARS(totalRecaudado)}
            </span>
            <span className="text-xs" style={{color: 'var(--fg3)'}}>
              Recaudado
            </span>
          </div>
        </AnimatedPermiItem>
      </AnimatedPermiDashboard>

      {/* Card a rendir */}
      {totalEfectivo > 0 && (
        <FadeUpItem>
          <div
            className="rounded-2xl border p-4 flex items-center justify-between"
            style={{
              backgroundColor: 'var(--gold-50)',
              borderColor: 'var(--gold-300)',
              boxShadow: 'var(--shadow-1)',
            }}
          >
            <div>
              <p className="text-sm font-semibold" style={{color: 'var(--gold-700)'}}>
                Efectivo a rendir a la Muni
              </p>
              <p className="text-xs mt-0.5" style={{color: 'var(--gold-600)'}}>
                20% de {formatARS(totalEfectivo)} en efectivo
              </p>
            </div>
            <span
              className="font-mono text-xl font-bold"
              style={{color: 'var(--gold-700)'}}
            >
              {formatARS(aRendir)}
            </span>
          </div>
        </FadeUpItem>
      )}

      {/* CTA Cobrar */}
      <Link
        href="/permi/nueva"
        className="flex items-center justify-center gap-2 w-full h-14 rounded-[10px] text-base font-semibold transition-all duration-150 hover:brightness-95 hover:shadow-[var(--shadow-2)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        style={{
          backgroundColor: 'var(--primary)',
          color: 'var(--on-primary)',
        }}
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
        Registrar cobro
      </Link>

      {/* Cobros digitales esperando pago */}
      {esperandoPago.length > 0 && (
        <section>
          <h2
            className="text-sm font-semibold mb-3"
            style={{color: 'var(--fg2)'}}
          >
            Esperando pago ({esperandoPago.length})
          </h2>
          <div className="space-y-3">
            {esperandoPago.map((s) => (
              <SesionItem key={s.id} sesion={s} />
            ))}
          </div>
        </section>
      )}

      {/* Sesiones activas */}
      {activas.length > 0 && (
        <section>
          <h2
            className="text-sm font-semibold mb-3"
            style={{color: 'var(--fg2)'}}
          >
            Activas ahora ({activas.length})
          </h2>
          <div className="space-y-3">
            {activas.map((s) => (
              <SesionItem key={s.id} sesion={s} />
            ))}
          </div>
        </section>
      )}

      {/* Sesiones anteriores */}
      {anteriores.length > 0 && (
        <section>
          <h2
            className="text-sm font-semibold mb-3"
            style={{color: 'var(--fg2)'}}
          >
            Anteriores hoy ({anteriores.length})
          </h2>
          <AnterioresList sesiones={anteriores} />
        </section>
      )}

      {todasLasSesiones.length === 0 && (
        <div
          className="rounded-2xl border p-8 text-center space-y-2"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border)',
          }}
        >
          <p className="text-base font-medium" style={{color: 'var(--fg2)'}}>
            Sin sesiones hoy todavía
          </p>
          <p className="text-sm" style={{color: 'var(--fg3)'}}>
            Tocá &quot;Registrar cobro&quot; para empezar.
          </p>
        </div>
      )}
    </div>
  );
}
