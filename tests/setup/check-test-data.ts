/**
 * Verificar datos de test: asignación del permisionario hoy y cuadras.
 * Uso: pnpm tsx --env-file=.env.local tests/setup/check-test-data.ts
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function main() {
  const hoy = new Date().toISOString().slice(0, 10);
  console.log('Fecha de hoy:', hoy);

  // Ver permisionarios activos
  const { data: permis } = await supabase
    .from('permisionarios')
    .select('id, nombre_completo, qr_code, dni, user_id')
    .eq('estado', 'activo')
    .limit(5);

  console.log('\nPermisionarios activos (primeros 5):');
  console.table(permis);

  // Ver asignaciones de hoy
  const { data: asignaciones } = await supabase
    .from('asignaciones_diarias')
    .select('id, permisionario_id, cuadra_id, turno, fecha')
    .eq('fecha', hoy);

  console.log('\nAsignaciones hoy:', asignaciones?.length ?? 0);
  if (asignaciones && asignaciones.length > 0) {
    console.table(asignaciones.slice(0, 5));
  }
}

main().catch(console.error);
