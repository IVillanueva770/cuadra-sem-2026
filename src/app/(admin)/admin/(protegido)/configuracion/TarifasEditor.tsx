'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {updateTarifa} from './actions';
import {formatARS} from '@/lib/utils';

interface Tarifa {
  id: string;
  tipo_vehiculo: string;
  monto_por_hora: number;
  monto_por_fraccion_15min: number;
  descuento_digital_pct: number;
  vigente_desde: string;
  vigente_hasta?: string | null;
}

export default function TarifasEditor({tarifas}: {tarifas: Tarifa[]}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{id: string; ok: boolean; msg: string} | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    const fd = new FormData(e.currentTarget);
    const result = await updateTarifa(fd);
    setSaving(false);
    if (result?.error) {
      setFeedback({id, ok: false, msg: result.error});
    } else {
      setFeedback({id, ok: true, msg: 'Tarifa actualizada correctamente.'});
      setEditingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
        Tarifas vigentes
      </h2>

      {tarifas.map((t) => {
        const isEditing = editingId === t.id;
        return (
          <div
            key={t.id}
            className="rounded-xl border p-5"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: isEditing ? 'var(--blue-50)' : 'var(--bg-subtle)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm" style={{color: 'var(--fg1)'}}>
                {t.tipo_vehiculo === 'auto' ? 'Automóvil' : 'Motocicleta'}
              </h3>
              <span className="text-xs" style={{color: 'var(--fg3)'}}>
                Vigente desde {t.vigente_desde}
                {t.vigente_hasta ? ` hasta ${t.vigente_hasta}` : ''}
              </span>
            </div>

            {isEditing ? (
              <form onSubmit={(e) => handleSubmit(e, t.id)} className="space-y-4">
                <input type="hidden" name="id" value={t.id} />
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium" style={{color: 'var(--fg2)'}}>
                      $/hora
                    </label>
                    <Input
                      type="number"
                      name="monto_por_hora"
                      defaultValue={t.monto_por_hora}
                      min={0}
                      step={0.01}
                      required
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium" style={{color: 'var(--fg2)'}}>
                      $/15 min
                    </label>
                    <Input
                      type="number"
                      name="monto_por_fraccion_15min"
                      defaultValue={t.monto_por_fraccion_15min}
                      min={0}
                      step={0.01}
                      required
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium" style={{color: 'var(--fg2)'}}>
                      Descuento digital %
                    </label>
                    <Input
                      type="number"
                      name="descuento_digital_pct"
                      defaultValue={t.descuento_digital_pct}
                      min={0}
                      max={100}
                      step={0.1}
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                {feedback?.id === t.id && (
                  <p
                    className="text-xs px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: feedback.ok ? 'var(--success-bg)' : 'var(--error-bg)',
                      color: feedback.ok ? 'var(--success-fg)' : 'var(--error-fg)',
                    }}
                    role="alert"
                  >
                    {feedback.msg}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex items-end justify-between">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                      Por hora
                    </p>
                    <p className="text-xl font-bold mt-0.5" style={{color: 'var(--fg1)'}}>
                      {formatARS(t.monto_por_hora)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                      Por 15 min
                    </p>
                    <p className="text-xl font-bold mt-0.5" style={{color: 'var(--fg1)'}}>
                      {formatARS(t.monto_por_fraccion_15min)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                      Desc. digital
                    </p>
                    <p className="text-xl font-bold mt-0.5" style={{color: 'var(--success)'}}>
                      {t.descuento_digital_pct}%
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingId(t.id)}
                >
                  Editar
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
