/* Admin Muni — vistas Mapa de cuadras y Configuración */
/* eslint-disable */
const { useState: useVS, useEffect: useVE, useRef: useVR } = React;

/* Mapa de cuadras con Leaflet (centrado en microcentro de Salta) */
function MapaCuadras() {
  const ref = useVR(null);
  const cuadras = [
    { n: 'Balcarce 200', lat: -24.7836, lng: -65.4090, sesiones: 7, tone: 'var(--success)' },
    { n: 'Güemes 100', lat: -24.7905, lng: -65.4115, sesiones: 4, tone: 'var(--blue-500)' },
    { n: 'España 500', lat: -24.7895, lng: -65.4075, sesiones: 9, tone: 'var(--accent)' },
    { n: 'Caseros 600', lat: -24.7888, lng: -65.4135, sesiones: 2, tone: 'var(--gray-400)' },
    { n: 'Alvarado 700', lat: -24.7860, lng: -65.4060, sesiones: 6, tone: 'var(--success)' },
  ];
  useVE(() => {
    if (!window.L || !ref.current || ref.current._init) return;
    ref.current._init = true;
    const map = L.map(ref.current, { zoomControl: true, attributionControl: false }).setView([-24.7872, -65.4098], 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
    cuadras.forEach(c => {
      L.circleMarker([c.lat, c.lng], { radius: 11, color: '#fff', weight: 2, fillColor: getComputedStyle(document.documentElement).getPropertyValue('--blue-500') || '#145FB0', fillOpacity: 0.95 })
        .addTo(map).bindTooltip(`${c.n} · ${c.sesiones} activas`, { direction: 'top' });
    });
  }, []);
  return (
    <div style={{ display: 'flex', gap: 20, padding: 24, height: '100%', boxSizing: 'border-box' }}>
      <FilterPanel />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <StatCard label="Cuadras habilitadas" value="48" icon="grid" />
          <StatCard label="Sesiones activas ahora" value="237" delta="+8" icon="car" />
          <StatCard label="Permisionarios en turno" value="42" icon="users" />
        </div>
        <div style={{ flex: 1, borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-1)', position: 'relative', minHeight: 360 }}>
          <div ref={ref} style={{ position: 'absolute', inset: 0, background: 'var(--gray-100)' }}></div>
          <div style={{ position: 'absolute', bottom: 14, left: 14, zIndex: 500, background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-2)', padding: '12px 14px', font: '500 13px var(--font-sans)' }}>
            <div style={{ font: '700 13px var(--font-sans)', color: 'var(--fg1)', marginBottom: 8 }}>Microcentro de Salta</div>
            {[['Punto azul', 'Cuadra con sesiones activas']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--fg2)' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--blue-500)', border: '2px solid #fff', boxShadow: '0 0 0 1px var(--border-strong)' }} />{v}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Configuración con tabs */
function Configuracion() {
  const [tab, setTab] = useVS('tarifas');
  const tabs = [['tarifas', 'Tarifas'], ['horarios', 'Horarios'], ['feriados', 'Feriados'], ['zonas', 'Zonas']];
  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 22 }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
            font: '600 15px var(--font-sans)', color: tab === id ? 'var(--primary)' : 'var(--fg2)',
            borderBottom: `2.5px solid ${tab === id ? 'var(--primary)' : 'transparent'}`, marginBottom: -1 }}>{label}</button>
        ))}
      </div>
      {tab === 'tarifas' && <TarifasForm />}
      {tab === 'feriados' && <FeriadosCalendar />}
      {tab !== 'tarifas' && tab !== 'feriados' && (
        <div style={{ maxWidth: 560 }}>
          <Banner tone="info">Esta sección de <b>{tabs.find(t => t[0] === tab)[1]}</b> sigue el mismo patrón de formulario que Tarifas — pendiente de detalle en este prototipo.</Banner>
        </div>
      )}
    </div>
  );
}

function Switch({ on, onToggle }) {
  return (
    <button onClick={onToggle} aria-pressed={on} style={{ width: 48, height: 28, borderRadius: 9999, border: 'none', cursor: 'pointer', position: 'relative', background: on ? 'var(--primary)' : 'var(--gray-200)', flex: 'none' }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 22, height: 22, borderRadius: '50%', background: '#fff', boxShadow: 'var(--shadow-1)', transition: 'left var(--dur) var(--ease)' }} />
    </button>
  );
}

function TarifasForm() {
  const [saldo, setSaldo] = useVS(true);
  const [nocturno, setNocturno] = useVS(false);
  return (
    <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Field label="Tarifa diurna (por 30 min)" value="50" mono helper="En pesos. Vigente de 9:00 a 21:00." onChange={() => {}} />
      <Field label="Tarifa nocturna (por 30 min)" value="35" mono helper="Zonas Balcarce, Güemes y Plaza Alvarado." onChange={() => {}} />
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[['Habilitar saldo a favor', 'El conductor puede dejar saldo para la próxima vez.', saldo, () => setSaldo(s => !s)],
          ['Cobro nocturno', 'Activar tarifa nocturna en zonas habilitadas.', nocturno, () => setNocturno(s => !s)]].map(([t, d, v, fn]) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ font: '600 15px var(--font-sans)', color: 'var(--fg1)' }}>{t}</div>
              <div style={{ font: '400 13px var(--font-sans)', color: 'var(--fg3)' }}>{d}</div>
            </div>
            <Switch on={v} onToggle={fn} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Button>Guardar cambios</Button>
        <Button variant="ghost">Cancelar</Button>
      </div>
    </div>
  );
}

function FeriadosCalendar() {
  const dias = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
  const feriados = [9, 25]; const hoy = 14;
  const cells = []; for (let i = 0; i < 3; i++) cells.push(null); for (let d = 1; d <= 30; d++) cells.push(d);
  return (
    <div style={{ maxWidth: 460 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Icon name="calendar" size={20} color="var(--primary)" />
        <h3 style={{ font: '700 18px var(--font-sans)', color: 'var(--fg1)', margin: 0 }}>Junio 2026</h3>
        <span style={{ marginLeft: 'auto', font: '500 14px var(--font-sans)', color: 'var(--fg3)' }}>Tocá un día para marcarlo feriado</span>
      </div>
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-1)', padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
          {dias.map(d => <div key={d} style={{ textAlign: 'center', font: '600 12px var(--font-sans)', color: 'var(--fg3)', padding: '4px 0' }}>{d}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const fer = feriados.includes(d);
            return (
              <div key={i} style={{ aspectRatio: '1', display: 'grid', placeItems: 'center', borderRadius: 8, cursor: 'pointer',
                font: '600 14px var(--font-mono)',
                background: fer ? 'var(--gold-100)' : d === hoy ? 'var(--blue-50)' : 'transparent',
                color: fer ? 'var(--gold-700)' : d === hoy ? 'var(--primary)' : 'var(--fg1)',
                border: d === hoy ? '1.5px solid var(--primary)' : '1.5px solid transparent' }}>{d}</div>
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, font: '500 13px var(--font-sans)', color: 'var(--fg2)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--gold-100)', border: '1px solid var(--gold-300)' }} />Feriado (sin cobro)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--blue-50)', border: '1px solid var(--primary)' }} />Hoy</span>
      </div>
    </div>
  );
}

Object.assign(window, { MapaCuadras, Configuracion });
