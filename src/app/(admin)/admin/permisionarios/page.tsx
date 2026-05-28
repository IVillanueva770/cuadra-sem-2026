import type {Metadata} from 'next';
import Link from 'next/link';
import {createServiceClient} from '@/lib/supabase/server';
import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {UserPlus, Edit} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Permisionarios · Panel Muni Cuadra',
};

export const dynamic = 'force-dynamic';

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

export default async function PermisionariosPage() {
  const supabase = createServiceClient();

  const {data: permisionarios, error} = await supabase
    .from('permisionarios')
    .select('id, nombre_completo, dni, qr_code, medio_cobro_tipo, estado, fecha_alta, email')
    .order('nombre_completo', {ascending: true});

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4" style={{color: 'var(--fg1)'}}>
          Permisionarios
        </h1>
        <p className="text-sm" style={{color: 'var(--error)'}}>
          Error al cargar permisionarios: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{color: 'var(--fg1)'}}>
            Permisionarios
          </h1>
          <p className="text-sm mt-0.5" style={{color: 'var(--fg2)'}}>
            {permisionarios?.length ?? 0} registrados en el sistema
          </p>
        </div>
        <Link href="/admin/permisionarios/nuevo">
          <Button className="gap-2">
            <UserPlus size={16} aria-hidden="true" />
            Nuevo permisionario
          </Button>
        </Link>
      </div>

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
              <tr style={{borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-subtle)'}}>
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
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {permisionarios && permisionarios.length > 0 ? (
                permisionarios.map((p) => (
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
                    <td className="px-5 py-3.5 font-mono text-sm" style={{color: 'var(--fg2)'}}>
                      {p.dni}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs" style={{color: 'var(--fg3)'}}>
                      <span
                        className="inline-block max-w-[120px] truncate"
                        title={p.qr_code}
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
                  <td colSpan={6} className="px-5 py-8 text-center" style={{color: 'var(--fg3)'}}>
                    No hay permisionarios registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
