import type {Metadata} from 'next';
import {createServiceClient} from '@/lib/supabase/server';
import {Badge} from '@/components/ui/badge';

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

      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)'}}>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                  Recibido
                </th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                  Fuente
                </th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                  Tipo
                </th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                  Payment ID
                </th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                  Estado
                </th>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                  Error
                </th>
              </tr>
            </thead>
            <tbody>
              {!eventos || eventos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center" style={{color: 'var(--fg3)'}}>
                    No hay eventos de webhook registrados aún.
                  </td>
                </tr>
              ) : (
                eventos.map((e) => {
                  const fecha = new Date(e.received_at);
                  const fechaStr = fecha.toLocaleDateString('es-AR', {
                    timeZone: 'America/Argentina/Salta',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  });
                  const horaStr = fecha.toLocaleTimeString('es-AR', {
                    timeZone: 'America/Argentina/Salta',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <tr
                      key={e.id}
                      style={{borderBottom: '1px solid var(--border)'}}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <p className="text-xs font-medium" style={{color: 'var(--fg1)'}}>
                          {fechaStr}
                        </p>
                        <p className="text-xs font-mono" style={{color: 'var(--fg3)'}}>
                          {horaStr}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-xs font-mono" style={{color: 'var(--fg2)'}}>
                        {e.source}
                      </td>
                      <td className="px-5 py-3 text-xs font-mono" style={{color: 'var(--fg2)'}}>
                        {e.event_type}
                      </td>
                      <td className="px-5 py-3 text-xs font-mono" style={{color: 'var(--fg3)'}}>
                        {e.payment_id ?? '—'}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={e.processed ? 'success' : e.error_message ? 'destructive' : 'warning'}>
                          {e.processed ? 'Procesado' : e.error_message ? 'Error' : 'Pendiente'}
                        </Badge>
                      </td>
                      <td
                        className="px-5 py-3 text-xs max-w-[200px] truncate"
                        style={{color: e.error_message ? 'var(--error)' : 'var(--fg3)'}}
                        title={e.error_message ?? undefined}
                      >
                        {e.error_message ?? '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
