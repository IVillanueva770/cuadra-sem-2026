/* Shared primitives for Cuadra UI kits — Icon, Button, Input, Badge, Banner, TopBar, BottomNav */
/* eslint-disable */
const { useState } = React;

/* ---------- Iconos (estilo Lucide, stroke 2px) ---------- */
const ICON_PATHS = {
  'scan':       '<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>',
  'qr':         '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 21v.01M17 21h.01M21 17h.01"/>',
  'camera':     '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z"/><circle cx="12" cy="13" r="3"/>',
  'car':        '<path d="M19 17h2l-2-5-1.5-4.5A2 2 0 0 0 15.6 6H8.4a2 2 0 0 0-1.9 1.5L5 12l-2 5h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6"/>',
  'bike':       '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17 10 7h3l3 6h2M13 7h3"/>',
  'clock':      '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  'check':      '<path d="M20 6 9 17l-5-5"/>',
  'check-circle':'<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  'left':       '<path d="m15 18-6-6 6-6"/>',
  'right':      '<path d="m9 18 6-6-6-6"/>',
  'mail':       '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
  'plus':       '<path d="M12 5v14M5 12h14"/>',
  'minus':      '<path d="M5 12h14"/>',
  'wallet':     '<path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3"/><path d="M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-3"/><path d="M21 12h-5a2 2 0 0 0 0 4h5"/>',
  'cash':       '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  'home':       '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  'file':       '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  'user':       '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  'grid':       '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  'pin':        '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  'info':       '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
  'alert':      '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
  'lock':       '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  'wifi-off':   '<path d="M2 8.8a16 16 0 0 1 4.5-2.6M9 4.6a16 16 0 0 1 11 4.2M12 20h.01M5 12.9a10 10 0 0 1 3-1.8M15 11a10 10 0 0 1 3.6 2M8.5 16.4a5 5 0 0 1 6 0"/><path d="m2 2 20 20"/>',
};
function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 2, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={style}
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[name] || '' }} />
  );
}

/* ---------- Botón ---------- */
function Button({ variant = 'primary', children, icon, full, onClick, disabled, type }) {
  const base = {
    minHeight: 52, padding: '0 22px', borderRadius: 'var(--radius-md)',
    font: '600 17px/1 var(--font-sans)', border: '1.5px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', gap: 9,
    width: full ? '100%' : 'auto', transition: 'background var(--dur) var(--ease)',
  };
  const variants = {
    primary: { background: 'var(--primary)', color: '#fff' },
    secondary: { background: '#fff', color: 'var(--primary)', borderColor: 'var(--primary)' },
    ghost: { background: 'transparent', color: 'var(--primary)' },
    destructive: { background: 'var(--error)', color: '#fff' },
    mp: { background: '#009EE3', color: '#fff' },
  };
  const dis = disabled ? { background: 'var(--gray-100)', color: 'var(--gray-300)', borderColor: 'transparent' } : {};
  return (
    <button type={type || 'button'} onClick={disabled ? undefined : onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...dis }}>
      {icon && <Icon name={icon} size={20} />}{children}
    </button>
  );
}

/* ---------- Input ---------- */
function Field({ label, value, onChange, placeholder, helper, error, mono, maxLength, type }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', font: '600 15px var(--font-sans)', color: 'var(--fg1)', marginBottom: 6 }}>{label}</label>
      <input value={value} onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder}
        maxLength={maxLength} type={type || 'text'}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: '100%', minHeight: 52, padding: '0 15px', borderRadius: 'var(--radius-md)',
          border: `1.5px solid ${error ? 'var(--error)' : focus ? 'var(--blue-500)' : 'var(--border-strong)'}`,
          boxShadow: focus && !error ? 'var(--shadow-focus)' : 'none', outline: 'none',
          font: `500 18px var(${mono ? '--font-mono' : '--font-sans'})`, color: 'var(--fg1)',
          textTransform: mono ? 'uppercase' : 'none', background: '#fff',
        }} />
      {(helper || error || maxLength) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ font: '400 13px var(--font-sans)', color: error ? 'var(--error-fg)' : 'var(--fg3)', display: 'flex', gap: 6, alignItems: 'center' }}>
            {error && <Icon name="alert" size={14} color="var(--error)" />}{error || helper}
          </span>
          {maxLength && <span style={{ font: '400 13px var(--font-mono)', color: 'var(--fg3)' }}>{(value || '').length}/{maxLength}</span>}
        </div>
      )}
    </div>
  );
}

