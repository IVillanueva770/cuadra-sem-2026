'use server';

import {permisionarioLogueado} from '@/lib/auth-demo/servidor';
import {crearConciliacion} from '@/lib/datos';

interface CierreInput {
  asignacionId: string;
  totalEfectivo: number;
  saldoARendir: number;
}

export async function registrarCierreDelDia(input: CierreInput): Promise<{ok: true} | {ok: false; error: string}> {
  const permisionario = await permisionarioLogueado();
  if (!permisionario) return {ok: false, error: 'No autenticado.'};

  crearConciliacion({
    permisionario_id: permisionario.id,
    asignacion_id: input.asignacionId,
    total_efectivo_recaudado: input.totalEfectivo,
    saldo_a_rendir: input.saldoARendir,
    status: 'pending',
  });
  return {ok: true};
}
