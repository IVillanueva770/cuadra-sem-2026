import type {Metadata} from 'next';
import Link from 'next/link';
import {createServiceClient} from '@/lib/supabase/server';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {ArrowLeft} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Editar permisionario · Panel Muni Cuadra',
};

export const dynamic = 'force-dynamic';

const MEDIO_LABEL: Record<string, string> = {
  cuenta_bancaria: 'Cuenta bancaria',
  mp: 'Mercado Pago',
  efectivo_sucursal: 'Efectivo en sucursal',
};

const BADGE_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  activo: 'success',
  suspendido: 'warning',
  baja: 'destructive',
};

export default async function EditarPermisionarioPage({
  params,
}: {
  params: Promise<{id: string}>;
}) {
  const {id} = await params;
  const supabase = createServiceClient();

  const {data: p, error} = await supabase
    .from('permisionarios')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !p) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Link href="/admin/permisionarios">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} />
            Volver
          </Button>
        </Link>
        <p className="text-sm" style={{color: 'var(--error)'}}>
          Permisionario no encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/permisionarios">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} aria-hidden="true" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{color: 'var(--fg1)'}}>
            {p.nombre_completo}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={BADGE_VARIANT[p.estado] ?? 'secondary'}>
              {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
            </Badge>
            <span className="text-xs" style={{color: 'var(--fg3)'}}>
              DNI {p.dni}
            </span>
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl border p-6 space-y-5"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3"
          style={{backgroundColor: 'var(--info-bg)'}}
        >
          <span className="text-sm" style={{color: 'var(--info-fg)'}}>
            Edición completa pendiente (stub). Mostrando datos actuales de solo lectura.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {[
            {label: 'Nombre completo', value: p.nombre_completo},
            {label: 'DNI', value: p.dni},
            {label: 'Email', value: p.email ?? '—'},
            {label: 'Teléfono', value: p.telefono ?? '—'},
            {label: 'QR Code', value: p.qr_code},
            {label: 'Medio de cobro', value: MEDIO_LABEL[p.medio_cobro_tipo] ?? p.medio_cobro_tipo},
            {
              label: 'Fecha de alta',
              value: new Date(p.fecha_alta).toLocaleDateString('es-AR'),
            },
            {label: 'Estado', value: p.estado},
          ].map(({label, value}) => (
            <div key={label}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{color: 'var(--fg3)'}}>
                {label}
              </p>
              <p className="text-sm font-medium" style={{color: 'var(--fg1)'}}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-2 flex gap-3">
          <Button disabled>Guardar cambios</Button>
          <Link href="/admin/permisionarios">
            <Button variant="outline">Cancelar</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
