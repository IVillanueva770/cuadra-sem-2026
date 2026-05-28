/* Exploración de logo Cuadra — 5 conceptos. Símbolos vectoriales recolorables vía currentColor. */
/* eslint-disable */
let __uid = 0;
const nextId = () => `lg${++__uid}`;

/* Símbolo por concepto. color define el trazo/relleno; los calados (P) muestran el fondo. */
function Sym({ concept, size = 48 }) {
  const id = nextId();
  const common = { width: size, height: size, viewBox: '0 0 64 64', fill: 'none' };
  switch (concept) {
    case 'A': // pin + P calada
      return (
        <svg {...common}>
          <defs>
            <mask id={id}>
              <rect width="64" height="64" fill="#fff" />
              <text x="32" y="38" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontWeight="800" fontSize="26" fill="#000">P</text>
            </mask>
          </defs>
          <path d="M32 59 C32 59 53 38 53 24.5 A21 21 0 1 0 11 24.5 C11 38 32 59 32 59 Z" fill="currentColor" mask={`url(#${id})`} />
        </svg>
      );
    case 'B': // corazón de un trazo
      return (
        <svg {...common}>
          <path d="M32 53 C16 42 8 32.5 8 23.5 C8 15.8 13.6 10 20.5 10 C25.6 10 29.6 13 32 17.2 C34.4 13 38.4 10 43.5 10 C50.4 10 56 15.8 56 23.5 C56 32.5 48 42 32 53 Z"
            fill="none" stroke="currentColor" strokeWidth="6.5" strokeLinejoin="round" />
        </svg>
      );
    case 'C': // corchetes + auto (espacio marcado)
      return (
        <svg {...common}>
          <path d="M25 11 H15 a5 5 0 0 0 -5 5 V48 a5 5 0 0 0 5 5 H25" fill="none" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M39 11 H49 a5 5 0 0 1 5 5 V48 a5 5 0 0 1 -5 5 H39" fill="none" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="26" y="23" width="12" height="18" rx="4" fill="currentColor" />
        </svg>
      );
    case 'D': // marca tipográfica: solo un punto-lugar
      return (
        <svg {...common}>
          <circle cx="32" cy="26" r="13" fill="none" stroke="currentColor" strokeWidth="6.5" />
          <circle cx="32" cy="26" r="0.5" fill="currentColor" stroke="currentColor" strokeWidth="7" />
          <path d="M32 39 V57" stroke="currentColor" strokeWidth="6.5" strokeLinecap="round" />
        </svg>
      );
    case 'E': // C abierta que abraza un punto
      return (
        <svg {...common}>
          <path d="M46 19 A20 20 0 1 0 46 45" fill="none" stroke="currentColor" strokeWidth="8.5" strokeLinecap="round" />
          <circle cx="49" cy="32" r="6.5" fill="currentColor" />
        </svg>
      );
    case 'ticket': // comprobante con muescas + check de pago
      return (
        <svg {...common}>
          <defs>
            <mask id={id}>
              <rect width="64" height="64" fill="#fff" />
              <path d="M23 32.5 l5.5 5.5 L41 26" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </mask>
          </defs>
          <path d="M15 16 H49 a6 6 0 0 1 6 6 V28 a4 4 0 0 0 0 8 V42 a6 6 0 0 1 -6 6 H15 a6 6 0 0 1 -6 -6 V36 a4 4 0 0 0 0 -8 V22 a6 6 0 0 1 6 -6 Z" fill="currentColor" mask={`url(#${id})`} />
        </svg>
      );
    case 'meter': // parquímetro
      return (
        <svg {...common}>
          <defs>
            <mask id={id}>
              <rect width="64" height="64" fill="#fff" />
              <circle cx="32" cy="21" r="6.5" fill="#000" />
            </mask>
          </defs>
          <rect x="18" y="8" width="28" height="27" rx="7" fill="currentColor" mask={`url(#${id})`} />
          <path d="M32 21 V16 M32 21 H36" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          <rect x="29" y="35" width="6" height="16" rx="2" fill="currentColor" />
          <rect x="22" y="51" width="20" height="6" rx="3" fill="currentColor" />
        </svg>
      );
    case 'auto': // auto (vista lateral) sobre su lugar
      return (
        <svg {...common}>
          <defs>
            <mask id={id}>
              <rect width="64" height="64" fill="#fff" />
              <circle cx="22" cy="42" r="2.2" fill="#000" />
              <circle cx="42" cy="42" r="2.2" fill="#000" />
              <path d="M24 28 l3 -5 h10 l3 5 z" fill="#000" />
            </mask>
          </defs>
          <path d="M10 41 v-3 a3 3 0 0 1 2.4 -2.9 l3.6 -7.6 a4 4 0 0 1 3.6 -2.5 h20.8 a4 4 0 0 1 3.6 2.5 l3.6 7.6 a3 3 0 0 1 2.4 2.9 v3 a2 2 0 0 1 -2 2 h-2.6 a5.4 5.4 0 0 1 -10.8 0 h-9.2 a5.4 5.4 0 0 1 -10.8 0 H12 a2 2 0 0 1 -2 -2 Z" fill="currentColor" mask={`url(#${id})`} />
          <path d="M12 50 H52" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.45" />
        </svg>
      );
    case 'esquina': // la cuadra: cordón con autos estacionados, un lugar libre
      return (
        <svg {...common}>
          <defs>
            <mask id={id}>
              <rect width="64" height="64" fill="#fff" />
              <rect x="27" y="22" width="10" height="15" rx="3" fill="#000" />
            </mask>
          </defs>
          <g mask={`url(#${id})`}>
            <rect x="13" y="22" width="10" height="15" rx="3" fill="currentColor" />
            <rect x="27" y="22" width="10" height="15" rx="3" fill="currentColor" />
            <rect x="41" y="22" width="10" height="15" rx="3" fill="currentColor" />
          </g>
          <rect x="8" y="42" width="48" height="8" rx="4" fill="currentColor" />
        </svg>
      );
    case 'tiempo': // reloj con P = estacionamiento medido por tiempo
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="5" />
          <path d="M32 10 V14 M54 32 H50 M32 54 V50 M10 32 H14" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
          <text x="32" y="41" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontWeight="800" fontSize="22" fill="currentColor">P</text>
        </svg>
      );
    /* ---- Ronda 3: recibo/factura ---- */
    case 'recibo1': { // recibo con troquelado en zig-zag abajo + renglones
      const zig = []; const teeth = 7, top = 50, w = 38, x0 = 13, step = w / teeth;
      zig.push(`M${x0} ${top}`);
      for (let i = 0; i < teeth; i++) zig.push(`L${x0 + step * (i + 0.5)} ${top + 4.5} L${x0 + step * (i + 1)} ${top}`);
      return (
        <svg {...common}>
          <path d={`M19 12 H45 a6 6 0 0 1 6 6 V${top} ${zig.join(' ')} V18 a6 6 0 0 1 6 -6 Z`}
            fill="currentColor" transform="translate(0,0)" style={{ display: 'none' }} />
          <path d={`M13 18 a6 6 0 0 1 6 -6 H45 a6 6 0 0 1 6 6 V${top} ${[...Array(teeth)].map((_, i) => `L${51 - step * (i + 0.5)} ${top + 4.5} L${51 - step * (i + 1)} ${top}`).join(' ')} Z`}
            fill="currentColor" />
          <g stroke="#fff" strokeWidth="3" strokeLinecap="round">
            <path d="M20 22 H44" /><path d="M20 30 H44" opacity="0.7" /><path d="M20 38 H36" opacity="0.7" />
          </g>
        </svg>
      );
    }
    case 'recibo2': { // recibo con check de pagado + troquel
      const teeth = 6, top = 50, x0 = 14, w = 36, step = w / teeth;
      return (
        <svg {...common}>
          <path d={`M14 18 a6 6 0 0 1 6 -6 H44 a6 6 0 0 1 6 6 V${top} ${[...Array(teeth)].map((_, i) => `L${50 - step * (i + 0.5)} ${top + 4.5} L${50 - step * (i + 1)} ${top}`).join(' ')} Z`}
            fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M24 27 l5 5 l10 -11" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    case 'recibo3': { // recibo + signo $ , troquel arriba y abajo
      const teeth = 6, x0 = 15, w = 34, step = w / teeth;
      const zz = (y, dir) => [...Array(teeth)].map((_, i) => `L${x0 + step * (i + 0.5)} ${y + dir * 4} L${x0 + step * (i + 1)} ${y}`).join(' ');
      return (
        <svg {...common}>
          <path d={`M15 14 ${zz(14, 1)} V50 ${[...Array(teeth)].map((_, i) => `L${49 - step * (i + 0.5)} ${50 + 4} L${49 - step * (i + 1)} ${50}`).join(' ')} Z`}
            fill="currentColor" />
          <text x="32" y="40" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontWeight="800" fontSize="26" fill="#fff">$</text>
        </svg>
      );
    }
    /* ---- Ronda 3: señalización / cartel de estacionamiento ---- */
    case 'cartel1': // cuadrado azul + auto estacionado (vista lateral) minimalista
      return (
        <svg {...common}>
          <rect x="6" y="6" width="52" height="52" rx="13" fill="currentColor" />
          <g fill="#fff">
            {/* cuerpo del auto */}
            <path d="M14 36 v-3.2 a2.4 2.4 0 0 1 1.7 -2.3 l2.2 -0.6 l3.4 -4.6 a4 4 0 0 1 3.2 -1.6 h10.1 a4 4 0 0 1 3 1.35 l3.6 4.1 l3 0.9 a2.4 2.4 0 0 1 1.7 2.3 V36 a2 2 0 0 1 -2 2 H16 a2 2 0 0 1 -2 -2 Z" />
            {/* línea del lugar (suelo) */}
            <rect x="16" y="43" width="32" height="3.4" rx="1.7" opacity="0.5" />
          </g>
          {/* ventanilla calada */}
          <path d="M25 24.8 h8.6 a2 2 0 0 1 1.5 0.7 l2.4 2.8 h-15 l1.5 -2.8 a2 2 0 0 1 1 -0.7 Z" fill="currentColor" />
          {/* ruedas */}
          <g fill="currentColor"><circle cx="24" cy="38" r="3.6" /><circle cx="40" cy="38" r="3.6" /></g>
          <g fill="#fff"><circle cx="24" cy="38" r="1.5" /><circle cx="40" cy="38" r="1.5" /></g>
        </svg>
      );
    case 'cartel2': // cuadrado azul + P grande + auto chico debajo
      return (
        <svg {...common}>
          <rect x="6" y="6" width="52" height="52" rx="13" fill="currentColor" />
          <text x="31" y="37" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontWeight="800" fontSize="29" fill="#fff">P</text>
          {/* mini auto lateral debajo */}
          <g fill="#fff">
            <path d="M18 48 v-1.4 a1.2 1.2 0 0 1 0.9 -1.15 l1.1 -0.3 l1.7 -2.1 a2 2 0 0 1 1.55 -0.75 h8.5 a2 2 0 0 1 1.5 0.7 l1.8 2.15 l1.2 0.3 a1.2 1.2 0 0 1 0.9 1.15 V48 a1 1 0 0 1 -1 1 H19 a1 1 0 0 1 -1 -1 Z" />
          </g>
          <g fill="currentColor"><circle cx="24" cy="49" r="1.7" /><circle cx="34" cy="49" r="1.7" /></g>
        </svg>
      );
    case 'cartel3': // cuadrado azul, auto visto de frente sencillo
      return (
        <svg {...common}>
          <rect x="6" y="6" width="52" height="52" rx="13" fill="currentColor" />
          <g fill="#fff">
            <path d="M19 30 l2.2 -5.4 a4 4 0 0 1 3.7 -2.6 h14.2 a4 4 0 0 1 3.7 2.6 L45 30 Z" />
            <rect x="17" y="29" width="30" height="14" rx="4.5" />
          </g>
          <g fill="currentColor">
            <rect x="22" y="32.5" width="6" height="4" rx="2" />
            <rect x="36" y="32.5" width="6" height="4" rx="2" />
          </g>
          <g fill="#fff"><rect x="15" y="43" width="6" height="5" rx="2" /><rect x="43" y="43" width="6" height="5" rx="2" /></g>
        </svg>
      );
    default: return null;
  }
}

