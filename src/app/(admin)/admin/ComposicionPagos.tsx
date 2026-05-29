import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Smartphone, Banknote} from 'lucide-react';
import {formatARS} from '@/lib/utils';

interface ComposicionPagosProps {
  montoDigital: number;
  montoEfectivo: number;
  sesionesDigital: number;
  sesionesEfectivo: number;
}

export default function ComposicionPagos({
  montoDigital,
  montoEfectivo,
  sesionesDigital,
  sesionesEfectivo,
}: ComposicionPagosProps) {
  const total = montoDigital + montoEfectivo;
  const totalSesiones = sesionesDigital + sesionesEfectivo;
  const pctDigital = total > 0 ? Math.round((montoDigital / total) * 100) : 0;
  const pctEfectivo = total > 0 ? 100 - pctDigital : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
          Composición de cobros
        </CardTitle>
        <p className="text-xs" style={{color: 'var(--fg3)'}}>
          Digital incluye 20% de descuento aplicado al conductor
        </p>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {total === 0 ? (
          <p className="text-sm" style={{color: 'var(--fg3)'}}>
            Sin datos en el período
          </p>
        ) : (
          <>
            {/* Barra segmentada */}
            <div className="h-3 rounded-full overflow-hidden flex" style={{backgroundColor: 'var(--bg-subtle)'}}>
              {pctDigital > 0 && (
                <div
                  className="h-full transition-all duration-500"
                  style={{width: `${pctDigital}%`, backgroundColor: '#145FB0'}}
                  title={`Digital: ${pctDigital}%`}
                />
              )}
              {pctEfectivo > 0 && (
                <div
                  className="h-full transition-all duration-500"
                  style={{width: `${pctEfectivo}%`, backgroundColor: '#94a3b8'}}
                  title={`Efectivo: ${pctEfectivo}%`}
                />
              )}
            </div>

            {/* Leyenda */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="flex items-start gap-2.5 p-3 rounded-xl"
                style={{backgroundColor: 'color-mix(in srgb, #145FB0 8%, var(--bg-surface))'}}
              >
                <Smartphone size={16} style={{color: '#145FB0', marginTop: 1}} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                    Digital MP
                  </p>
                  <p className="text-lg font-bold font-mono leading-tight" style={{color: 'var(--fg1)'}}>
                    {formatARS(montoDigital)}
                  </p>
                  <p className="text-xs" style={{color: 'var(--fg3)'}}>
                    {sesionesDigital} sesiones · {pctDigital}%
                  </p>
                </div>
              </div>

              <div
                className="flex items-start gap-2.5 p-3 rounded-xl"
                style={{backgroundColor: 'var(--bg-subtle)'}}
              >
                <Banknote size={16} style={{color: 'var(--fg3)', marginTop: 1}} />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                    Efectivo
                  </p>
                  <p className="text-lg font-bold font-mono leading-tight" style={{color: 'var(--fg1)'}}>
                    {formatARS(montoEfectivo)}
                  </p>
                  <p className="text-xs" style={{color: 'var(--fg3)'}}>
                    {sesionesEfectivo} sesiones · {pctEfectivo}%
                  </p>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between pt-1 border-t" style={{borderColor: 'var(--border)'}}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                Total período
              </span>
              <span className="text-sm font-bold font-mono" style={{color: 'var(--fg1)'}}>
                {formatARS(total)} · {totalSesiones} sesiones
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
