'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {updateConfigSistema} from './actions';

interface ConfigItem {
  id: string;
  clave: string;
  valor: unknown;
  descripcion?: string | null;
}

export default function ConfigSistema({configs}: {configs: ConfigItem[]}) {
  const [editingClave, setEditingClave] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{clave: string; ok: boolean; msg: string} | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, clave: string) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    const fd = new FormData(e.currentTarget);
    const result = await updateConfigSistema(fd);
    setSaving(false);
    if (result?.error) {
      setFeedback({clave, ok: false, msg: result.error});
    } else {
      setFeedback({clave, ok: true, msg: 'Configuración actualizada.'});
      setEditingClave(null);
    }
  }

  function displayValor(v: unknown): string {
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    return JSON.stringify(v);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
        Parámetros del sistema
      </h2>

      <div
        className="rounded-xl border overflow-hidden"
        style={{borderColor: 'var(--border)'}}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)'}}>
              <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                Clave
              </th>
              <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                Valor
              </th>
              <th className="text-left px-4 py-2.5 font-semibold text-xs uppercase tracking-wider" style={{color: 'var(--fg3)'}}>
                Descripción
              </th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {configs.map((c) => {
              const isEditing = editingClave === c.clave;
              return (
                <tr key={c.id} style={{borderBottom: '1px solid var(--border)'}}>
                  <td className="px-4 py-3 font-mono text-xs font-medium" style={{color: 'var(--primary)'}}>
                    {c.clave}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <form onSubmit={(e) => handleSubmit(e, c.clave)} className="flex items-center gap-2">
                        <input type="hidden" name="clave" value={c.clave} />
                        <Input
                          type="text"
                          name="valor"
                          defaultValue={displayValor(c.valor)}
                          required
                          disabled={saving}
                          className="w-40 text-sm h-9"
                          autoFocus
                        />
                        <Button type="submit" size="sm" disabled={saving} className="h-9 px-3">
                          {saving ? '...' : 'OK'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-9 px-3"
                          onClick={() => setEditingClave(null)}
                        >
                          ✕
                        </Button>
                        {feedback?.clave === c.clave && (
                          <span
                            className="text-xs"
                            style={{color: feedback.ok ? 'var(--success)' : 'var(--error)'}}
                            role="alert"
                          >
                            {feedback.msg}
                          </span>
                        )}
                      </form>
                    ) : (
                      <span className="font-mono text-sm" style={{color: 'var(--fg1)'}}>
                        {displayValor(c.valor)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{color: 'var(--fg3)'}}>
                    {c.descripcion ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {!isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => setEditingClave(c.clave)}
                      >
                        Editar
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