/* Wordmark "Cuadra" — variantes leves por concepto */
function Wordmark({ concept, color = 'var(--fg1)', size = 38 }) {
  const weight = concept === 'B' ? 600 : concept === 'D' ? 800 : 700;
  const tracking = concept === 'D' ? '-0.02em' : '-0.015em';
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: weight, fontSize: size, letterSpacing: tracking, color, lineHeight: 1 }}>Cuadra</span>
      {concept === 'D' && (
        <svg width="100%" height="8" viewBox="0 0 120 8" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: -7, display: 'block' }}>
          <path d="M2 4 H118" stroke={color} strokeWidth="4" strokeLinecap="round" />
          <rect x="82" y="0" width="8" height="8" rx="2.5" fill={color} />
        </svg>
      )}
    </div>
  );
}

/* Lockup horizontal: símbolo + wordmark */
function Lockup({ concept, dark, sign }) {
  const ink = dark ? '#fff' : 'var(--blue-500)';
  const word = dark ? '#fff' : 'var(--fg1)';
  // Carteles: el símbolo ES un cuadrado azul; en reverse usamos cuadrado blanco con auto azul
  if (sign) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ color: dark ? '#fff' : 'var(--blue-500)', display: 'flex', filter: dark ? 'none' : 'none' }}>
          <Sym concept={concept} size={46} />
        </span>
        <span style={{ color: word }}><Wordmark concept={concept} color={word} /></span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {concept !== 'D' && <span style={{ color: ink, display: 'flex' }}><Sym concept={concept} size={46} /></span>}
      <span style={{ color: word }}><Wordmark concept={concept} color={word} /></span>
    </div>
  );
}

