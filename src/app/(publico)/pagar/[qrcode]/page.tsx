import {notFound} from 'next/navigation';
import {createServiceClient} from '@/lib/supabase/server';
import PagoForm from './PagoForm';

interface Props {
  params: Promise<{qrcode: string}>;
}

export default async function PagarPage({params}: Props) {
  const {qrcode} = await params;

  const supabase = createServiceClient();

  // Buscar permisionario por QR
  const {data: permi} = await supabase
    .from('permisionarios')
    .select('id, nombre_completo, qr_code, estado')
    .eq('qr_code', qrcode)
    .single();

  if (!permi || permi.estado !== 'activo') {
    notFound();
  }

  // Buscar asignación del día actual
  const hoy = new Date().toISOString().slice(0, 10);
  const {data: asignacion} = await supabase
    .from('asignaciones_diarias')
    .select(
      'id, cuadra_id, turno, cuadra:cuadras_habilitadas(id, nombre_display, habilitada_diurno, habilitada_nocturno)'
    )
    .eq('permisionario_id', permi.id)
    .eq('fecha', hoy)
    .order('created_at', {ascending: false})
    .limit(1)
    .maybeSingle();

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
      cuadraNombre={(asignacion.cuadra as unknown as {nombre_display: string}).nombre_display}
    />
  );
}
