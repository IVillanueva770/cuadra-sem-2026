/**
 * Sesiones propias del navegador: el puente entre instancias.
 *
 * El store vive en la memoria de cada instancia de Vercel y dos requests del
 * mismo usuario pueden caer en instancias distintas. Para que el flujo
 * "pagué → veo mi comprobante" no dependa de esa suerte, cada sesión que este
 * navegador crea o modifica se guarda también en una cookie (las últimas 5).
 * Al leer, la cookie rehidrata la memoria de la instancia que atienda.
 *
 * Es solo para el propio navegador: el permisionario que cobra en un celular
 * y el conductor que paga en otro siguen dependiendo de la memoria compartida
 * de la instancia (best effort, declarado en la UI).
 */

import {cookies} from 'next/headers';
import {adoptarSesion} from './store';
import type {ParkingSession} from './tipos';

const COOKIE = 'cuadra_mis_sesiones';
const MAX = 5;
const DIAS_VIDA = 2;

function leer(valor: string | undefined): ParkingSession[] {
  if (!valor) return [];
  try {
    const lista = JSON.parse(Buffer.from(valor, 'base64url').toString('utf8'));
    return Array.isArray(lista) ? (lista as ParkingSession[]) : [];
  } catch {
    return [];
  }
}

/** Mete en memoria las sesiones que este navegador conoce. Llamar antes de leer sesiones. */
export async function rehidratarSesionesPropias(): Promise<void> {
  const jar = await cookies();
  for (const s of leer(jar.get(COOKIE)?.value)) adoptarSesion(s);
}

/** Guarda (o refresca) una sesión en la cookie del navegador. Solo válido en server actions y route handlers. */
export async function recordarSesionPropia(sesion: ParkingSession): Promise<void> {
  const jar = await cookies();
  const previas = leer(jar.get(COOKIE)?.value).filter((s) => s.id !== sesion.id);
  const lista = [sesion, ...previas].slice(0, MAX);
  try {
    jar.set(COOKIE, Buffer.from(JSON.stringify(lista)).toString('base64url'), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: DIAS_VIDA * 24 * 3600,
    });
  } catch {
    // Fuera de una action (render de server component) no se puede escribir la cookie: no es error.
  }
}
