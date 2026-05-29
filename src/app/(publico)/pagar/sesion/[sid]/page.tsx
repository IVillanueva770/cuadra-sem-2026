import {createServiceClient} from '@/lib/supabase/server';
import {formatARS, formatHora} from '@/lib/utils';
import PagoSesionBrick from './PagoSesionBrick';

interface Props {
  params: Promise<{sid: string}>;
}

function formatDuracion(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export default async function PagarSesionPage({params}: Props) {
  const {sid} = await params;
  const supabase = createServiceClient();

  const {data: sesion} = await supabase
    .from('parking_sessions')
    .select(
      'id, patente, monto, monto_sin_descuento, duracion_minutos, status, cubierta_hasta, conductor_email, cuadra_id, cuadras_habilitadas(nombre_display)'
    )
    .eq('id', sid)
    .maybeSingle();

  if (!sesion) {
    return (
      <main className="mx-auto max-w-md p-6">
        <div
          className="rounded-2xl border p-5 space-y-2"
          style={{borderColor: 'var(--error)', backgroundColor: 'var(--error-bg)'}}
        >
          <h2 className="text-lg font-semibold" style={{color: '#991B1B'}}>
            Cobro no encontrado
          </h2>
          <p className="text-sm" style={{color: '#991B1B'}}>
            Este link de pago no existe. Pedile al permisionario que lo genere de nuevo.
          </p>
        </div>
      </main>
    );
  }

  // Ya pagada
  if (sesion.status === 'active') {
    const hasta = formatHora(sesion.cubierta_hasta);
    return (
      <main className="mx-auto max-w-md p-6">
        <div
          className="rounded-2xl border p-5 space-y-3"
          style={{borderColor: 'var(--success)', backgroundColor: 'var(--success-bg)'}}
        >
          <h2 className="text-lg font-semibold" style={{color: 'var(--success)'}}>
            Esta sesión ya está paga ✅
          </h2>
          <div className="space-y-1">
            <p className="text-sm font-mono font-bold tracking-wider" style={{color: 'var(--fg1)'}}>
              {sesion.patente}
            </p>
            <p className="text-sm" style={{color: 'var(--fg2)'}}>
              Cubierto hasta las {hasta} · {formatARS(Number(sesion.monto))}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Cancelada o rechazada
  if (sesion.status === 'rejected') {
    return (
      <main className="mx-auto max-w-md p-6">
        <div
          className="rounded-2xl border p-5 space-y-2"
          style={{borderColor: 'var(--error)', backgroundColor: 'var(--error-bg)'}}
        >
          <h2 className="text-lg font-semibold" style={{color: '#991B1B'}}>
            Cobro cancelado
          </h2>
          <p className="text-sm" style={{color: '#991B1B'}}>
            Este cobro fue cancelado. Pedile al permisionario que lo genere de nuevo.
          </p>
        </div>
      </main>
    );
  }

  // Vencida pero no pagada
  const ahora = new Date();
  const cubiertaHasta = new Date(sesion.cubierta_hasta);
  if (cubiertaHasta < ahora) {
    return (
      <main className="mx-auto max-w-md p-6">
        <div
          className="rounded-2xl border p-5 space-y-2"
          style={{borderColor: 'var(--border-strong)', backgroundColor: 'var(--bg-surface)'}}
        >
          <h2 className="text-lg font-semibold" style={{color: 'var(--fg1)'}}>
            Este cobro venció
          </h2>
          <p className="text-sm" style={{color: 'var(--fg2)'}}>
            El tiempo del cobro ya expiró. Pedile al permisionario que genere uno nuevo.
          </p>
        </div>
      </main>
    );
  }

  const cuadraNombre =
    sesion.cuadras_habilitadas && typeof sesion.cuadras_habilitadas === 'object' && !Array.isArray(sesion.cuadras_habilitadas)
      ? (sesion.cuadras_habilitadas as {nombre_display: string}).nombre_display
      : 'Cuadra asignada';

  const monto = Number(sesion.monto);
  const montoSinDescuento = Number(sesion.monto_sin_descuento);

  return (
    <main className="mx-auto max-w-md p-4 space-y-5">
      <div className="space-y-1">
        <p className="overline text-xs" style={{color: 'var(--fg3)'}}>
          Estacionamiento Salta · SEM
        </p>
        <h1 className="text-2xl font-bold" style={{color: 'var(--fg1)'}}>
          Pagá tu estadía
        </h1>
      </div>

      {/* Datos de la sesión */}
      <div
        className="rounded-2xl border divide-y"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        {[
          {label: 'Cuadra', value: cuadraNombre},
          {label: 'Patente', value: sesion.patente, mono: true},
          {label: 'Duración', value: formatDuracion(Number(sesion.duracion_minutos))},
        ].map(({label, value, mono}) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <span className="text-sm" style={{color: 'var(--fg2)'}}>
              {label}
            </span>
            <span
              className={`text-base font-semibold ${mono ? 'font-mono tracking-wider' : ''}`}
              style={{color: 'var(--fg1)'}}
            >
              {value}
            </span>
          </div>
        ))}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
              Total
            </span>
            <div className="text-right">
              {montoSinDescuento > monto && (
                <p className="text-sm line-through" style={{color: 'var(--fg3)'}}>
                  {formatARS(montoSinDescuento)}
                </p>
              )}
              <span className="font-mono text-2xl font-bold" style={{color: 'var(--primary)'}}>
                {formatARS(monto)}
              </span>
            </div>
          </div>
          {montoSinDescuento > monto && (
            <p className="text-xs mt-1" style={{color: 'var(--success)'}}>
              20% de descuento por pago digital
            </p>
          )}
        </div>
      </div>

      {/* Payment Brick */}
      <PagoSesionBrick
        sid={sid}
        amount={monto}
        email={sesion.conductor_email ?? undefined}
      />
    </main>
  );
}
