import {sesionVigentePorPatente} from '@/lib/datos';

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
  const ahora = new Date();
  const s = sesionVigentePorPatente(patente, ahora);
  if (!s) return null;
  const restantes = Math.max(0, Math.round((new Date(s.cubierta_hasta).getTime() - ahora.getTime()) / 60000));
  return {
    id: s.id,
    patente: s.patente,
    cubierta_hasta: s.cubierta_hasta,
    cuadra_id: s.cuadra_id,
    tipo_vehiculo: s.tipo_vehiculo,
    minutos_restantes: restantes,
  };
}
