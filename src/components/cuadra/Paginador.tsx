'use client';

import {motion} from 'motion/react';
import {ChevronLeft, ChevronRight} from 'lucide-react';

interface Props {
  paginaActual: number; // 1-based
  totalPaginas: number;
  onCambio: (pagina: number) => void;
  totalItems?: number;
  porPagina?: number;
  etiqueta?: string;
}

/** Devuelve los números de página a mostrar, con elipsis cuando son muchas. */
function rangoPaginas(actual: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({length: total}, (_, i) => i + 1);
  const paginas: (number | 'gap')[] = [1];
  const inicio = Math.max(2, actual - 1);
  const fin = Math.min(total - 1, actual + 1);
  if (inicio > 2) paginas.push('gap');
  for (let i = inicio; i <= fin; i++) paginas.push(i);
  if (fin < total - 1) paginas.push('gap');
  paginas.push(total);
  return paginas;
}

const BTN =
  'flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 disabled:pointer-events-none';

export default function Paginador({
  paginaActual,
  totalPaginas,
  onCambio,
  totalItems,
  porPagina,
  etiqueta = 'resultados',
}: Props) {
  if (totalPaginas <= 1) return null;

  const paginas = rangoPaginas(paginaActual, totalPaginas);
  const conRango = totalItems != null && porPagina != null;
  const desde = conRango ? (paginaActual - 1) * porPagina! + 1 : 0;
  const hasta = conRango ? Math.min(paginaActual * porPagina!, totalItems!) : 0;

  return (
    <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
      {conRango && (
        <p className="text-xs text-center sm:text-left" style={{color: 'var(--fg3)'}}>
          Mostrando{' '}
          <span style={{color: 'var(--fg1)', fontWeight: 600}}>
            {desde}–{hasta}
          </span>{' '}
          de {totalItems} {etiqueta}
        </p>
      )}

      <nav className="flex items-center justify-center gap-1" aria-label="Paginación">
        <motion.button
          whileTap={{scale: 0.92}}
          onClick={() => onCambio(paginaActual - 1)}
          disabled={paginaActual === 1}
          className={`${BTN} hover:bg-[var(--bg-subtle)]`}
          style={{color: 'var(--fg2)'}}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </motion.button>

        {paginas.map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} className="px-1.5 text-sm select-none" style={{color: 'var(--fg3)'}}>
              …
            </span>
          ) : (
            <motion.button
              key={p}
              whileTap={{scale: 0.92}}
              onClick={() => onCambio(p)}
              className={`${BTN} ${p === paginaActual ? '' : 'hover:bg-[var(--bg-subtle)]'}`}
              style={
                p === paginaActual
                  ? {backgroundColor: 'var(--primary)', color: '#fff'}
                  : {color: 'var(--fg2)'}
              }
              aria-current={p === paginaActual ? 'page' : undefined}
            >
              {p}
            </motion.button>
          )
        )}

        <motion.button
          whileTap={{scale: 0.92}}
          onClick={() => onCambio(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className={`${BTN} hover:bg-[var(--bg-subtle)]`}
          style={{color: 'var(--fg2)'}}
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </motion.button>
      </nav>
    </div>
  );
}
