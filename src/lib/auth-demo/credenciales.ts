/**
 * Credenciales de la demo. Son públicas a propósito: se muestran en el
 * navegador flotante y los formularios de login las autocompletan.
 * Fuente única para los formularios, el DemoNav y los tests.
 */

export const DEMO_PERMISIONARIO = {
  dni: '20184567',
  password: 'test123',
} as const;

export const DEMO_ADMIN = {
  email: 'admin@municipalidadsalta.gob.ar',
  password: 'muni2026',
} as const;
