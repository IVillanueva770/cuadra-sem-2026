'use server';

import {permisionarioLogueado} from '@/lib/auth-demo/servidor';
import {actualizarSesion, obtenerSesion, type StatusSesion} from '@/lib/datos';
import {recordarSesionPropia, rehidratarSesionesPropias} from '@/lib/datos/sesiones-propias';

/** Estado actual del cobro, para que la pantalla del QR sepa cuándo se pagó. */
export async function consultarEstadoCobro(sid: string): Promise<StatusSesion | null> {
  await rehidratarSesionesPropias();
  return obtenerSesion(sid)?.status ?? null;
}

export async function cancelarCobro(sid: string): Promise<{ok: boolean}> {
  const permisionario = await permisionarioLogueado();
  if (!permisionario) return {ok: false};
  await rehidratarSesionesPropias();
  const sesion = obtenerSesion(sid);
  if (!sesion || sesion.permisionario_id !== permisionario.id) return {ok: false};
  const actualizada = actualizarSesion(sid, {status: 'rejected'});
  if (actualizada) await recordarSesionPropia(actualizada);
  return {ok: true};
}
