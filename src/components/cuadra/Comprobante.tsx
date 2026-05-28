import {Card} from '@/components/ui/card';
import {formatARS, formatHora, formatFecha} from '@/lib/utils';

interface ComprobanteSession {
  id: string;
  patente: string;
  tipo_vehiculo: 'auto' | 'moto';
  iniciada_a: string;
  cubierta_hasta: string;
  duracion_minutos: number;
  monto: number;
  monto_sin_descuento?: number | null;
  medio_pago: string;
  mp_payment_id?: string | null;
  permisionario: {nombre_completo: string} | null;
  cuadra: {nombre_display: string} | null;
}

interface Props {
  session: ComprobanteSession;
}

export default function Comprobante({session}: Props) {
  const numero = session.mp_payment_id
    ? `N° ${session.mp_payment_id}`
    : `N° ${session.id.slice(0, 8).toUpperCase()}`;

  return (
    <Card className="overflow-hidden">
      <header className="flex items-center justify-between bg-blue-500 px-4 py-3 text-white">
        <span className="text-base font-semibold">Comprobante</span>
        <span className="font-mono text-sm opacity-90">{numero}</span>
      </header>
      <div className="space-y-3 p-5 text-sm">
        <Row label="Patente" value={session.patente} mono />
        <Row
          label="Vehículo"
          value={session.tipo_vehiculo === 'auto' ? 'Auto' : 'Moto'}
        />
        <Row
          label="Permisionario"
          value={session.permisionario?.nombre_completo ?? '—'}
        />
        <Row label="Cuadra" value={session.cuadra?.nombre_display ?? '—'} />
        <Row label="Fecha" value={formatFecha(session.iniciada_a)} />
        <Row
          label="Desde"
          value={formatHora(session.iniciada_a)}
          mono
        />
        <Row
          label="Hasta"
          value={formatHora(session.cubierta_hasta)}
          mono
          emphasize
        />
        <Row label="Duración" value={`${session.duracion_minutos} min`} />
        <hr className="border-gray-200" />
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="font-mono text-2xl font-semibold text-gray-900">
            {formatARS(session.monto)}
          </span>
        </div>
        {session.monto_sin_descuento &&
          session.monto_sin_descuento > session.monto && (
            <p className="text-xs text-emerald-700">
              Incluye descuento de pago digital (
              {formatARS(session.monto_sin_descuento - session.monto)}).
            </p>
          )}
      </div>
    </Card>
  );
}

function Row({
  label,
  value,
  mono,
  emphasize,
}: {
  label: string;
  value: string;
  mono?: boolean;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span
        className={[
          mono ? 'font-mono' : '',
          emphasize ? 'font-semibold text-gray-900' : 'text-gray-900',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </span>
    </div>
  );
}
