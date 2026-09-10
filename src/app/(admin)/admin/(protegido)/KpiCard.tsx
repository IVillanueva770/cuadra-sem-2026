import {Card} from '@/components/ui/card';
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
    <Card className="relative h-full overflow-hidden">
      <div className="p-5 pr-16 h-full flex flex-col">
        {/* Ícono: fijo arriba a la derecha, misma posición en todas las cards */}
        <div
          className="absolute top-5 right-5 flex items-center justify-center w-10 h-10 rounded-xl"
          style={{backgroundColor: `${accentColor}18`}}
          aria-hidden="true"
        >
          <Icon size={19} style={{color: accentColor}} />
        </div>

        {/* Título: alto fijo de 2 líneas → el número arranca a la misma altura en todas */}
        <p
          className="text-xs font-semibold uppercase mb-1.5 flex items-start"
          style={{color: 'var(--fg3)', letterSpacing: '0.04em', minHeight: '2.4em', lineHeight: '1.2'}}
        >
          {titulo}
        </p>

        <p
          className="text-3xl font-bold leading-none whitespace-nowrap tabular-nums"
          style={{color: 'var(--fg1)'}}
        >
          {valor}
        </p>

        {subtitulo && (
          <p className="text-sm mt-2 leading-snug" style={{color: 'var(--fg2)'}}>
            {subtitulo}
          </p>
        )}

        {delta && DeltaIcon && (
          <div className="flex items-center gap-1 mt-auto pt-2.5">
            <DeltaIcon size={13} style={{color: deltaColor}} />
            <span className="text-xs font-medium tabular-nums" style={{color: deltaColor}}>
              {delta.pct > 0 ? '+' : ''}{delta.pct}%
            </span>
            <span className="text-xs" style={{color: 'var(--fg3)'}}>
              {delta.label}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
