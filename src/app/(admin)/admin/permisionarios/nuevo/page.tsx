import type {Metadata} from 'next';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {ArrowLeft} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Nuevo permisionario · Panel Muni Cuadra',
};

// STUB: formulario de alta de permisionario — pendiente implementación completa
export default function NuevoPermisionarioPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/permisionarios">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} aria-hidden="true" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold" style={{color: 'var(--fg1)'}}>
          Nuevo permisionario
        </h1>
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6"
          style={{backgroundColor: 'var(--info-bg)'}}
        >
          <span className="text-sm" style={{color: 'var(--info-fg)'}}>
            Formulario de alta pendiente de implementación (stub). La lista de permisionarios y la edición están disponibles.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            {label: 'Nombre completo', placeholder: 'Ej: Juan Pérez'},
            {label: 'DNI', placeholder: 'Ej: 30123456'},
            {label: 'Email', placeholder: 'Ej: juan@ejemplo.com'},
            {label: 'Teléfono', placeholder: 'Ej: 3874123456'},
          ].map(({label, placeholder}) => (
            <div key={label} className="space-y-1.5">
              <label className="text-sm font-medium" style={{color: 'var(--fg1)'}}>
                {label}
              </label>
              <input
                type="text"
                placeholder={placeholder}
                disabled
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--fg-disabled)',
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <Button disabled>Crear permisionario</Button>
          <Link href="/admin/permisionarios">
            <Button variant="outline">Cancelar</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
