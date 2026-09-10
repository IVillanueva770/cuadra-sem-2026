import type {Metadata} from 'next';
import {listarWebhookEvents} from '@/lib/datos';
import AuditoriaClient, {type WebhookEvento} from './AuditoriaClient';

export const metadata: Metadata = {
  title: 'Auditoría · Panel Muni Cuadra',
};

export const dynamic = 'force-dynamic';

export default async function AuditoriaPage() {
  const eventos: WebhookEvento[] = listarWebhookEvents(100).map((e) => ({
    id: e.id,
    source: e.source,
    event_type: e.event_type,
    payment_id: e.payment_id,
    processed: e.processed,
    error_message: e.error_message,
    received_at: e.received_at,
    processed_at: e.processed_at,
  }));

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

      <AuditoriaClient eventos={eventos} />
    </div>
  );
}
