import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {formatARS} from '@/lib/utils';

interface TopPermisionario {
  id: string;
  nombre_completo: string;
  recaudacion: number;
  sesiones: number;
}

export default function TopPermisionarios({datos}: {datos: TopPermisionario[]}) {
  if (!datos || datos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
            Top 5 permisionarios
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
          Top 5 permisionarios
        </CardTitle>
        <p className="text-xs" style={{color: 'var(--fg3)'}}>
          Últimos 7 días
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <ol className="space-y-3">
          {datos.map((p, i) => (
            <li key={p.id} className="flex items-center gap-3">
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
                  title={p.nombre_completo}
                >
                  {p.nombre_completo}
                </p>
                <p className="text-xs" style={{color: 'var(--fg3)'}}>
                  {p.sesiones} sesiones
                </p>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {formatARS(p.recaudacion)}
              </Badge>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
