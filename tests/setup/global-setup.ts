/**
 * Playwright global setup: garantiza datos de test antes de correr los specs.
 *
 * 1. Crea (idempotente) el usuario de auth para el permisionario de test.
 * 2. Garantiza que haya asignación diaria para hoy para CUADRA-001.
 *
 * Requiere variables de entorno NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 * En CI usar .env.test o inyectar directamente.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Cargar .env.local si existe (dev local)
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TEST_DNI = '20184567';
const TEST_EMAIL = `${TEST_DNI}@cuadra.local`;
const TEST_PASSWORD = 'test123';

export default async function globalSetup() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.warn('[global-setup] Faltan credenciales Supabase — saltando seed de test data');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // 1. Crear usuario de test si no existe
  const { data: listData } = await supabase.auth.admin.listUsers();
  const existing = listData?.users.find(u => u.email === TEST_EMAIL);

  let userId: string;
  if (existing) {
    userId = existing.id;
    console.log(`[global-setup] Usuario de test ya existe: ${userId}`);
  } else {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (error || !created.user) {
      console.warn('[global-setup] No se pudo crear usuario de test:', error?.message);
      return;
    }
    userId = created.user.id;
    console.log(`[global-setup] Usuario de test creado: ${userId}`);
  }

  // 2. Vincular permisionario
  const { data: permi } = await supabase
    .from('permisionarios')
    .select('id, user_id, qr_code')
    .eq('dni', TEST_DNI)
    .single();

  if (!permi) {
    console.warn('[global-setup] Permisionario de test no encontrado');
    return;
  }

  if (permi.user_id !== userId) {
    await supabase.from('permisionarios').update({ user_id: userId }).eq('id', permi.id);
    console.log(`[global-setup] Permisionario vinculado: ${permi.id} → ${userId}`);
  }

  // 3. Garantizar asignación de hoy (idempotente)
  const hoy = new Date().toISOString().slice(0, 10);

  const { data: existing_asig } = await supabase
    .from('asignaciones_diarias')
    .select('id')
    .eq('permisionario_id', permi.id)
    .eq('fecha', hoy)
    .maybeSingle();

  if (existing_asig) {
    console.log(`[global-setup] Asignación para hoy (${hoy}) ya existe: ${existing_asig.id}`);
    return;
  }

  // Buscar una cuadra habilitada
  const { data: cuadra } = await supabase
    .from('cuadras_habilitadas')
    .select('id, nombre_display')
    .eq('habilitada_diurno', true)
    .limit(1)
    .single();

  if (!cuadra) {
    console.warn('[global-setup] No hay cuadras disponibles para crear asignación');
    return;
  }

  const { data: nueva, error: insertError } = await supabase
    .from('asignaciones_diarias')
    .insert({
      permisionario_id: permi.id,
      cuadra_id: cuadra.id,
      turno: 'diurno',
      fecha: hoy,
    })
    .select('id')
    .single();

  if (insertError) {
    console.warn('[global-setup] Error creando asignación:', insertError.message);
  } else {
    console.log(`[global-setup] Asignación creada para ${hoy}: ${nueva?.id} (cuadra: ${cuadra.nombre_display})`);
  }
}
