import {notFound} from 'next/navigation';
import Link from 'next/link';
import {CircleCheck, Info} from 'lucide-react';
import {createServiceClient} from '@/lib/supabase/server';
import {formatHora} from '@/lib/utils';
import Comprobante from '@/components/cuadra/Comprobante';
import StatusScreenWrapper from './StatusScreenWrapper';
import LiberarBoton from './LiberarBoton';

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
      <header className="space-y-3 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50">
          <CircleCheck
            className="h-10 w-10 text-emerald-600"
            aria-hidden="true"
          />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Listo, ya estás cubierto
        </h1>
        <p className="text-base text-gray-600">
          Tu estacionamiento está pago hasta las{' '}
          <strong className="text-gray-900">
            {formatHora(session.cubierta_hasta)}
          </strong>
          .
        </p>
      </header>

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
