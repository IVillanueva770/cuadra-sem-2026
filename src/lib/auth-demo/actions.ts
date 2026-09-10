'use server';

import {cookies} from 'next/headers';
import {permisionarioPorDni} from '@/lib/datos';
import {DEMO_ADMIN, DEMO_PERMISIONARIO} from './credenciales';
import {COOKIE_AUTH, OPCIONES_COOKIE, codificar, expiracion} from './servidor';

type Resultado = {ok: true} | {ok: false; error: string};

export async function iniciarSesionPermisionario(dni: string, password: string): Promise<Resultado> {
  const limpio = dni.trim();
  const permi = permisionarioPorDni(limpio);
  const valido =
    permi !== null &&
    limpio === DEMO_PERMISIONARIO.dni &&
    password === DEMO_PERMISIONARIO.password &&
    permi.estado === 'activo';
  if (!valido || !permi) return {ok: false, error: 'DNI o contraseña incorrectos. Intentá de nuevo.'};

  const jar = await cookies();
  jar.set(COOKIE_AUTH, codificar({rol: 'permisionario', permisionario_id: permi.id, exp: expiracion()}), OPCIONES_COOKIE);
  return {ok: true};
}

export async function iniciarSesionAdmin(email: string, password: string): Promise<Resultado> {
  const valido = email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
  if (!valido) return {ok: false, error: 'Credenciales incorrectas. Verificá tu email y contraseña.'};

  const jar = await cookies();
  jar.set(COOKIE_AUTH, codificar({rol: 'admin', email: DEMO_ADMIN.email, exp: expiracion()}), OPCIONES_COOKIE);
  return {ok: true};
}

export async function cerrarSesion(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_AUTH);
}
