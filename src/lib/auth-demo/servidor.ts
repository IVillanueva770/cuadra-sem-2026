/**
 * Autenticación de la demo (reemplaza a Supabase Auth desde 2026-09).
 *
 * Una cookie firmada (HMAC-SHA256) lleva el rol y, para el permisionario, su
 * id. No hay usuarios reales que proteger: la firma evita que un valor
 * editado a mano pase por sesión, nada más.
 */

import 'server-only';
import {createHmac, timingSafeEqual} from 'crypto';
import {cookies} from 'next/headers';
import {permisionarioPorId, type Permisionario} from '@/lib/datos';

export const COOKIE_AUTH = 'cuadra_auth';
const HORAS_VIDA = 12;

export type UsuarioDemo =
  | {rol: 'permisionario'; permisionario_id: string; exp: number}
  | {rol: 'admin'; email: string; exp: number};

function secreto(): string {
  return process.env.DEMO_AUTH_SECRET ?? 'cuadra-demo-sin-secreto';
}

function firmar(payload: string): string {
  return createHmac('sha256', secreto()).update(payload).digest('base64url');
}

export function codificar(usuario: UsuarioDemo): string {
  const payload = Buffer.from(JSON.stringify(usuario)).toString('base64url');
  return `${payload}.${firmar(payload)}`;
}

export function decodificar(valor: string | undefined): UsuarioDemo | null {
  if (!valor) return null;
  const [payload, firma] = valor.split('.');
  if (!payload || !firma) return null;
  const esperada = firmar(payload);
  const a = Buffer.from(esperada);
  const b = Buffer.from(firma);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const u = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as UsuarioDemo;
    if (typeof u.exp !== 'number' || u.exp < Date.now()) return null;
    return u;
  } catch {
    return null;
  }
}

export function expiracion(): number {
  return Date.now() + HORAS_VIDA * 3600 * 1000;
}

export const OPCIONES_COOKIE = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: HORAS_VIDA * 3600,
};

/** Usuario logueado según la cookie, o null. */
export async function usuarioActual(): Promise<UsuarioDemo | null> {
  const jar = await cookies();
  return decodificar(jar.get(COOKIE_AUTH)?.value);
}

export async function permisionarioActualId(): Promise<string | null> {
  const u = await usuarioActual();
  return u?.rol === 'permisionario' ? u.permisionario_id : null;
}

export async function esAdmin(): Promise<boolean> {
  const u = await usuarioActual();
  return u?.rol === 'admin';
}

/** Permisionario logueado (cookie más registro en la semilla), o null. */
export async function permisionarioLogueado(): Promise<Permisionario | null> {
  const id = await permisionarioActualId();
  return id ? permisionarioPorId(id) : null;
}
