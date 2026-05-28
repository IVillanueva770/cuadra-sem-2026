'use server';

import {createServiceClient} from '@/lib/supabase/server';

export async function liberarCuadra(sessionId: string) {
  const supabase = createServiceClient();
  await supabase
    .from('parking_sessions')
    .update({
      status: 'left_early',
      liberada_a: new Date().toISOString(),
      liberada_por: 'conductor',
    })
    .eq('id', sessionId)
    .eq('status', 'active');
}
