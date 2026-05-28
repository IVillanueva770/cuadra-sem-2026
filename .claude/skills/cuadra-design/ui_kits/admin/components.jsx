/* Admin Muni — componentes de dashboard institucional (desktop-first) */
/* eslint-disable */
const { useState: useAS } = React;

/* Iconos extra para el panel admin */
Object.assign(ICON_PATHS, {
  'dashboard': '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  'users': '<circle cx="9" cy="8" r="3.5"/><path d="M3 21a6 6 0 0 1 12 0"/><path d="M16 5.5a3.5 3.5 0 0 1 0 6.8M21 21a6 6 0 0 0-5-5.9"/>',
  'map': '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
  'settings': '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  'calendar': '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
  'search': '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  'filter': '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
  'bell': '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  'logout': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  'down': '<path d="m6 9 6 6 6-6"/>',
  'trophy': '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/>',
  'sort': '<path d="M8 4v16M8 4l-3 3M8 4l3 3M16 20V4M16 20l3-3M16 20l-3-3"/>',
});

/* Sidebar de navegación */
function Sidebar({ active, onNav }) {
  const items = [
    { id: 'resumen', icon: 'dashboard', label: 'Resumen' },
    { id: 'permisionarios', icon: 'users', label: 'Permisionarios' },
    { id: 'mapa', icon: 'map', label: 'Mapa de cuadras' },
    { id: 'config', icon: 'settings', label: 'Configuración' },
  ];
  return (
    <aside style={{ width: 248, background: '#fff', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flex: 'none' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <img src="../../assets/cuadra-logo-color.svg" alt="Cuadra" style={{ height: 30 }} />
        <div style={{ font: '500 12px var(--font-sans)', color: 'var(--fg3)', marginTop: 6 }}>Panel · Modernización Muni</div>
      </div>
      <nav style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(it => {
          const on = it.id === active;
          return (
            <button key={it.id} onClick={() => onNav(it.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 'var(--radius-md)',
                border: 'none', cursor: 'pointer', textAlign: 'left', font: '600 15px var(--font-sans)',
                background: on ? 'var(--blue-50)' : 'transparent', color: on ? 'var(--primary)' : 'var(--fg2)' }}>
              <Icon name={it.icon} size={20} strokeWidth={on ? 2.3 : 2} />{it.label}
            </button>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto', padding: 12, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--blue-100)', color: 'var(--blue-700)', display: 'grid', placeItems: 'center', font: '700 14px var(--font-sans)' }}>MF</div>
        <div style={{ flex: 1 }}>
          <div style={{ font: '600 14px var(--font-sans)', color: 'var(--fg1)' }}>M. Fernández</div>
          <div style={{ font: '400 12px var(--font-sans)', color: 'var(--fg3)' }}>Coordinación</div>
        </div>
        <Icon name="logout" size={18} color="var(--fg3)" />
      </div>
    </aside>
  );
}

/* Topbar del contenido */
function AdminTopBar({ title }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 28px', background: '#fff', borderBottom: '1px solid var(--border)' }}>
      <h1 style={{ font: '700 24px var(--font-sans)', color: 'var(--fg1)', margin: 0 }}>{title}</h1>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--gray-50)', borderRadius: 'var(--radius-pill)', padding: '9px 14px', border: '1px solid var(--border)' }}>
          <Icon name="search" size={18} color="var(--fg3)" />
          <span style={{ font: '400 14px var(--font-sans)', color: 'var(--fg3)' }}>Buscar patente, cuadra…</span>
        </div>
        <button aria-label="Notificaciones" style={{ width: 44, height: 44, borderRadius: 10, border: '1px solid var(--border)', background: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <Icon name="bell" size={20} color="var(--fg2)" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 14, borderLeft: '1px solid var(--border)' }}>
          <img src="../../assets/muni-salta-principal.png" alt="Municipalidad de la Ciudad de Salta" style={{ height: 34 }} />
        </div>
      </div>
    </header>
  );
}

/* Stat card / KPI */
function StatCard({ label, value, delta, up = true, icon }) {
  return (
    <div style={{ flex: 1, background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-1)', padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--blue-50)', display: 'grid', placeItems: 'center' }}><Icon name={icon} size={20} color="var(--primary)" /></div>
        <span style={{ font: '600 14px var(--font-sans)', color: 'var(--fg2)' }}>{label}</span>
      </div>
      <div style={{ font: '500 32px var(--font-mono)', color: 'var(--fg1)' }}>{value}</div>
      {delta && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, font: '600 13px var(--font-sans)', color: up ? 'var(--success-fg)' : 'var(--error-fg)' }}>
          <Icon name={up ? 'trending-up' : 'down'} size={15} />{delta}
        </div>
      )}
    </div>
  );
}
Object.assign(ICON_PATHS, { 'trending-up': '<path d="m3 17 6-6 4 4 8-8"/><path d="M17 7h4v4"/>' });

