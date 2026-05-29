'use client';

/**
 * DEMO ONLY — Ayuda para grabar la demo: muestra la tarjeta de prueba de MP y
 * copia cada dato con un toque (no se puede autocompletar el Brick: sus campos
 * están en iframes de Mercado Pago por PCI). Sacar antes de producción.
 */

import {useState} from 'react';
import {CreditCard, Copy, Check, ChevronDown} from 'lucide-react';

const DATOS = [
  {label: 'Número', value: '5031 7557 3453 0604'},
  {label: 'Vencimiento', value: '11/30'},
  {label: 'CVV', value: '123'},
  {label: 'Titular', value: 'APRO'},
  {label: 'DNI', value: '12345678'},
];

export default function TarjetaPrueba() {
  const [open, setOpen] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  async function copiar(v: string) {
    try {
      await navigator.clipboard.writeText(v.replace(/ /g, ''));
      setCopiado(v);
      setTimeout(() => setCopiado(null), 1300);
    } catch {
      /* clipboard no disponible */
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/70 p-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 text-sm font-semibold text-blue-800 transition active:scale-[0.99]"
      >
        <CreditCard className="h-4 w-4" aria-hidden="true" />
        Tarjeta de prueba (demo)
        <ChevronDown
          className={`ml-auto h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="mt-2.5 space-y-1.5">
          {DATOS.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => copiar(d.value)}
              className="flex w-full items-center justify-between rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm transition active:scale-[0.99] hover:border-blue-300"
            >
              <span className="text-gray-500">{d.label}</span>
              <span className="flex items-center gap-2 font-mono text-gray-900">
                {d.value}
                {copiado === d.value ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                )}
              </span>
            </button>
          ))}
          <p className="pt-1 text-xs text-gray-500">
            Tocá un dato para copiarlo y pegalo en el formulario de Mercado Pago. Sólo modo prueba.
          </p>
        </div>
      )}
    </div>
  );
}
