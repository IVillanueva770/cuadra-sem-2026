/**
 * Crea (idempotente) el usuario admin de demo para el panel Muni.
 * El layout de /admin solo exige estar logueado (el filtro de dominio de email
 * está relajado para la demo), así que cualquier usuario auth puede entrar.
 *
 * Ejecutar: pnpm tsx --env-file=.env.local scripts/seed-admin-demo.ts
 */
import {createClient} from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {auth: {persistSession: false}},
);

const EMAIL = 'admin@municipalidadsalta.gob.ar';
const PASSWORD = 'muni2026';

async function main() {
  // ¿Ya existe?
  const {data: list} = await supabase.auth.admin.listUsers({page: 1, perPage: 1000});
  const existente = list?.users.find((u) => u.email === EMAIL);

  if (existente) {
    // Asegurar la password conocida (por si cambió)
    await supabase.auth.admin.updateUserById(existente.id, {password: PASSWORD});
    console.log(`✔ Admin de demo ya existía, password reseteada: ${EMAIL} / ${PASSWORD}`);
    return;
  }

  const {data, error} = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: {nombre: 'Modernización (demo)', rol: 'admin_muni'},
  });
  if (error) throw error;

  console.log(`✔ Admin de demo creado: ${EMAIL} / ${PASSWORD}`);
  console.log(`  user_id: ${data.user?.id}`);
}

main().catch((e) => {
  console.error('💥 Falla seed admin demo:', e);
  process.exit(1);
});
