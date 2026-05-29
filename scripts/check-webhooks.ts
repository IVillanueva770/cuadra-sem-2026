/**
 * Diagnóstico: últimos eventos en webhook_events.
 * Ejecutar: pnpm tsx --env-file=.env.local scripts/check-webhooks.ts
 */
import {createClient} from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  const {data, count} = await supabase
    .from('webhook_events')
    .select('id, source, event_type, payment_id, processed, received_at', {count: 'exact'})
    .order('received_at', {ascending: false})
    .limit(5);
  console.log('webhook_events total:', count);
  console.log('Últimos 5:', JSON.stringify(data, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
