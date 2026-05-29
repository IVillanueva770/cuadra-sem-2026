/**
 * seed-test-user.ts
 *
 * Crea (de forma idempotente) el usuario de Auth de Supabase para el
 * permisionario de test: DNI 20184567 / email 20184567@cuadra.local
 * y lo vincula al registro de `permisionarios` correspondiente.
 *
 * Uso:
 *   pnpm tsx --env-file=.env.local tests/setup/seed-test-user.ts
 *
 * Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const TEST_DNI = '20184567';
const TEST_EMAIL = `${TEST_DNI}@cuadra.local`;
const TEST_PASSWORD = 'test123';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function main() {
  console.log(`Verificando usuario de test: ${TEST_EMAIL}`);

  // 1. Listar usuarios para ver si ya existe
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listando usuarios:', listError.message);
    process.exit(1);
  }

  const existing = listData.users.find(u => u.email === TEST_EMAIL);

  let userId: string;

  if (existing) {
    console.log(`Usuario ya existe: ${existing.id}`);
    userId = existing.id;
  } else {
    // 2. Crear el usuario
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });

    if (createError || !created.user) {
      console.error('Error creando usuario:', createError?.message);
      process.exit(1);
    }

    userId = created.user.id;
    console.log(`Usuario creado: ${userId}`);
  }

  // 3. Vincular al permisionario por DNI (idempotente)
  const { data: permi, error: permiError } = await supabase
    .from('permisionarios')
    .select('id, nombre_completo, user_id')
    .eq('dni', TEST_DNI)
    .single();

  if (permiError || !permi) {
    console.error('Permisionario no encontrado con DNI', TEST_DNI, permiError?.message);
    process.exit(1);
  }

  if (permi.user_id === userId) {
    console.log(`Permisionario ya vinculado: ${permi.nombre_completo}`);
  } else {
    const { error: updateError } = await supabase
      .from('permisionarios')
      .update({ user_id: userId })
      .eq('id', permi.id);

    if (updateError) {
      console.error('Error vinculando permisionario:', updateError.message);
      process.exit(1);
    }

    console.log(`Permisionario vinculado: ${permi.nombre_completo} → ${userId}`);
  }

  console.log('');
  console.log('Setup completado:');
  console.log(`  Email:    ${TEST_EMAIL}`);
  console.log(`  Password: ${TEST_PASSWORD}`);
  console.log(`  User ID:  ${userId}`);
  console.log(`  Permi:    ${permi.nombre_completo}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
