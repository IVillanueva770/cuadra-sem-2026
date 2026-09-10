import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {ShieldCheck} from 'lucide-react';
import {formatARS} from '@/lib/utils';

interface EfectivoConciliarProps {
  totalEfectivo: number;
  permisionariosConEfectivo: number;
  /** Porcentaje que corresponde rendir a la Muni (default 20%) */
  pctRendicion?: number;
}

export default function EfectivoConciliar({
  totalEfectivo,
  permisionariosConEfectivo,
  pctRendicion = 20,
}: EfectivoConciliarProps) {
  const aMuni = Math.round(totalEfectivo * (pctRendicion / 100) * 100) / 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} style={{color: 'var(--primary)'}} />
          <CardTitle className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
            Efectivo a conciliar
          </CardTitle>
        </div>
        <p className="text-xs" style={{color: 'var(--fg3)'}}>
          Trazabilidad del efectivo cobrado en calle
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {totalEfectivo === 0 ? (
          <p className="text-sm" style={{color: 'var(--fg3)'}}>
            Sin cobros en efectivo en el período
          </p>
        ) : (
          <div className="space-y-3">
            <div
              className="p-3.5 rounded-xl space-y-2"
              style={{backgroundColor: 'var(--bg-subtle)'}}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{color: 'var(--fg3)'}}>
                  {permisionariosConEfectivo} permisionario{permisionariosConEfectivo !== 1 ? 's' : ''} cobraron efectivo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{color: 'var(--fg2)'}}>
                  Total efectivo cobrado
                </span>
                <span className="text-sm font-bold font-mono" style={{color: 'var(--fg1)'}}>
                  {formatARS(totalEfectivo)}
                </span>
              </div>
            </div>

            <div
              className="p-3.5 rounded-xl"
              style={{backgroundColor: 'color-mix(in srgb, var(--primary) 8%, var(--bg-surface))'}}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{color: 'var(--fg1)'}}>
                    Corresponde rendir a la Muni
                  </p>
                  <p className="text-xs mt-0.5" style={{color: 'var(--fg3)'}}>
                    {pctRendicion}% del efectivo cobrado
                  </p>
                </div>
                <span
                  className="text-xl font-bold font-mono"
                  style={{color: 'var(--primary)'}}
                >
                  {formatARS(aMuni)}
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed" style={{color: 'var(--fg3)'}}>
              Cada cobro en efectivo queda registrado digitalmente en el sistema. La rendición se
              realiza a través del módulo de conciliación por permisionario.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