/* Gráfico de barras — recaudación semanal */
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.v));
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-1)', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <h3 style={{ font: '700 18px var(--font-sans)', color: 'var(--fg1)', margin: 0 }}>Recaudación de la semana</h3>
        <span style={{ font: '500 14px var(--font-sans)', color: 'var(--fg3)' }}>en miles de $</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 180 }}>
        {data.map(d => (
          <div key={d.l} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{ font: '500 12px var(--font-mono)', color: 'var(--fg2)' }}>{d.v}</span>
            <div style={{ width: '100%', maxWidth: 44, height: `${d.v / max * 140}px`, background: d.hi ? 'var(--accent)' : 'var(--blue-400)', borderRadius: '6px 6px 0 0' }} />
            <span style={{ font: '600 13px var(--font-sans)', color: 'var(--fg3)' }}>{d.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Tabla de ranking de permisionarios */
function RankingTable({ rows }) {
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-1)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <Icon name="trophy" size={20} color="var(--accent)" />
        <h3 style={{ font: '700 18px var(--font-sans)', color: 'var(--fg1)', margin: 0 }}>Ranking de permisionarios</h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--gray-50)' }}>
            {['#', 'Permisionario', 'Cuadra', 'Sesiones', 'Recaudado'].map((h, i) => (
              <th key={h} style={{ textAlign: i > 2 ? 'right' : 'left', padding: '10px 20px', font: '600 13px var(--font-sans)', color: 'var(--fg2)', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>{h}{i === 4 && <Icon name="sort" size={13} />}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.name} style={{ borderTop: '1px solid var(--border)' }}>
              <td style={{ padding: '12px 20px', font: '700 15px var(--font-mono)', color: i < 3 ? 'var(--accent)' : 'var(--fg3)' }}>{i + 1}</td>
              <td style={{ padding: '12px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--blue-100)', color: 'var(--blue-700)', display: 'grid', placeItems: 'center', font: '700 13px var(--font-sans)' }}>{r.ini}</div>
                  <span style={{ font: '600 15px var(--font-sans)', color: 'var(--fg1)' }}>{r.name}</span>
                </div>
              </td>
              <td style={{ padding: '12px 20px', font: '400 15px var(--font-sans)', color: 'var(--fg2)' }}>{r.cuadra}</td>
              <td style={{ padding: '12px 20px', textAlign: 'right', font: '500 15px var(--font-mono)', color: 'var(--fg2)' }}>{r.sesiones}</td>
              <td style={{ padding: '12px 20px', textAlign: 'right', font: '600 15px var(--font-mono)', color: 'var(--fg1)' }}>$ {r.monto.toLocaleString('es-AR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Panel de filtros */
function FilterPanel() {
  const [zona, setZona] = useAS('Todas');
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-1)', padding: 18, width: 232, flex: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><Icon name="filter" size={18} color="var(--fg2)" /><h3 style={{ font: '700 16px var(--font-sans)', color: 'var(--fg1)', margin: 0 }}>Filtros</h3></div>
      <label style={{ font: '600 13px var(--font-sans)', color: 'var(--fg2)' }}>Período</label>
      <div style={{ display: 'flex', gap: 6, margin: '7px 0 18px' }}>
        {['Hoy', 'Semana', 'Mes'].map((p, i) => (
          <button key={p} style={{ flex: 1, padding: '8px 0', borderRadius: 8, cursor: 'pointer', font: '600 13px var(--font-sans)',
            border: `1.5px solid ${i === 1 ? 'var(--primary)' : 'var(--border-strong)'}`, background: i === 1 ? 'var(--blue-50)' : '#fff', color: i === 1 ? 'var(--primary)' : 'var(--fg2)' }}>{p}</button>
        ))}
      </div>
      <label style={{ font: '600 13px var(--font-sans)', color: 'var(--fg2)' }}>Zona</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
        {['Todas', 'Centro', 'Balcarce', 'Güemes', 'Plaza Alvarado'].map(z => (
          <button key={z} onClick={() => setZona(z)} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 4px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', font: '500 14px var(--font-sans)', color: zona === z ? 'var(--primary)' : 'var(--fg2)' }}>
            <span style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${zona === z ? 'var(--primary)' : 'var(--border-strong)'}`, background: zona === z ? 'var(--primary)' : '#fff', display: 'grid', placeItems: 'center' }}>
              {zona === z && <Icon name="check" size={12} color="#fff" strokeWidth={3} />}
            </span>{z}
          </button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, AdminTopBar, StatCard, BarChart, RankingTable, FilterPanel });
