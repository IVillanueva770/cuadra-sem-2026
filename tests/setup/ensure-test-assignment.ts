/**
 * Asegura que el permisionario de test (DNI 20184567, CUADRA-001)
 * tenga una asignación para hoy.
 * Uso: pnpm tsx --env-file=.env.local tests/setup/ensure-test-assignment.ts
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function main() {
  const hoy = new Date().toISOString().slice(0, 10);

  // Buscar permisionario por DNI
  const { data: permi, error } = await supabase
    .from('permisionarios')
    .select('id, nombre_completo, qr_code')
    .eq('dni', '20184567')
    .single();

  if (error || !permi) {
    console.error('Permisionario no encontrado:', error?.message);
    process.exit(1);
  }

  console.log('Permisionario:', permi.nombre_completo, '/', permi.qr_code, '/', permi.id);

  // Ver si ya tiene asignación hoy
  const { data: existing } = await supabase
    .from('asignaciones_diarias')
    .select('id, cuadra_id, turno')
    .eq('permisionario_id', permi.id)
    .eq('fecha', hoy)
    .maybeSingle();

  if (existing) {
    console.log('Ya tiene asignación hoy:', existing.id, 'cuadra:', existing.cuadra_id);
    return;
  }

  // Crear asignación: usar la primera cuadra habilitada
  const { data: cuadra } = await supabase
    .from('cuadras_habilitadas')
    .select('id, nombre_display')
    .eq('habilitada_diurno', true)
    .limit(1)
    .single();

  if (!cuadra) {
    console.error('No hay cuadras disponibles');
    process.exit(1);
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
    console.error('Error creando asignación:', insertError.message);
    process.exit(1);
  }

  console.log('Asignación creada:', nueva.id);
  console.log('Cuadra:', cuadra.nombre_display, '/', cuadra.id);
  console.log('');
  console.log('QR del permisionario:', permi.qr_code);
  console.log('URL de pago:', `http://localhost:3000/pagar/${permi.qr_code}`);
}

main().catch(console.error);
