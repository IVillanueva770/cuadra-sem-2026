'use client';

import {useState, useMemo, useEffect} from 'react';
import {motion} from 'motion/react';
import {Badge} from '@/components/ui/badge';
import Paginador from '@/components/cuadra/Paginador';

const ESTADOS_FILTRO = ['todos', 'procesado', 'pendiente', 'error'] as const;
type EstadoFiltro = (typeof ESTADOS_FILTRO)[number];

export type WebhookEvento = {
  id: string;
  source: string | null;
  event_type: string | null;
  payment_id: string | null;
  processed: boolean;
  error_message: string | null;
  received_at: string;
  processed_at: string | null;
};

function getEstado(e: WebhookEvento): 'procesado' | 'error' | 'pendiente' {
  if (e.processed) return 'procesado';
  if (e.error_message) return 'error';
  return 'pendiente';
}

interface Props {
  eventos: WebhookEvento[];
}

export default function AuditoriaClient({eventos}: Props) {
  const [estadoActivo, setEstadoActivo] = useState<EstadoFiltro>('todos');
  const [tipoActivo, setTipoActivo] = useState<string>('todos');

  // Contadores
  const contadores = useMemo(() => {
    const total = eventos.length;
    const procesados = eventos.filter((e) => e.processed).length;
    const errores = eventos.filter((e) => !e.processed && e.error_message).length;
    const pendientes = eventos.filter((e) => !e.processed && !e.error_message).length;
    return {total, procesados, errores, pendientes};
  }, [eventos]);

  // Tipos dinámicos
  const tipos = useMemo(() => {
    const set = new Set<string>();
    for (const e of eventos) {
      if (e.event_type) set.add(e.event_type);
    }
    return Array.from(set).sort();
  }, [eventos]);

  const filtrados = useMemo(() => {
    let lista = eventos;

    if (estadoActivo !== 'todos') {
      lista = lista.filter((e) => getEstado(e) === estadoActivo);
    }

    if (tipoActivo !== 'todos') {
      lista = lista.filter((e) => e.event_type === tipoActivo);
    }

    return lista;
  }, [eventos, estadoActivo, tipoActivo]);

  const POR_PAGINA = 15;
  const [pagina, setPagina] = useState(1);
  useEffect(() => {
    setPagina(1);
  }, [estadoActivo, tipoActivo]);
  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const visibles = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <div className="space-y-5">
      {/* Contadores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {label: 'Total', valor: contadores.total, color: 'var(--fg2)'},
          {label: 'Procesados', valor: contadores.procesados, color: 'var(--success)'},
          {label: 'Pendientes', valor: contadores.pendientes, color: 'var(--warning, #f59e0b)'},
          {label: 'Con error', valor: contadores.errores, color: 'var(--error)'},
        ].map(({label, valor, color}) => (
          <div
            key={label}
            className="rounded-xl border px-4 py-3"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border)',
            }}
          >
            <p className="text-xs" style={{color: 'var(--fg3)'}}>
              {label}
            </p>
            <p className="text-xl font-bold mt-0.5" style={{color}}>
              {valor}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros por estado */}
      <div className="flex flex-wrap gap-2">
        {ESTADOS_FILTRO.map((estado) => {
          const activo = estadoActivo === estado;
          return (
            <button
              key={estado}
              onClick={() => setEstadoActivo(estado)}
              className="relative px-3 py-1.5 text-xs font-medium rounded-full border transition-colors"
              style={{
                borderColor: activo ? 'var(--primary)' : 'var(--border)',
                color: 'transparent',
                backgroundColor: 'transparent',
              }}
            >
              {activo && (
                <motion.span
                  layoutId="audit-estado-highlight"
                  className="absolute inset-0 rounded-full"
                  style={{backgroundColor: 'var(--primary)'}}
                  initial={false}
                  transition={{type: 'spring', stiffness: 400, damping: 30}}
                />
              )}
              <span className="relative" style={{color: activo ? '#fff' : 'var(--fg2)'}}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filtros por tipo (dinámicos) */}
      {tipos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {['todos', ...tipos].map((tipo) => {
            const activo = tipoActivo === tipo;
            return (
              <button
                key={tipo}
                onClick={() => setTipoActivo(tipo)}
                className="relative px-3 py-1.5 text-xs font-medium rounded-full border transition-colors"
                style={{
                  borderColor: activo ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: 'transparent',
                }}
              >
                {activo && (
                  <motion.span
                    layoutId="audit-tipo-highlight"
                    className="absolute inset-0 rounded-full"
                    style={{backgroundColor: 'var(--accent)'}}
                    initial={false}
                    transition={{type: 'spring', stiffness: 400, damping: 30}}
                  />
                )}
                <span className="relative" style={{color: activo ? '#fff' : 'var(--fg2)'}}>
                  {tipo === 'todos' ? 'Todos los tipos' : tipo}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Contador */}
      <p className="text-xs" style={{color: 'var(--fg3)'}}>
        {filtrados.length} de {eventos.length} eventos
      </p>

      {/* Tabla */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <th
                  className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{color: 'var(--fg3)'}}
                >
                  Recibido
                </th>
                <th
                  className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{color: 'var(--fg3)'}}
                >
                  Fuente
                </th>
                <th
                  className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{color: 'var(--fg3)'}}
                >
                  Tipo
                </th>
                <th
                  className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{color: 'var(--fg3)'}}
                >
                  Payment ID
                </th>
                <th
                  className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{color: 'var(--fg3)'}}
                >
                  Estado
                </th>
                <th
                  className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{color: 'var(--fg3)'}}
                >
                  Error
                </th>
              </tr>
            </thead>
            <motion.tbody key={pagina} initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.18}}>
                {filtrados.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center"
                      style={{color: 'var(--fg3)'}}
                    >
                      No hay eventos que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  visibles.map((e) => {
                    const fecha = new Date(e.received_at);
                    const fechaStr = fecha.toLocaleDateString('es-AR', {
                      timeZone: 'America/Argentina/Salta',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    });
                    const horaStr = fecha.toLocaleTimeString('es-AR', {
                      timeZone: 'America/Argentina/Salta',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });
                    const estado = getEstado(e);

                    return (
                      <tr
                        key={e.id}
                        style={{borderBottom: '1px solid var(--border)'}}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <p
                            className="text-xs font-medium"
                            style={{color: 'var(--fg1)'}}
                          >
                            {fechaStr}
                          </p>
                          <p
                            className="text-xs font-mono"
                            style={{color: 'var(--fg3)'}}
                          >
                            {horaStr}
                          </p>
                        </td>
                        <td
                          className="px-5 py-3 text-xs font-mono"
                          style={{color: 'var(--fg2)'}}
                        >
                          {e.source}
                        </td>
                        <td
                          className="px-5 py-3 text-xs font-mono"
                          style={{color: 'var(--fg2)'}}
                        >
                          {e.event_type}
                        </td>
                        <td
                          className="px-5 py-3 text-xs font-mono"
                          style={{color: 'var(--fg3)'}}
                        >
                          {e.payment_id ?? '—'}
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            variant={
                              estado === 'procesado'
                                ? 'success'
                                : estado === 'error'
                                  ? 'destructive'
                                  : 'warning'
                            }
                          >
                            {estado.charAt(0).toUpperCase() + estado.slice(1)}
                          </Badge>
                        </td>
                        <td
                          className="px-5 py-3 text-xs max-w-[200px] truncate"
                          style={{
                            color: e.error_message ? 'var(--error)' : 'var(--fg3)',
                          }}
                          title={e.error_message ?? undefined}
                        >
                          {e.error_message ?? '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
            </motion.tbody>
          </table>
        </div>
      </div>

      <Paginador
        paginaActual={pagina}
        totalPaginas={totalPaginas}
        onCambio={setPagina}
        totalItems={filtrados.length}
        porPagina={POR_PAGINA}
        etiqueta="eventos"
      />
    </div>
  );
}
