import {notFound, redirect} from 'next/navigation';
import {permisionarioLogueado} from '@/lib/auth-demo/servidor';
import {obtenerSesion} from '@/lib/datos';
import {rehidratarSesionesPropias} from '@/lib/datos/sesiones-propias';
import ExtenderForm from './ExtenderForm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{sid: string}>;
}

export default async function ExtenderPage({params}: Props) {
  const {sid} = await params;
  const permisionario = await permisionarioLogueado();
  if (!permisionario) redirect('/login');

  await rehidratarSesionesPropias();
  const sesion = obtenerSesion(sid);
  if (!sesion || sesion.permisionario_id !== permisionario.id) notFound();

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