/* ---------- Badge de estado ---------- */
const STATE_STYLES = {
  activa:    { bg: 'var(--success-bg)', fg: 'var(--success-fg)', dot: 'var(--success)', label: 'Sesión activa' },
  expirada:  { bg: 'var(--gray-50)', fg: 'var(--gray-500)', icon: 'clock', label: 'Expirada' },
  pendiente: { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', icon: 'alert', label: 'Extendida · pendiente' },
  bloqueada: { bg: 'var(--error-bg)', fg: 'var(--error-fg)', icon: 'lock', label: 'Cobro bloqueado' },
  fuera:     { bg: 'var(--gray-50)', fg: 'var(--gray-500)', icon: 'info', label: 'Fuera de zona' },
};
function Badge({ state, children }) {
  const s = STATE_STYLES[state] || STATE_STYLES.expirada;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px',
      borderRadius: 'var(--radius-sm)', background: s.bg, color: s.fg, font: '600 13px var(--font-sans)' }}>
      {s.dot ? <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot }} /> : <Icon name={s.icon} size={14} />}
      {children || s.label}
    </span>
  );
}

/* ---------- Banner informativo ---------- */
function Banner({ tone = 'info', icon, children }) {
  const tones = {
    info: { bg: 'var(--info-bg)', fg: 'var(--info-fg)', i: 'info' },
    warning: { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)', i: 'alert' },
    offline: { bg: 'var(--gray-50)', fg: 'var(--gray-500)', i: 'wifi-off' },
  };
  const t = tones[tone];
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px',
      borderRadius: 'var(--radius-md)', background: t.bg, color: t.fg, font: '500 14px/1.45 var(--font-sans)' }}>
      <Icon name={icon || t.i} size={18} style={{ flex: 'none', marginTop: 1 }} />
      <div>{children}</div>
    </div>
  );
}

/* ---------- TopBar institucional ---------- */
function TopBar({ title, onBack }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
      background: '#fff', borderBottom: '1px solid var(--border)', minHeight: 60 }}>
      {onBack ? (
        <button onClick={onBack} aria-label="Volver" style={{ width: 44, height: 44, marginLeft: -8, border: 'none', background: 'none', display: 'grid', placeItems: 'center', cursor: 'pointer', borderRadius: 10 }}>
          <Icon name="left" size={26} color="var(--fg1)" />
        </button>
      ) : (
        <img src="../../assets/cuadra-logo-color.svg" alt="Cuadra" style={{ height: 30 }} />
      )}
      {title && <span style={{ font: '700 18px var(--font-sans)', color: 'var(--fg1)' }}>{title}</span>}
      <img src="../../assets/muni-salta-heart.png" alt="Municipalidad de la Ciudad de Salta" title="Una iniciativa de la Municipalidad de la Ciudad de Salta" style={{ height: 30, marginLeft: 'auto' }} />
    </header>
  );
}

/* ---------- Bottom navigation ---------- */
function BottomNav({ active, onNav, items }) {
  return (
    <nav style={{ display: 'flex', background: '#fff', borderTop: '1px solid var(--border)' }}>
      {items.map(it => {
        const on = it.id === active;
        return (
          <button key={it.id} onClick={() => onNav && onNav(it.id)}
            style={{ flex: 1, minHeight: 60, padding: '8px 4px 10px', border: 'none', background: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer',
              color: on ? 'var(--primary)' : 'var(--fg3)' }}>
            <Icon name={it.icon} size={24} strokeWidth={on ? 2.4 : 2} />
            <span style={{ font: '600 12px var(--font-sans)' }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

Object.assign(window, { Icon, Button, Field, Badge, Banner, TopBar, BottomNav, STATE_STYLES });
