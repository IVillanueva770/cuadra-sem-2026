import {redirect} from 'next/navigation';
import Link from 'next/link';
import {Plus} from 'lucide-react';
import {createClient} from '@/lib/supabase/server';
import {formatARS, formatFecha} from '@/lib/utils';
import SesionItem from './SesionItem';
import RealtimeUpdater from './RealtimeUpdater';
import AnimatedPermiDashboard, {AnimatedPermiItem, FadeUpItem} from './AnimatedPermiDashboard';

export default async function DashboardPage() {
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

  if (!permisionario) {
    redirect('/login');
  }

  const hoy = new Date().toISOString().slice(0, 10);

  // Sesiones del día
  const {data: sesiones} = await supabase
    .from('parking_sessions')
    .select(
      'id, patente, tipo_vehiculo, monto, medio_pago, status, iniciada_a, cubierta_hasta'
    )
    .eq('permisionario_id', permisionario.id)
    .gte('iniciada_a', `${hoy}T00:00:00`)
    .order('iniciada_a', {ascending: false});

  const todasLasSesiones = sesiones ?? [];
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
      <RealtimeUpdater permisionarioId={permisionario.id} />

      {/* Fecha */}
      <p className="overline text-xs" style={{color: 'var(--fg3)'}}>
        {formatFecha(new Date())}
      </p>

      {/* KPIs */}
      <AnimatedPermiDashboard className="grid grid-cols-3 gap-3">
        <AnimatedPermiItem>
          <div
            className="rounded-2xl border p-4 text-center"
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
            className="rounded-2xl border p-4 text-center"
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
            className="rounded-2xl border p-4 text-center"
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
        className="flex items-center justify-center gap-2 w-full h-14 rounded-[10px] text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
          <div className="space-y-3">
            {anteriores.map((s) => (
              <SesionItem key={s.id} sesion={s} />
            ))}
          </div>
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
