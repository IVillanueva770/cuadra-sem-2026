import type {Metadata} from 'next';
import {createServiceClient} from '@/lib/supabase/server';
import {Activity, DollarSign, Smartphone, Users} from 'lucide-react';
import {formatARS} from '@/lib/utils';
import KpiCard from './KpiCard';
import RecaudacionChart from './RecaudacionChart';
import TopPermisionarios from './TopPermisionarios';
import RealtimeDashboard from './RealtimeDashboard';

export const metadata: Metadata = {
  title: 'Dashboard · Panel Muni Cuadra',
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const supabase = createServiceClient();
  const hoy = new Date().toISOString().split('T')[0];

  // KPIs del día de hoy
  const [{data: sesionesHoy}, {count: permActivosCount}] = await Promise.all([
    supabase
      .from('parking_sessions')
      .select('id, monto, medio_pago')
      .gte('iniciada_a', `${hoy}T00:00:00`)
      .in('status', ['active', 'expired', 'left_early']),
    supabase
      .from('permisionarios')
      .select('id', {count: 'exact', head: true})
      .eq('estado', 'activo'),
  ]);

  const totalSesionesHoy = sesionesHoy?.length ?? 0;
  const recaudacionHoy = sesionesHoy?.reduce((acc, s) => acc + (Number(s.monto) || 0), 0) ?? 0;
  const digitalesHoy = sesionesHoy?.filter((s) => s.medio_pago === 'digital_mp').length ?? 0;
  const pctDigital =
    totalSesionesHoy > 0 ? Math.round((digitalesHoy / totalSesionesHoy) * 100) : 0;
  const totalPermActivos = permActivosCount ?? 0;

  // Chart: recaudación 21 días — usando metricas_diarias (agrupadas por fecha)
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - 20);
  const fechaInicioStr = fechaInicio.toISOString().split('T')[0];

  const {data: metricasRaw} = await supabase
    .from('metricas_diarias')
    .select('fecha, recaudacion_total')
    .gte('fecha', fechaInicioStr)
    .order('fecha', {ascending: true});

  // Agrupar por fecha sumando todos los permisionarios
  const chartMap = new Map<string, number>();
  if (metricasRaw) {
    for (const m of metricasRaw) {
      const prev = chartMap.get(m.fecha) ?? 0;
      chartMap.set(m.fecha, prev + Number(m.recaudacion_total));
    }
  }
  const datoChart = Array.from(chartMap.entries()).map(([fecha, recaudacion]) => ({
    fecha,
    recaudacion,
  }));

  // Top 5 permisionarios últimos 7 días
  const fecha7dias = new Date();
  fecha7dias.setDate(fecha7dias.getDate() - 6);
  const fecha7diasStr = fecha7dias.toISOString().split('T')[0];

  const {data: top5Raw} = await supabase
    .from('metricas_diarias')
    .select('permisionario_id, recaudacion_total, sesiones_total, permisionarios!inner(nombre_completo)')
    .gte('fecha', fecha7diasStr);

  type Top5Row = {
    permisionario_id: string;
    recaudacion_total: number;
    sesiones_total: number;
    permisionarios: unknown;
  };

  // Agrupar por permisionario
  const topMap = new Map<
    string,
    {nombre_completo: string; recaudacion: number; sesiones: number}
  >();
  if (top5Raw) {
    for (const mRaw of top5Raw as unknown as Top5Row[]) {
      const permiData = mRaw.permisionarios as {nombre_completo: string} | {nombre_completo: string}[];
      const nombre = Array.isArray(permiData) ? permiData[0]?.nombre_completo : permiData?.nombre_completo;
      const prev = topMap.get(mRaw.permisionario_id) ?? {
        nombre_completo: nombre ?? '—',
        recaudacion: 0,
        sesiones: 0,
      };
      topMap.set(mRaw.permisionario_id, {
        nombre_completo: prev.nombre_completo,
        recaudacion: prev.recaudacion + Number(mRaw.recaudacion_total),
        sesiones: prev.sesiones + Number(mRaw.sesiones_total),
      });
    }
  }

  const topPermisionarios = Array.from(topMap.entries())
    .map(([id, v]) => ({id, ...v}))
    .sort((a, b) => b.recaudacion - a.recaudacion)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{color: 'var(--fg1)'}}>
          Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{color: 'var(--fg2)'}}>
          {new Date().toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'America/Argentina/Salta',
          })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          titulo="Sesiones hoy"
          valor={totalSesionesHoy}
          subtitulo="Registradas hoy"
          icon={Activity}
          accentColor="var(--primary)"
        />
        <KpiCard
          titulo="Recaudación hoy"
          valor={formatARS(recaudacionHoy)}
          subtitulo="Total del día"
          icon={DollarSign}
          accentColor="var(--success)"
        />
        <KpiCard
          titulo="% Digital"
          valor={`${pctDigital}%`}
          subtitulo={`${digitalesHoy} de ${totalSesionesHoy} sesiones`}
          icon={Smartphone}
          accentColor="var(--accent)"
        />
        <KpiCard
          titulo="Permisionarios activos"
          valor={totalPermActivos}
          subtitulo="Con estado activo"
          icon={Users}
          accentColor="var(--primary)"
        />
      </div>

      {/* Chart + Top */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <RecaudacionChart datos={datoChart} />
        </div>
        <div>
          <TopPermisionarios datos={topPermisionarios} />
        </div>
      </div>

      {/* Realtime */}
      <RealtimeDashboard />
    </div>
  );
}
