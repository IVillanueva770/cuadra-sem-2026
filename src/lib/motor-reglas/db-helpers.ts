import {createClient} from '@/lib/supabase/server';
import type {ContextoValidacion, Tarifa, HorarioTurno, Feriado, ConfigSistema, CuadraInfo} from './tipos';

/**
 * Carga el contexto completo de validación desde la DB.
 * Usar al recibir un request del frontend.
 */
export async function cargarContextoValidacion(cuadraId: string): Promise<ContextoValidacion> {
  const supabase = await createClient();

  const [tarifasRes, horariosRes, feriadosRes, configRes, cuadraRes] = await Promise.all([
    supabase.from('tarifas').select('*').is('vigente_hasta', null),
    supabase.from('horarios_turnos').select('*').eq('activo', true),
    supabase.from('feriados').select('*'),
    supabase.from('config_sistema').select('*'),
    supabase.from('cuadras_habilitadas').select('habilitada_diurno, habilitada_nocturno').eq('id', cuadraId).single(),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tarifas: Tarifa[] = (tarifasRes.data ?? []).map((t: any) => ({
    tipo_vehiculo: t.tipo_vehiculo,
    monto_por_hora: Number(t.monto_por_hora),
    monto_por_fraccion_15min: Number(t.monto_por_fraccion_15min),
    descuento_digital_pct: Number(t.descuento_digital_pct),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const horarios: HorarioTurno[] = (horariosRes.data ?? []).map((h: any) => ({
    turno: h.turno,
    dia_semana: h.dia_semana,
    hora_inicio: h.hora_inicio.slice(0, 5),
    hora_fin: h.hora_fin.slice(0, 5),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const feriados: Feriado[] = (feriadosRes.data ?? []).map((f: any) => ({
    fecha: f.fecha,
    descripcion: f.descripcion,
    permite_diurno: f.permite_diurno,
    permite_nocturno: f.permite_nocturno,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const configMap: Record<string, unknown> = {};
  for (const row of configRes.data ?? []) {
    configMap[row.clave] = row.valor;
  }

  const config: ConfigSistema = {
    tolerancia_minutos: Number(configMap.tolerancia_minutos ?? 5),
    minutos_min_antes_fin_turno: Number(configMap.minutos_min_antes_fin_turno ?? 10),
  };

  const cuadra: CuadraInfo = {
    habilitada_diurno: cuadraRes.data?.habilitada_diurno ?? false,
    habilitada_nocturno: cuadraRes.data?.habilitada_nocturno ?? false,
  };

  return {
    momento: new Date(),
    cuadra,
    tarifas,
    horarios,
    feriados,
    config,
  };
}
