const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

interface Horario {
  id: string;
  turno: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

export default function HorariosViewer({horarios}: {horarios: Horario[]}) {
  const diurnos = horarios.filter((h) => h.turno === 'diurno').sort((a, b) => a.dia_semana - b.dia_semana);
  const nocturnos = horarios.filter((h) => h.turno === 'nocturno').sort((a, b) => a.dia_semana - b.dia_semana);

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
        Horarios de turnos
      </h2>
      <div
        className="rounded-xl border overflow-hidden"
        style={{borderColor: 'var(--border)'}}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)'}}>
              <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                Turno
              </th>
              <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                Día
              </th>
              <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                Inicio
              </th>
              <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                Fin
              </th>
              <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                Activo
              </th>
            </tr>
          </thead>
          <tbody>
            {[...diurnos, ...nocturnos].map((h) => (
              <tr key={h.id} style={{borderBottom: '1px solid var(--border)'}}>
                <td className="px-4 py-2.5">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: h.turno === 'diurno' ? 'var(--warning-bg)' : 'var(--info-bg)',
                      color: h.turno === 'diurno' ? 'var(--warning-fg)' : 'var(--info-fg)',
                    }}
                  >
                    {h.turno === 'diurno' ? '☀️' : '🌙'} {h.turno}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-sm" style={{color: 'var(--fg1)'}}>
                  {DIAS[h.dia_semana]}
                </td>
                <td className="px-4 py-2.5 font-mono text-sm" style={{color: 'var(--fg2)'}}>
                  {h.hora_inicio}
                </td>
                <td className="px-4 py-2.5 font-mono text-sm" style={{color: 'var(--fg2)'}}>
                  {h.hora_fin}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{backgroundColor: h.activo ? 'var(--success)' : 'var(--fg-disabled)'}}
                    aria-label={h.activo ? 'Activo' : 'Inactivo'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs" style={{color: 'var(--fg3)'}}>
        * Edición de horarios requiere migración de DB. Solo lectura en esta versión.
      </p>
    </div>
  );
}
