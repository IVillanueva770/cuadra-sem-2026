/* Conductor — pantallas del flujo: escanear QR → patente → pago → comprobante */
/* eslint-disable */
const { useState: useS } = React;

/* Selector de tipo de vehículo (auto / moto) — visual, no radio pelado */
function VehicleSelect({ value, onChange }) {
  const opts = [{ id: 'auto', icon: 'car', label: 'Auto' }, { id: 'moto', icon: 'bike', label: 'Moto' }];
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', font: '600 15px var(--font-sans)', color: 'var(--fg1)', marginBottom: 8 }}>¿Qué estás estacionando?</label>
      <div style={{ display: 'flex', gap: 12 }}>
        {opts.map(o => {
          const on = value === o.id;
          return (
            <button key={o.id} onClick={() => onChange(o.id)}
              style={{ flex: 1, minHeight: 84, borderRadius: 'var(--radius-md)', cursor: 'pointer',
                border: `2px solid ${on ? 'var(--primary)' : 'var(--border-strong)'}`,
                background: on ? 'var(--blue-50)' : '#fff', color: on ? 'var(--primary)' : 'var(--fg2)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon name={o.icon} size={30} />
              <span style={{ font: '600 16px var(--font-sans)' }}>{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Selector de tiempo con +/- grandes */
function TimeStepper({ value, onChange }) {
  const step = 30, min = 30, max = 240;
  const rate = 50; // $/30min ejemplo
  const Btn = ({ dir }) => (
    <button onClick={() => onChange(Math.min(max, Math.max(min, value + dir * step)))}
      aria-label={dir > 0 ? 'Sumar 30 minutos' : 'Restar 30 minutos'}
      style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-strong)',
        background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
      <Icon name={dir > 0 ? 'plus' : 'minus'} size={24} strokeWidth={2.5} />
    </button>
  );
  const h = Math.floor(value / 60), m = value % 60;
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', font: '600 15px var(--font-sans)', color: 'var(--fg1)', marginBottom: 8 }}>¿Cuánto tiempo?</label>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Btn dir={-1} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ font: '500 30px var(--font-mono)', color: 'var(--fg1)' }}>{h > 0 ? `${h}h ` : ''}{m > 0 ? `${m}min` : ''}</div>
          <div style={{ font: '500 14px var(--font-sans)', color: 'var(--accent)' }}>$ {(value / 30 * rate).toLocaleString('es-AR')}</div>
        </div>
        <Btn dir={1} />
      </div>
    </div>
  );
}

/* 1 · Pantalla de escaneo (landing) */
function ScanScreen({ onScan }) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, minHeight: '100%' }}>
      <Banner tone="info" icon="clock">Estás en zona <b>diurna</b>. Hoy se cobra de 9:00 a 21:00.</Banner>
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <h1 style={{ font: '700 28px var(--font-sans)', color: 'var(--fg1)', margin: '0 0 8px', letterSpacing: '-0.01em' }}>Pagá tu estacionamiento</h1>
        <p style={{ font: '400 18px/1.5 var(--font-sans)', color: 'var(--fg2)', margin: 0 }}>Escaneá el código QR que tiene el permisionario de tu cuadra.</p>
      </div>
      <div style={{ display: 'grid', placeItems: 'center', margin: '8px 0 4px' }}>
        <div style={{ width: 168, height: 168, borderRadius: 24, border: '3px solid var(--blue-100)', display: 'grid', placeItems: 'center', background: 'var(--blue-50)' }}>
          <Icon name="qr" size={84} color="var(--primary)" strokeWidth={1.6} />
        </div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Button full icon="scan" onClick={onScan}>Escanear QR</Button>
        <p style={{ font: '400 14px var(--font-sans)', color: 'var(--fg3)', textAlign: 'center', margin: 0 }}>No necesitás registrarte. Identificamos tu auto por la patente.</p>
      </div>
    </div>
  );
}

/* 2 · Scanner (cámara mock) */
function ScannerScreen({ onDetected }) {
  return (
    <div style={{ position: 'relative', height: '100%', background: '#0A1929', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', position: 'relative' }}>
        <div style={{ width: 230, height: 230, border: '3px solid rgba(255,255,255,.85)', borderRadius: 20, boxShadow: '0 0 0 9999px rgba(0,0,0,.35)' }} />
        <p style={{ position: 'absolute', bottom: 48, left: 0, right: 0, textAlign: 'center', color: '#fff', font: '500 16px var(--font-sans)' }}>Apuntá al código QR de la cuadra</p>
      </div>
      <div style={{ padding: 20 }}>
        <Button full variant="secondary" onClick={onDetected} icon="check">Simular lectura del QR</Button>
      </div>
    </div>
  );
}

/* 3 · Datos: patente + tipo + tiempo + email */
function PatenteScreen({ onContinue }) {
  const [patente, setP] = useS('');
  const [tipo, setT] = useS('auto');
  const [mins, setM] = useS(60);
  const [email, setE] = useS('');
  const valid = patente.replace(/\s/g, '').length >= 6;
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Icon name="pin" size={18} color="var(--primary)" />
        <span style={{ font: '600 15px var(--font-sans)', color: 'var(--fg2)' }}>Balcarce 200 · zona Centro</span>
      </div>
      <Field label="Patente del auto" value={patente} onChange={v => setP(v.toUpperCase())} placeholder="AB 123 CD" mono
        helper={valid ? 'Listo' : 'Como aparece en tu chapa patente'} error={patente && !valid ? 'Faltan caracteres' : ''} />
      <VehicleSelect value={tipo} onChange={setT} />
      <TimeStepper value={mins} onChange={setM} />
      <Field label="Email (opcional)" value={email} onChange={setE} placeholder="vos@correo.com" type="email"
        helper="Te mandamos el comprobante por mail." />
      <div style={{ marginTop: 'auto', paddingTop: 8 }}>
        <Button full disabled={!valid} onClick={() => onContinue({ patente, tipo, mins })}>Continuar al pago</Button>
      </div>
    </div>
  );
}

/* 4 · Pago */
function PagoScreen({ data, onPaid }) {
  const monto = (data.mins / 30 * 50);
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', minHeight: '100%', gap: 18 }}>
      <h1 style={{ font: '700 24px var(--font-sans)', color: 'var(--fg1)', margin: 0 }}>Confirmá y pagá</h1>
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-1)', padding: 18 }}>
        {[['Patente', data.patente], ['Vehículo', data.tipo === 'auto' ? 'Auto' : 'Moto'], ['Tiempo', `${data.mins} min`], ['Cuadra', 'Balcarce 200']].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ font: '400 16px var(--font-sans)', color: 'var(--fg2)' }}>{k}</span>
            <span style={{ font: '500 16px var(--font-mono)', color: 'var(--fg1)' }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12 }}>
          <span style={{ font: '700 18px var(--font-sans)', color: 'var(--fg1)' }}>Total</span>
          <span style={{ font: '600 22px var(--font-mono)', color: 'var(--fg1)' }}>$ {monto.toLocaleString('es-AR')}</span>
        </div>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Button full variant="mp" icon="wallet" onClick={() => onPaid('mp')}>Pagar con Mercado Pago</Button>
        <Button full variant="secondary" icon="cash" onClick={() => onPaid('efectivo')}>Pagar en efectivo al permisionario</Button>
      </div>
    </div>
  );
}