/* App icon (PWA) — símbolo blanco sobre azul redondeado */
function AppIcon({ concept, sign }) {
  if (sign) {
    // el símbolo ya es el cartel azul completo
    return <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-1)', display: 'flex' }}><span style={{ color: 'var(--blue-500)', display: 'flex' }}><Sym concept={concept} size={56} /></span></div>;
  }
  return (
    <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--blue-500)', display: 'grid', placeItems: 'center', color: '#fff', boxShadow: 'var(--shadow-1)' }}>
      {concept === 'D'
        ? <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 32, color: '#fff', lineHeight: 1 }}>C</span>
        : <span style={{ display: 'flex' }}><Sym concept={concept} size={34} /></span>}
    </div>
  );
}

function ConceptCard({ concept, nombre, idea, sign }) {
  return (
    <div style={{ height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      {/* lockup sobre blanco */}
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: '26px 20px', borderBottom: '1px solid var(--border)' }}>
        <Lockup concept={concept} sign={sign} />
      </div>
      {/* fila reverse + icono */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 22px' }}>
        <div style={{ flex: 1, background: sign ? 'var(--blue-800)' : 'var(--blue-500)', borderRadius: 10, padding: '14px 16px', display: 'grid', placeItems: 'center' }}>
          <Lockup concept={concept} dark sign={sign} />
        </div>
        <AppIcon concept={concept} sign={sign} />
      </div>
      {/* idea */}
      <div style={{ padding: '0 22px 20px' }}>
        <div style={{ font: '700 14px var(--font-sans)', color: 'var(--fg1)' }}>{nombre}</div>
        <div style={{ font: '400 13px/1.45 var(--font-sans)', color: 'var(--fg2)', marginTop: 3 }}>{idea}</div>
      </div>
    </div>
  );
}

Object.assign(window, { Sym, Wordmark, Lockup, AppIcon, ConceptCard });
