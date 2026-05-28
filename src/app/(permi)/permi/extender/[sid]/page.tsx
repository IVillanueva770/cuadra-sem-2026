import {notFound, redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import ExtenderForm from './ExtenderForm';

interface Props {
  params: Promise<{sid: string}>;
}

export default async function ExtenderPage({params}: Props) {
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
    .select(
      'id, patente, tipo_vehiculo, cubierta_hasta, status, conductor_email, monto, duracion_minutos'
    )
    .eq('id', sid)
    .eq('permisionario_id', permisionario.id)
    .single();

  if (!sesion) notFound();

  if (sesion.status !== 'active') {
    redirect('/permi');
  }

  return (
    <div className="mx-auto max-w-md">
      <ExtenderForm
        sesion={{
          ...sesion,
          monto: Number(sesion.monto),
          duracion_minutos: Number(sesion.duracion_minutos),
        }}
      />
    </div>
  );
}
