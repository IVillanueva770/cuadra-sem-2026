import {notFound} from 'next/navigation';
import Link from 'next/link';
import {Info} from 'lucide-react';
import {cuadraPorId, obtenerSesion, permisionarioPorId} from '@/lib/datos';
import {rehidratarSesionesPropias} from '@/lib/datos/sesiones-propias';
import {formatHora} from '@/lib/utils';
import Comprobante from '@/components/cuadra/Comprobante';
import StatusScreenWrapper from './StatusScreenWrapper';
import LiberarBoton from './LiberarBoton';
import ExitoHeader from './ExitoHeader';

interface Props {
  params: Promise<{sid: string}>;
  searchParams: Promise<{paymentId?: string}>;
}

export const dynamic = 'force-dynamic';

export default async function ExitoPage({params, searchParams}: Props) {
  const {sid} = await params;
  const {paymentId} = await searchParams;

  await rehidratarSesionesPropias();
  const session = obtenerSesion(sid);

  if (!session) notFound();

  const permi = permisionarioPorId(session.permisionario_id);
  const cuadra = cuadraPorId(session.cuadra_id);

  const sessionForComprobante = {
    id: session.id,
    patente: session.patente,
    tipo_vehiculo: session.tipo_vehiculo,
    iniciada_a: session.iniciada_a,
    cubierta_hasta: session.cubierta_hasta,
    duracion_minutos: session.duracion_minutos,
    monto: session.monto,
    monto_sin_descuento: session.monto_sin_descuento,
    medio_pago: session.medio_pago,
    mp_payment_id: session.mp_payment_id,
    permisionario: permi ? {nombre_completo: permi.nombre_completo} : null,
    cuadra: cuadra ? {nombre_display: cuadra.nombre_display} : null,
  };

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <ExitoHeader cubiertaHasta={formatHora(session.cubierta_hasta)} />

      {paymentId && <StatusScreenWrapper paymentId={paymentId} />}

      <Comprobante session={sessionForComprobante} />

      <div className="flex items-start gap-2 rounded-[10px] border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
        <Info className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
        <span>Acordate de tu DNI físico por si te lo piden.</span>
      </div>

      <LiberarBoton sessionId={session.id} />

      <Link
        href="/"
        className="inline-flex h-12 w-full items-center justify-center rounded-[10px] text-base font-medium text-blue-500 transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
