/**
 * Diagnóstico: estado de metricas_diarias y parking_sessions por fecha.
 * Ejecutar: pnpm tsx --env-file=.env.local scripts/check-metricas.ts
 */
import {createClient} from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function hoyStr() {
  return new Date().toISOString().slice(0, 10);
}

async function main() {
  console.log('Hoy:', hoyStr());

  const {count: countMetricas} = await supabase
    .from('metricas_diarias')
    .select('*', {count: 'exact', head: true});
  console.log('metricas_diarias filas totales:', countMetricas);

  const {data: rango} = await supabase
    .from('metricas_diarias')
    .select('fecha')
    .order('fecha', {ascending: true});
  if (rango && rango.length) {
    console.log('Rango fechas métricas:', rango[0].fecha, '->', rango[rango.length - 1].fecha);
    const fechasUnicas = [...new Set(rango.map((r) => r.fecha))];
    console.log('Fechas únicas con métricas:', fechasUnicas.length);
    console.log('¿Hay métricas de HOY?', fechasUnicas.includes(hoyStr()));
  }

  // Muestra de las últimas 3 fechas con su recaudación
  const {data: muestra} = await supabase
    .from('metricas_diarias')
    .select('fecha, permisionario_id, recaudacion_total, sesiones_total, ratio_digital')
    .order('fecha', {ascending: false})
    .limit(5);
  console.log('Muestra (5 filas más recientes):', JSON.stringify(muestra, null, 2));

  // Sesiones por rango: ¿hasta qué fecha hay sesiones?
  const {data: sesionesRecientes} = await supabase
    .from('parking_sessions')
    .select('iniciada_a')
    .order('iniciada_a', {ascending: false})
    .limit(1);
  console.log('Sesión más reciente:', sesionesRecientes?.[0]?.iniciada_a);

  const {data: sesionesViejas} = await supabase
    .from('parking_sessions')
    .select('iniciada_a')
    .order('iniciada_a', {ascending: true})
    .limit(1);
  console.log('Sesión más antigua:', sesionesViejas?.[0]?.iniciada_a);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
