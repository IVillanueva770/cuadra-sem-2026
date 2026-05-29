import {Card, CardContent} from '@/components/ui/card';
import type {LucideIcon} from 'lucide-react';
import {TrendingUp, TrendingDown, Minus} from 'lucide-react';

interface KpiCardProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icon: LucideIcon;
  /** Delta vs período anterior. pct positivo = sube, negativo = baja. */
  delta?: {pct: number; label: string; positiveIsGood?: boolean};
  trend?: {value: number; label: string};
  accentColor?: string;
}

export default function KpiCard({
  titulo,
  valor,
  subtitulo,
  icon: Icon,
  delta,
  accentColor = 'var(--primary)',
}: KpiCardProps) {
  const positiveIsGood = delta?.positiveIsGood ?? true;
  const isGood = delta ? (positiveIsGood ? delta.pct >= 0 : delta.pct <= 0) : null;
  const DeltaIcon = !delta
    ? null
    : delta.pct === 0
      ? Minus
      : delta.pct > 0
        ? TrendingUp
        : TrendingDown;
  const deltaColor = isGood === null ? 'var(--fg3)' : isGood ? 'var(--success)' : 'var(--destructive, #dc2626)';

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="!p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{color: 'var(--fg3)', letterSpacing: '0.04em'}}
            >
              {titulo}
            </p>
            <p
              className="text-3xl font-bold leading-tight truncate"
              style={{color: 'var(--fg1)'}}
            >
              {valor}
            </p>
            {subtitulo && (
              <p className="text-sm mt-1" style={{color: 'var(--fg2)'}}>
                {subtitulo}
              </p>
            )}
            {delta && DeltaIcon && (
              <div className="flex items-center gap-1 mt-1.5">
                <DeltaIcon size={13} style={{color: deltaColor}} />
                <span className="text-xs font-medium" style={{color: deltaColor}}>
                  {delta.pct > 0 ? '+' : ''}{delta.pct}%
                </span>
                <span className="text-xs" style={{color: 'var(--fg3)'}}>
                  {delta.label}
                </span>
              </div>
            )}
          </div>
          <div
            className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
            style={{backgroundColor: `${accentColor}18`}}
            aria-hidden="true"
          >
            <Icon size={20} style={{color: accentColor}} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
