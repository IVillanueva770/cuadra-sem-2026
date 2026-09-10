interface Feriado {
  id: string;
  fecha: string;
  descripcion: string;
  permite_nocturno: boolean;
  permite_diurno: boolean;
}

export default function FeriadosManager({feriados}: {feriados: Feriado[]}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
          Feriados
        </h2>
        <span className="text-xs" style={{color: 'var(--fg3)'}}>
          {feriados.length} registrados
        </span>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{borderColor: 'var(--border)'}}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)'}}>
              <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                Fecha
              </th>
              <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                Descripción
              </th>
              <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                Diurno
              </th>
              <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                Nocturno
              </th>
            </tr>
          </thead>
          <tbody>
            {feriados.map((f) => {
              const [y, m, d] = f.fecha.split('-');
              return (
                <tr key={f.id} style={{borderBottom: '1px solid var(--border)'}}>
                  <td className="px-4 py-2.5 font-mono text-sm" style={{color: 'var(--fg1)'}}>
                    {d}/{m}/{y}
                  </td>
                  <td className="px-4 py-2.5" style={{color: 'var(--fg2)'}}>
                    {f.descripcion}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{backgroundColor: f.permite_diurno ? 'var(--success)' : 'var(--error)'}}
                      aria-label={f.permite_diurno ? 'Permitido' : 'No permitido'}
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{backgroundColor: f.permite_nocturno ? 'var(--success)' : 'var(--error)'}}
                      aria-label={f.permite_nocturno ? 'Permitido' : 'No permitido'}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs" style={{color: 'var(--fg3)'}}>
        * Alta/baja de feriados pendiente implementación completa (stub). Solo lectura en esta versión.
      </p>
    </div>
  );
}
