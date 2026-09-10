import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {formatHora} from '@/lib/utils';

export interface SesionActivaFila {
  id: string;
  patente: string;
  tipo_vehiculo: string;
  iniciada_a: string;
  cubierta_hasta: string;
  medio_pago: string;
  permisionario_nombre: string | null;
}

interface Props {
  sesiones: SesionActivaFila[];
}

/**
 * Tabla de sesiones activas. Recibe los datos del server component (antes se
 * suscribía al realtime de Supabase desde el navegador); la página la refresca
 * con <AutoRefresh />.
 */
export default function SesionesActivas({sesiones}: Props) {
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
        {sesiones.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{color: 'var(--fg3)'}}>
            Sin sesiones activas en este momento
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{borderBottom: '1px solid var(--border)'}}>
                  {['Patente', 'Inicio', 'Cubre hasta', 'Medio', 'Permisionario'].map((h) => (
                    <th
                      key={h}
                      className="text-left py-2 font-semibold text-xs uppercase tracking-wider"
                      style={{color: 'var(--fg3)'}}
                    >
                      {h}
                    </th>
                  ))}
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
