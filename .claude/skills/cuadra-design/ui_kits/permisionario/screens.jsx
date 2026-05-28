/* Permisionario — alta accesibilidad: letras grandes, contraste alto, botones grandes, vocabulario simple */
/* eslint-disable */
const { useState: usePS } = React;

/* Tarjeta de sesión en la cuadra */
function SesionCard({ s, onCobrar, onExtender }) {
  const sm = STATE_STYLES[s.estado];
  return (
    <div style={{ background: '#fff', border: `1px solid var(--border)`, borderLeft: 'none', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-1)', padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ font: '700 26px var(--font-mono)', color: 'var(--fg1)', letterSpacing: '0.02em' }}>{s.patente}</span>
        <Badge state={s.estado} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, font: '500 18px var(--font-sans)', color: 'var(--fg2)', marginBottom: s.estado === 'activa' || s.estado === 'pendiente' ? 14 : 0 }}>
        <Icon name="clock" size={20} color="var(--fg3)" />
        {s.estado === 'activa' && <span>Vence a las <b style={{ color: 'var(--fg1)' }}>{s.hasta}</b></span>}
        {s.estado === 'expirada' && <span>Venció a las {s.hasta}</span>}
        {s.estado === 'pendiente' && <span style={{ color: 'var(--warning-fg)' }}>Pasó la hora — cobrá la extensión</span>}
      </div>
      {s.estado === 'activa' && <Button full variant="secondary" icon="plus" onClick={onExtender}>Extender tiempo</Button>}
      {s.estado === 'pendiente' && <Button full onClick={onCobrar} icon="cash">Cobrar extensión · ${s.deuda}</Button>}
    </div>
  );
}

/* Pantalla: Mi cuadra (sesiones activas + saldo) */
function MiCuadra({ sesiones, saldo, onCobrar, onExtender }) {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--blue-500)', color: '#fff', borderRadius: 'var(--radius-lg)', padding: 18 }}>
        <div style={{ font: '500 16px var(--font-sans)', opacity: .9 }}>Cobrado hoy en tu cuadra</div>
        <div style={{ font: '600 38px var(--font-mono)', margin: '4px 0' }}>$ {saldo.toLocaleString('es-AR')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, font: '500 15px var(--font-sans)', opacity: .92 }}>
          <Icon name="pin" size={16} /> Balcarce 200 · turno de mañana
        </div>
      </div>
      <h2 style={{ font: '700 22px var(--font-sans)', color: 'var(--fg1)', margin: '4px 0 0' }}>Autos en tu cuadra</h2>
      {sesiones.map(s => <SesionCard key={s.patente} s={s} onCobrar={() => onCobrar(s)} onExtender={() => onExtender(s)} />)}
    </div>
  );
}

/* Pantalla: Registrar cobro en efectivo */
function Cobrar({ onDone }) {
  const [patente, setP] = usePS('');
  const [mins, setM] = usePS(60);
  const valid = patente.replace(/\s/g, '').length >= 6;
  const monto = mins / 30 * 50;
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Banner tone="info" icon="cash">Estás registrando un <b>cobro en efectivo</b>. Anotá la patente del auto.</Banner>
      <div style={{ height: 18 }} />
      <Field label="Patente del auto" value={patente} onChange={v => setP(v.toUpperCase())} placeholder="AB 123 CD" mono
        helper={valid ? 'Patente lista' : 'Mirá la chapa del auto'} error={patente && !valid ? 'Faltan números o letras' : ''} />
      <label style={{ display: 'block', font: '600 17px var(--font-sans)', color: 'var(--fg1)', marginBottom: 8 }}>Tiempo que paga</label>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {[30, 60, 120].map(t => (
          <button key={t} onClick={() => setM(t)} style={{ flex: 1, minHeight: 64, borderRadius: 'var(--radius-md)', cursor: 'pointer',
            border: `2px solid ${mins === t ? 'var(--primary)' : 'var(--border-strong)'}`, background: mins === t ? 'var(--blue-50)' : '#fff',
            color: mins === t ? 'var(--primary)' : 'var(--fg2)', font: '600 18px var(--font-sans)' }}>
            {t < 60 ? `${t} min` : `${t / 60} h`}
          </button>
        ))}
      </div>
      <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ font: '600 18px var(--font-sans)', color: 'var(--fg1)' }}>A cobrar</span>
        <span style={{ font: '600 30px var(--font-mono)', color: 'var(--fg1)' }}>$ {monto.toLocaleString('es-AR')}</span>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: 16 }}>
        <Button full disabled={!valid} onClick={() => onDone({ patente, mins, monto })}>Confirmar cobro</Button>
      </div>
    </div>
  );
}

/* Confirmación grande tras cobrar */
function CobroOK({ data, onBack }) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100%', textAlign: 'center', gap: 16 }}>
      <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--success-bg)', display: 'grid', placeItems: 'center' }}>
        <Icon name="check" size={50} color="var(--success)" strokeWidth={3} />
      </div>
      <h1 style={{ font: '700 28px var(--font-sans)', color: 'var(--fg1)', margin: 0 }}>Cobro registrado</h1>
      <p style={{ font: '400 20px/1.5 var(--font-sans)', color: 'var(--fg2)', margin: 0 }}>
        Anotaste <b style={{ color: 'var(--fg1)' }}>$ {data.monto.toLocaleString('es-AR')}</b> de la patente <b style={{ fontFamily: 'var(--font-mono)' }}>{data.patente}</b>.<br />La sesión queda activa.
      </p>
      <div style={{ width: '100%', marginTop: 12 }}><Button full onClick={onBack}>Volver a mi cuadra</Button></div>
    </div>
  );
}

/* Pantalla: Mi credencial (QR grande del permisionario) */
function Credencial() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
      <h1 style={{ font: '700 24px var(--font-sans)', color: 'var(--fg1)', margin: '4px 0 0' }}>Mi credencial</h1>
      <p style={{ font: '400 18px var(--font-sans)', color: 'var(--fg2)', textAlign: 'center', margin: 0 }}>Mostrale este código al conductor para que escanee y pague.</p>
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-1)', padding: 22, textAlign: 'center', width: '100%' }}>
        <img src="../../assets/qr-placeholder.svg" alt="Tu código QR de cobro" style={{ width: 200, height: 200 }} />
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--blue-100)', color: 'var(--blue-700)', display: 'grid', placeItems: 'center', font: '700 18px var(--font-sans)' }}>RG</div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ font: '700 19px var(--font-sans)', color: 'var(--fg1)' }}>Ramón Gómez</div>
            <div style={{ font: '500 15px var(--font-sans)', color: 'var(--fg2)' }}>Permisionario · Balcarce 200</div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MiCuadra, Cobrar, CobroOK, Credencial });
