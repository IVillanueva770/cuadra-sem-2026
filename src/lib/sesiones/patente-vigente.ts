import {createServiceClient} from '@/lib/supabase/server';

export type SesionVigente = {
  id: string;
  patente: string;
  cubierta_hasta: string;
  cuadra_id: string;
  tipo_vehiculo: 'auto' | 'moto';
  minutos_restantes: number;
};

/** Devuelve la sesión activa y todavía vigente de una patente, o null. */
export async function buscarSesionVigente(patente: string): Promise<SesionVigente | null> {
  const supabase = createServiceClient();
  const p = patente.toUpperCase().replace(/\s/g, '');
  const ahora = new Date();
  const {data} = await supabase
    .from('parking_sessions')
    .select('id, patente, cubierta_hasta, cuadra_id, tipo_vehiculo')
    .eq('patente', p)
    .eq('status', 'active')
    .gt('cubierta_hasta', ahora.toISOString())
    .order('cubierta_hasta', {ascending: false})
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  const restantes = Math.max(
    0,
    Math.round((new Date(data.cubierta_hasta).getTime() - ahora.getTime()) / 60000)
  );
  return {...data, minutos_restantes: restantes} as SesionVigente;
}
