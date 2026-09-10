import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {formatARS} from '@/lib/utils';

interface TopCuadra {
  id: string;
  nombre_display: string;
  recaudacion: number;
  sesiones: number;
}

interface TopCuadrasProps {
  datos: TopCuadra[];
  labelRango?: string;
}

export default function TopCuadras({datos, labelRango}: TopCuadrasProps) {
  if (!datos || datos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
            Top cuadras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm" style={{color: 'var(--fg3)'}}>
            Sin datos disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
          Top cuadras por recaudación
        </CardTitle>
        {labelRango && (
          <p className="text-xs" style={{color: 'var(--fg3)'}}>
            {labelRango}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <ol className="space-y-3">
          {datos.map((c, i) => (
            <li key={c.id} className="flex items-center gap-3">
              <span
                className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0"
                style={{
                  backgroundColor: i === 0 ? 'var(--primary)' : 'var(--bg-subtle)',
                  color: i === 0 ? 'white' : 'var(--fg2)',
                }}
                aria-label={`Posición ${i + 1}`}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{color: 'var(--fg1)'}}
                  title={c.nombre_display}
                >
                  {c.nombre_display}
                </p>
                <p className="text-xs" style={{color: 'var(--fg3)'}}>
                  {c.sesiones} sesiones
                </p>
              </div>
              <Badge variant="secondary" className="text-xs font-mono shrink-0">
                {formatARS(c.recaudacion)}
              </Badge>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
