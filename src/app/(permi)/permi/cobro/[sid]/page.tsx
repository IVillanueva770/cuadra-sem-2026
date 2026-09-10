import {notFound, redirect} from 'next/navigation';
import {permisionarioLogueado} from '@/lib/auth-demo/servidor';
import {obtenerSesion} from '@/lib/datos';
import {rehidratarSesionesPropias} from '@/lib/datos/sesiones-propias';
import CobroQRClient from './CobroQRClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{sid: string}>;
}

export default async function CobroQRPage({params}: Props) {
  const {sid} = await params;
  const permisionario = await permisionarioLogueado();
  if (!permisionario) redirect('/login');

  await rehidratarSesionesPropias();
  const sesion = obtenerSesion(sid);
  if (!sesion || sesion.permisionario_id !== permisionario.id) notFound();

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
