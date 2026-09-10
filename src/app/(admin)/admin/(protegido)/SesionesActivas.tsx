'use client';

import {useEffect, useState} from 'react';
import {createClient} from '@/lib/supabase/client';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {formatHora} from '@/lib/utils';

interface SesionActiva {
  id: string;
  patente: string;
  tipo_vehiculo: string;
  iniciada_a: string;
  cubierta_hasta: string;
  medio_pago: string;
  permisionario_nombre?: string;
}

export default function RealtimeDashboard() {
  const [sesiones, setSesiones] = useState<SesionActiva[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSesiones() {
    const supabase = createClient();
    const {data} = await supabase
      .from('parking_sessions')
      .select(
        `id, patente, tipo_vehiculo, iniciada_a, cubierta_hasta, medio_pago,
         permisionarios!inner(nombre_completo)`
      )
      .eq('status', 'active')
      .order('iniciada_a', {ascending: false})
      .limit(20);

    if (data) {
      const mapped = data.map((s: Record<string, unknown>) => ({
        id: s.id as string,
        patente: s.patente as string,
        tipo_vehiculo: s.tipo_vehiculo as string,
        iniciada_a: s.iniciada_a as string,
        cubierta_hasta: s.cubierta_hasta as string,
        medio_pago: s.medio_pago as string,
        permisionario_nombre: (s.permisionarios as {nombre_completo: string})?.nombre_completo,
      }));
      setSesiones(mapped);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchSesiones();

    const supabase = createClient();
    const channel = supabase
      .channel('realtime-sesiones')
      .on(
        'postgres_changes',
        {event: '*', schema: 'public', table: 'parking_sessions'},
        () => {
          fetchSesiones();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // fetchSesiones se define dentro del efecto; la dependencia está bien vacía
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
            Sesiones activas
          </CardTitle>
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full animate-pulse"
              style={{backgroundColor: 'var(--success)'}}
              aria-hidden="true"
            />
            <span className="text-xs font-medium" style={{color: 'var(--success)'}}>
              En vivo
            </span>
            <span className="text-xs" style={{color: 'var(--fg3)'}}>
              · {sesiones.length} activas
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 rounded-xl animate-pulse"
                style={{backgroundColor: 'var(--bg-subtle)'}}
              />
            ))}
          </div>
        ) : sesiones.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{color: 'var(--fg3)'}}>
            Sin sesiones activas en este momento
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{borderBottom: '1px solid var(--border)'}}>
                  <th
                    className="text-left py-2 font-semibold text-xs uppercase tracking-wider"
                    style={{color: 'var(--fg3)'}}
                  >
                    Patente
                  </th>
                  <th
                    className="text-left py-2 font-semibold text-xs uppercase tracking-wider"
                    style={{color: 'var(--fg3)'}}
                  >
                    Inicio
                  </th>
                  <th
                    className="text-left py-2 font-semibold text-xs uppercase tracking-wider"
                    style={{color: 'var(--fg3)'}}
                  >
                    Cubre hasta
                  </th>
                  <th
                    className="text-left py-2 font-semibold text-xs uppercase tracking-wider"
                    style={{color: 'var(--fg3)'}}
                  >
                    Medio
                  </th>
                  <th
                    className="text-left py-2 font-semibold text-xs uppercase tracking-wider"
                    style={{color: 'var(--fg3)'}}
                  >
                    Permisionario
                  </th>
                </tr>
              </thead>
              <tbody>
                {sesiones.map((s) => (
                  <tr
                    key={s.id}
                    style={{borderBottom: '1px solid var(--border)'}}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="py-2.5 font-mono font-semibold" style={{color: 'var(--fg1)'}}>
                      {s.patente}
                    </td>
                    <td className="py-2.5" style={{color: 'var(--fg2)'}}>
                      {formatHora(s.iniciada_a)}
                    </td>
                    <td className="py-2.5" style={{color: 'var(--fg2)'}}>
                      {formatHora(s.cubierta_hasta)}
                    </td>
                    <td className="py-2.5">
                      <Badge
                        variant={s.medio_pago === 'digital_mp' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {s.medio_pago === 'digital_mp' ? 'Digital' : 'Efectivo'}
                      </Badge>
                    </td>
                    <td className="py-2.5 max-w-[140px] truncate" style={{color: 'var(--fg2)'}}>
                      {s.permisionario_nombre ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
