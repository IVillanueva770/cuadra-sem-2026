import type {Metadata} from 'next';
import {createServiceClient} from '@/lib/supabase/server';
import AuditoriaClient, {type WebhookEvento} from './AuditoriaClient';

export const metadata: Metadata = {
  title: 'Auditoría · Panel Muni Cuadra',
};

export const dynamic = 'force-dynamic';

export default async function AuditoriaPage() {
  const supabase = createServiceClient();

  const {data: eventos, error} = await supabase
    .from('webhook_events')
    .select('id, source, event_type, payment_id, processed, error_message, received_at, processed_at')
    .order('received_at', {ascending: false})
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{color: 'var(--fg1)'}}>
          Auditoría
        </h1>
        <p className="text-sm mt-0.5" style={{color: 'var(--fg2)'}}>
          Últimos 100 eventos de webhook recibidos
        </p>
      </div>

      {error && (
        <p className="text-sm" style={{color: 'var(--error)'}}>
          Error al cargar eventos: {error.message}
        </p>
      )}

      <AuditoriaClient eventos={(eventos ?? []) as WebhookEvento[]} />
    </div>
  );
}