/* 5 · Comprobante */
function ComprobanteScreen({ data, onHome }) {
  const monto = (data.mins / 30 * 50);
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', minHeight: '100%', gap: 18 }}>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-bg)', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
          <Icon name="check" size={36} color="var(--success)" strokeWidth={3} />
        </div>
        <h1 style={{ font: '700 24px var(--font-sans)', color: 'var(--fg1)', margin: '0 0 4px' }}>Listo, ya estás cubierto</h1>
        <p style={{ font: '400 18px var(--font-sans)', color: 'var(--fg2)', margin: 0 }}>Tu sesión está activa hasta las <b style={{ color: 'var(--fg1)' }}>14:30</b>.</p>
      </div>
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-1)', overflow: 'hidden' }}>
        <div style={{ background: 'var(--blue-500)', color: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ font: '700 16px var(--font-sans)' }}>Comprobante</span>
          <span style={{ font: '400 13px var(--font-mono)', opacity: .9 }}>N° 004821</span>
        </div>
        <div style={{ padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <img src="../../assets/qr-placeholder.svg" alt="Código de verificación" style={{ width: 88, height: 88, borderRadius: 8, border: '1px solid var(--border)' }} />
          <div style={{ display: 'grid', gap: 8 }}>
            <div><div style={{ font: '500 12px var(--font-sans)', color: 'var(--fg3)', textTransform: 'uppercase' }}>Patente</div><div style={{ font: '500 18px var(--font-mono)' }}>{data.patente}</div></div>
            <div><div style={{ font: '500 12px var(--font-sans)', color: 'var(--fg3)', textTransform: 'uppercase' }}>Monto</div><div style={{ font: '500 18px var(--font-mono)' }}>$ {monto.toLocaleString('es-AR')}</div></div>
          </div>
        </div>
      </div>
      <Banner tone="info">Acordate de tu DNI físico por si te lo piden.</Banner>
      <div style={{ marginTop: 'auto' }}>
        <Button full variant="ghost" onClick={onHome}>Volver al inicio</Button>
      </div>
    </div>
  );
}

Object.assign(window, { ScanScreen, ScannerScreen, PatenteScreen, PagoScreen, ComprobanteScreen });
