import type {CSSProperties} from 'react';

/**
 * Ícono de marca Cuadra (el auto estacionado dentro del cartel cuadrado).
 * Dibuja SOLO el auto sobre un cuadrado de color sólido — sin SVG con margen
 * transparente ni cuadros anidados. Una única fuente para todos los headers.
 *
 * tone="light": cuadro azul + auto blanco (para fondos claros: landing, login).
 * tone="dark":  cuadro blanco + auto azul (para fondos azules/oscuros: headers).
 */
export default function CuadraMark({
  size = 44,
  tone = 'light',
  className = '',
  style,
}: {
  size?: number;
  tone?: 'light' | 'dark';
  className?: string;
  style?: CSSProperties;
}) {
  const box = tone === 'light' ? 'var(--primary)' : '#FFFFFF';
  const body = tone === 'light' ? '#FFFFFF' : 'var(--primary)';
  const detail = tone === 'light' ? 'var(--primary)' : '#FFFFFF'; // ventanilla + rueda exterior
  const hub = tone === 'light' ? '#FFFFFF' : 'var(--primary)'; // centro de rueda

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{width: size, height: size, background: box, borderRadius: size * 0.26, ...style}}
      aria-hidden="true"
    >
      <svg
        viewBox="12 16 40 40"
        width={size * 0.72}
        height={size * 0.72}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14 36 v-3.2 a2.4 2.4 0 0 1 1.7 -2.3 l2.2 -0.6 l3.4 -4.6 a4 4 0 0 1 3.2 -1.6 h10.1 a4 4 0 0 1 3 1.35 l3.6 4.1 l3 0.9 a2.4 2.4 0 0 1 1.7 2.3 V36 a2 2 0 0 1 -2 2 H16 a2 2 0 0 1 -2 -2 Z"
          fill={body}
        />
        <rect x="16" y="43" width="32" height="3.4" rx="1.7" fill={body} opacity="0.5" />
        <path
          d="M25 24.8 h8.6 a2 2 0 0 1 1.5 0.7 l2.4 2.8 h-15 l1.5 -2.8 a2 2 0 0 1 1 -0.7 Z"
          fill={detail}
        />
        <circle cx="24" cy="38" r="3.6" fill={detail} />
        <circle cx="40" cy="38" r="3.6" fill={detail} />
        <circle cx="24" cy="38" r="1.5" fill={hub} />
        <circle cx="40" cy="38" r="1.5" fill={hub} />
      </svg>
    </div>
  );
}
