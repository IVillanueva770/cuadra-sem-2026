import {notFound} from 'next/navigation';
import Link from 'next/link';
import {Info} from 'lucide-react';
import {createServiceClient} from '@/lib/supabase/server';
import {formatHora} from '@/lib/utils';
import Comprobante from '@/components/cuadra/Comprobante';
import StatusScreenWrapper from './StatusScreenWrapper';
import LiberarBoton from './LiberarBoton';
import ExitoHeader from './ExitoHeader';

interface Props {
  params: Promise<{sid: string}>;
  searchParams: Promise<{paymentId?: string}>;
}

export default async function ExitoPage({params, searchParams}: Props) {
  const {sid} = await params;
  const {paymentId} = await searchParams;

  const supabase = createServiceClient();
  const {data: session} = await supabase
    .from('parking_sessions')
    .select(
      `
      id,
      patente,
      tipo_vehiculo,
      iniciada_a,
      cubierta_hasta,
      duracion_minutos,
      monto,
      monto_sin_descuento,
      medio_pago,
      mp_payment_id,
      status,
      permisionario:permisionarios(nombre_completo),
      cuadra:cuadras_habilitadas(nombre_display)
    `
    )
    .eq('id', sid)
    .single();

  if (!session) notFound();

  // Supabase devuelve arrays para relaciones cuando no son single hints
  const permi = Array.isArray(session.permisionario)
    ? session.permisionario[0]
    : session.permisionario;
  const cuadra = Array.isArray(session.cuadra)
    ? session.cuadra[0]
    : session.cuadra;

  const sessionForComprobante = {
    id: session.id,
    patente: session.patente,
    tipo_vehiculo: session.tipo_vehiculo,
    iniciada_a: session.iniciada_a,
    cubierta_hasta: session.cubierta_hasta,
    duracion_minutos: session.duracion_minutos,
    monto: Number(session.monto),
    monto_sin_descuento: session.monto_sin_descuento
      ? Number(session.monto_sin_descuento)
      : null,
    medio_pago: session.medio_pago,
    mp_payment_id: session.mp_payment_id,
    permisionario: permi ?? null,
    cuadra: cuadra ?? null,
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
