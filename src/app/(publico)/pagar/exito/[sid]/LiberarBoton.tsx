'use client';

import {useState, useTransition} from 'react';
import {Check} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {liberarCuadra} from './actions-extra';

export default function LiberarBoton({sessionId}: {sessionId: string}) {
  const [pending, start] = useTransition();
  const [liberada, setLiberada] = useState(false);

  if (liberada) {
    return (
      <div
        role="status"
        className="flex items-start gap-2 rounded-[10px] border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
      >
        <Check className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
        <span>
          Marcamos la cuadra como liberada. Gracias por avisar — la plata no se
          devuelve.
        </span>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      className="w-full"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await liberarCuadra(sessionId);
          setLiberada(true);
        })
      }
    >
      {pending ? 'Liberando…' : 'Liberé la cuadra (opcional)'}
    </Button>
  );
}
