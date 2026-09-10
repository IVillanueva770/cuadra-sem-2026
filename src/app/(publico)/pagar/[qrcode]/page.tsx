import {notFound} from 'next/navigation';
import {asignacionDelDia, cuadraPorId, fechaISO, permisionarioPorQr} from '@/lib/datos';
import PagoForm from './PagoForm';

interface Props {
  params: Promise<{qrcode: string}>;
}

export const dynamic = 'force-dynamic';

export default async function PagarPage({params}: Props) {
  const {qrcode} = await params;

  // Buscar permisionario por QR
  const permi = permisionarioPorQr(qrcode);

  if (!permi || permi.estado !== 'activo') {
    notFound();
  }

  // Buscar asignación del día actual
  const asignacion = asignacionDelDia(permi.id, fechaISO());

  if (!asignacion) {
    return (
      <main className="mx-auto max-w-md p-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-semibold text-amber-900">
            Permisionario no asignado hoy
          </h2>
          <p className="mt-2 text-sm text-amber-800 leading-relaxed">
            {permi.nombre_completo} no tiene cuadra asignada para hoy. No se
            puede cobrar.
          </p>
        </div>
      </main>
    );
  }

  return (
    <PagoForm
      permisionarioId={permi.id}
      permisionarioNombre={permi.nombre_completo}
      cuadraId={asignacion.cuadra_id}
      cuadraNombre={cuadraPorId(asignacion.cuadra_id)?.nombre_display ?? 'Cuadra asignada'}
    />
  );
}
