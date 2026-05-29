import {notFound, redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import CobroQRClient from './CobroQRClient';

interface Props {
  params: Promise<{sid: string}>;
}

export default async function CobroQRPage({params}: Props) {
  const {sid} = await params;
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const {data: permisionario} = await supabase
    .from('permisionarios')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!permisionario) redirect('/permi');

  const {data: sesion} = await supabase
    .from('parking_sessions')
    .select('id, patente, monto, duracion_minutos, status, medio_pago')
    .eq('id', sid)
    .eq('permisionario_id', permisionario.id)
    .maybeSingle();

  if (!sesion) notFound();

  // Si ya está activa (pago confirmado), redirigir a éxito
  if (sesion.status === 'active') {
    redirect(`/pagar/exito/${sid}`);
  }

  // Si fue cancelada o rechazada, volver al dashboard
  if (sesion.status === 'rejected') {
    redirect('/permi');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const pagoUrl = `${appUrl}/pagar/sesion/${sid}`;

  return (
    <div className="mx-auto max-w-md">
      <CobroQRClient
        sid={sid}
        patente={sesion.patente}
        monto={Number(sesion.monto)}
        duracionMinutos={Number(sesion.duracion_minutos)}
        pagoUrl={pagoUrl}
      />
    </div>
  );
}
