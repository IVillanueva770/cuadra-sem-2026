'use client';

import {useState, useMemo, useEffect} from 'react';
import Link from 'next/link';
import {motion} from 'motion/react';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Edit, Search} from 'lucide-react';
import {formatARS} from '@/lib/utils';
import Paginador from '@/components/cuadra/Paginador';

const BADGE_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  activo: 'success',
  suspendido: 'warning',
  baja: 'destructive',
};

const MEDIO_LABEL: Record<string, string> = {
  cuenta_bancaria: 'Cuenta bancaria',
  mp: 'Mercado Pago',
  efectivo_sucursal: 'Efectivo en sucursal',
};

const ESTADOS = ['todos', 'activo', 'suspendido', 'baja'] as const;
type EstadoFiltro = (typeof ESTADOS)[number];

export type PermisionarioConMetrica = {
  id: string;
  nombre_completo: string;
  dni: string;
  qr_code: string | null;
  medio_cobro_tipo: string;
  estado: string;
  fecha_alta: string | null;
  email: string | null;
  recaudacion30d: number;
  sesiones30d: number;
};

interface Props {
  datos: PermisionarioConMetrica[];
}

export default function PermisListClient({datos}: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [estadoActivo, setEstadoActivo] = useState<EstadoFiltro>('todos');

  const filtrados = useMemo(() => {
    let lista = datos;

    if (estadoActivo !== 'todos') {
      lista = lista.filter((p) => p.estado === estadoActivo);
    }

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      lista = lista.filter(
        (p) =>
          p.nombre_completo.toLowerCase().includes(q) ||
          p.dni.toLowerCase().includes(q)
      );
    }

    return lista;
  }, [datos, estadoActivo, busqueda]);

  const POR_PAGINA = 8;
  const [pagina, setPagina] = useState(1);
  useEffect(() => {
    setPagina(1);
  }, [estadoActivo, busqueda]);
  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const visibles = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <div className="space-y-4">
      {/* Buscador + chips */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Buscador */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{color: 'var(--fg3)'}}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o DNI…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border outline-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border)',
              color: 'var(--fg1)',
            }}
          />
        </div>

        {/* Chips estado */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {ESTADOS.map((estado) => {
            const activo = estadoActivo === estado;
            return (
              <button
                key={estado}
                onClick={() => setEstadoActivo(estado)}
                className="relative px-3 py-1.5 text-xs font-medium rounded-full border transition-colors"
                style={{
                  borderColor: activo ? 'var(--primary)' : 'var(--border)',
                  color: activo ? 'var(--primary)' : 'var(--fg2)',
                  backgroundColor: 'transparent',
                }}
              >
                {activo && (
                  <motion.span
                    layoutId="permi-estado-highlight"
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
      </div>

      {/* Contador */}
      <p className="text-xs" style={{color: 'var(--fg3)'}}>
        {filtrados.length} de {datos.length} permisionarios
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
        <div className="overflow-x-auto" style={totalPaginas > 1 ? {minHeight: POR_PAGINA * 58 + 44} : undefined}>
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border)',
                  backgroundColor: 'var(--bg-subtle)',
                }}
              >
                <th
                  className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{color: 'var(--fg3)'}}
                >
                  Nombre
                </th>
                <th
                  className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{color: 'var(--fg3)'}}
                >
                  DNI
                </th>
                <th
                  className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{color: 'var(--fg3)'}}
                >
                  QR Code
                </th>
                <th
                  className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{color: 'var(--fg3)'}}
                >
                  Medio de cobro
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
                  Recaudación (30d)
                </th>
                <th
                  className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{color: 'var(--fg3)'}}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <motion.tbody key={pagina} initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.18}}>
              {filtrados.length > 0 ? (
                  visibles.map((p) => (
                    <tr
                      key={p.id}
                      style={{borderBottom: '1px solid var(--border)'}}
                      className="hover:bg-blue-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-medium" style={{color: 'var(--fg1)'}}>
                            {p.nombre_completo}
                          </p>
                          {p.email && (
                            <p className="text-xs mt-0.5" style={{color: 'var(--fg3)'}}>
                              {p.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-5 py-3.5 font-mono text-sm"
                        style={{color: 'var(--fg2)'}}
                      >
                        {p.dni}
                      </td>
                      <td
                        className="px-5 py-3.5 font-mono text-xs"
                        style={{color: 'var(--fg3)'}}
                      >
                        <span
                          className="inline-block max-w-[120px] truncate"
                          title={p.qr_code ?? undefined}
                        >
                          {p.qr_code}
                        </span>
                      </td>
                      <td className="px-5 py-3.5" style={{color: 'var(--fg2)'}}>
                        {MEDIO_LABEL[p.medio_cobro_tipo] ?? p.medio_cobro_tipo}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={BADGE_VARIANT[p.estado] ?? 'secondary'}>
                          {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        {p.recaudacion30d > 0 ? (
                          <div>
                            <p className="font-medium" style={{color: 'var(--fg1)'}}>
                              {formatARS(p.recaudacion30d)}
                            </p>
                            <p className="text-xs mt-0.5" style={{color: 'var(--fg3)'}}>
                              {p.sesiones30d} ses.
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs" style={{color: 'var(--fg3)'}}>
                            Sin actividad
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/permisionarios/${p.id}/editar`}>
                          <Button variant="ghost" size="sm" className="gap-1.5">
                            <Edit size={14} aria-hidden="true" />
                            Editar
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-8 text-center"
                      style={{color: 'var(--fg3)'}}
                    >
                      No hay permisionarios que coincidan con los filtros.
                    </td>
                  </tr>
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
        etiqueta="permisionarios"
      />
    </div>
  );
}
