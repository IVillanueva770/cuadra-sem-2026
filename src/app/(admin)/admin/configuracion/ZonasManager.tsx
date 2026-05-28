interface Zona {
  id: string;
  nombre: string;
  activa: boolean;
  created_at: string;
}

export default function ZonasManager({zonas}: {zonas: Zona[]}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
          Zonas nocturnas
        </h2>
        <span className="text-xs" style={{color: 'var(--fg3)'}}>
          {zonas.filter((z) => z.activa).length} activas
        </span>
      </div>

      <div className="space-y-2">
        {zonas.map((z) => (
          <div
            key={z.id}
            className="flex items-center justify-between px-4 py-3 rounded-xl border"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: z.activa ? 'var(--bg-subtle)' : 'var(--bg-surface)',
            }}
          >
            <div className="flex items-center gap-3">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{backgroundColor: z.activa ? 'var(--success)' : 'var(--fg-disabled)'}}
                aria-hidden="true"
              />
              <span className="text-sm font-medium" style={{color: 'var(--fg1)'}}>
                {z.nombre}
              </span>
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded font-semibold"
              style={{
                backgroundColor: z.activa ? 'var(--success-bg)' : 'var(--bg-subtle)',
                color: z.activa ? 'var(--success-fg)' : 'var(--fg3)',
              }}
            >
              {z.activa ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs" style={{color: 'var(--fg3)'}}>
        * Edición de zonas pendiente implementación completa (stub). Solo lectura en esta versión.
      </p>
    </div>
  );
}
