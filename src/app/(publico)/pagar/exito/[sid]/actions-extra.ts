'use server';

import {actualizarSesion, obtenerSesion} from '@/lib/datos';
import {recordarSesionPropia, rehidratarSesionesPropias} from '@/lib/datos/sesiones-propias';

export async function liberarCuadra(sessionId: string) {
  await rehidratarSesionesPropias();
  const sesion = obtenerSesion(sessionId);
  if (!sesion || sesion.status !== 'active') return;
  const liberada = actualizarSesion(sessionId, {
    status: 'left_early',
    liberada_a: new Date().toISOString(),
    liberada_por: 'conductor',
  });
  if (liberada) await recordarSesionPropia(liberada);
}
