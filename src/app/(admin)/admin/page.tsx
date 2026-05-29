import type {Metadata} from 'next';
import {createServiceClient} from '@/lib/supabase/server';
import {Activity, DollarSign, Smartphone, Users} from 'lucide-react';
import {formatARS} from '@/lib/utils';
import KpiCard from './KpiCard';
import RecaudacionChart from './RecaudacionChart';
import TopPermisionarios from './TopPermisionarios';
import RealtimeDashboard from './RealtimeDashboard';
import RangoSelector from './RangoSelector';
import ComposicionPagos from './ComposicionPagos';
import EfectivoConciliar from './EfectivoConciliar';
import TopCuadras from './TopCuadras';

export const metadata: Metadata = {
  title: 'Dashboard · Panel Muni Cuadra',
};

export const dynamic = 'force-dynamic';

// ─── helpers de fecha ────────────────────────────────────────────────────────

type Rango = 'hoy' | '7d' | '30d';

function resolverRango(raw: string | undefined): Rango {
  if (raw === 'hoy' || raw === '7d' || raw === '30d') return raw;
  return '7d';
}

/** Devuelve {desde, hasta} en formato YYYY-MM-DD para el rango actual y el anterior */
function calcularRangos(rango: Rango): {
  desde: string;
  hasta: string;
  desdePrev: string;
  hastaPrev: string;
  diasLabel: string;
} {
  const hoy = new Date();
  const hoyStr = hoy.toISOString().split('T')[0];

  if (rango === 'hoy') {
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    const ayerStr = ayer.toISOString().split('T')[0];
    return {desde: hoyStr, hasta: hoyStr, desdePrev: ayerStr, hastaPrev: ayerStr, diasLabel: 'vs ayer'};
  }

  const dias = rango === '7d' ? 7 : 30;
  const inicio = new Date(hoy);
  inicio.setDate(inicio.getDate() - (dias - 1));
  const inicioStr = inicio.toISOString().split('T')[0];

  const inicioPrev = new Date(hoy);
  inicioPrev.setDate(inicioPrev.getDate() - (dias * 2 - 1));
  const inicioPrevStr = inicioPrev.toISOString().split('T')[0];

  const finPrev = new Date(hoy);
  finPrev.setDate(finPrev.getDate() - dias);
  const finPrevStr = finPrev.toISOString().split('T')[0];

  return {
    desde: inicioStr,
    hasta: hoyStr,
    desdePrev: inicioPrevStr,
    hastaPrev: finPrevStr,
    diasLabel: `vs ${dias}d anteriores`,
  };
}

function pctDelta(actual: number, prev: number): number {
  if (prev === 0) return actual > 0 ? 100 : 0;
  return Math.round(((actual - prev) / prev) * 100);
}

// ─── tipos ───────────────────────────────────────────────────────────────────

type SesionRow = {
  id: string;
  monto: number | null;
  medio_pago: string | null;
  permisionario_id: string | null;
  cuadra_id: string | null;
};

type MetricaRow = {
  permisionario_id: string;
  recaudacion_total: number;
  sesiones_total: number;
  permisionarios: unknown;
};

type CuadraJoin = {
  cuadra_id: string;
  monto: number | null;
  cuadras_habilitadas: unknown;
};

// ─── page ─────────────────────────────────────────────────────────────────────

interface SearchParams {
  rango?: string;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const rango = resolverRango(params?.rango);
  const {desde, hasta, desdePrev, hastaPrev, diasLabel} = calcularRangos(rango);

  const supabase = createServiceClient();

  // ── Sesiones del rango actual ──
  const {data: sesionesRaw} = await supabase
    .from('parking_sessions')
    .select('id, monto, medio_pago, permisionario_id, cuadra_id')
    .gte('iniciada_a', `${desde}T00:00:00`)
    .lte('iniciada_a', `${hasta}T23:59:59`)
    .in('status', ['active', 'expired', 'left_early']);

  const sesiones: SesionRow[] = (sesionesRaw ?? []) as SesionRow[];

  // ── Sesiones del período anterior (para comparativas) ──
  const {data: sesionesPrevRaw} = await supabase
    .from('parking_sessions')
    .select('id, monto, medio_pago, permisionario_id')
    .gte('iniciada_a', `${desdePrev}T00:00:00`)
    .lte('iniciada_a', `${hastaPrev}T23:59:59`)
    .in('status', ['active', 'expired', 'left_early']);

  const sesionesPrev: SesionRow[] = (sesionesPrevRaw ?? []) as SesionRow[];

  // ── KPIs actuales ──
  const totalSesiones = sesiones.length;
  const recaudacionTotal = sesiones.reduce((acc, s) => acc + (Number(s.monto) || 0), 0);
  const digitales = sesiones.filter((s) => s.medio_pago === 'digital_mp').length;
  const efectivoSesiones = sesiones.filter((s) => s.medio_pago === 'efectivo');
  const pctDigital = totalSesiones > 0 ? Math.round((digitales / totalSesiones) * 100) : 0;
  const permActivosSet = new Set(sesiones.map((s) => s.permisionario_id).filter(Boolean));
  const permActivos = permActivosSet.size;

  // ── KPIs período anterior ──
  const totalSesionesPrev = sesionesPrev.length;
  const recaudacionPrev = sesionesPrev.reduce((acc, s) => acc + (Number(s.monto) || 0), 0);
  const digitalesPrev = sesionesPrev.filter((s) => s.medio_pago === 'digital_mp').length;
  const pctDigitalPrev = totalSesionesPrev > 0 ? Math.round((digitalesPrev / totalSesionesPrev) * 100) : 0;
  const permActivosPrevSet = new Set(sesionesPrev.map((s) => s.permisionario_id).filter(Boolean));
  const permActivosPrev = permActivosPrevSet.size;

  // ── Permisionarios activos (estado activo, dato global) ──
  const {count: permActivosCount} = await supabase
    .from('permisionarios')
    .select('id', {count: 'exact', head: true})
    .eq('estado', 'activo');

  // ── Composición de cobros ──
  const montoDigital = sesiones
    .filter((s) => s.medio_pago === 'digital_mp')
    .reduce((acc, s) => acc + (Number(s.monto) || 0), 0);
  const montoEfectivo = sesiones
    .filter((s) => s.medio_pago === 'efectivo')
    .reduce((acc, s) => acc + (Number(s.monto) || 0), 0);
  const permConEfectivoSet = new Set(
    efectivoSesiones.map((s) => s.permisionario_id).filter(Boolean)
  );
  const permConEfectivo = permConEfectivoSet.size;

  // ── Chart desde metricas_diarias ──
  const diasChart = rango === 'hoy' ? 1 : rango === '7d' ? 7 : 30;
  const fechaChartInicio = new Date();
  fechaChartInicio.setDate(fechaChartInicio.getDate() - (diasChart - 1));
  const fechaChartInicioStr = fechaChartInicio.toISOString().split('T')[0];

  const {data: metricasRaw} = await supabase
    .from('metricas_diarias')
    .select('fecha, recaudacion_total')
    .gte('fecha', fechaChartInicioStr)
    .order('fecha', {ascending: true});

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

  const chartLabel =
    rango === 'hoy' ? 'Recaudación — hoy' : `Recaudación — últimos ${diasChart} días`;

  // ── Top permisionarios (metricas_diarias en el rango) ──
  const {data: top5Raw} = await supabase
    .from('metricas_diarias')
    .select('permisionario_id, recaudacion_total, sesiones_total, permisionarios!inner(nombre_completo)')
    .gte('fecha', desde)
    .lte('fecha', hasta);

  const topMap = new Map<string, {nombre_completo: string; recaudacion: number; sesiones: number}>();
  if (top5Raw) {
    for (const mRaw of top5Raw as unknown as MetricaRow[]) {
      const permiData = mRaw.permisionarios as {nombre_completo: string} | {nombre_completo: string}[];
      const nombre = Array.isArray(permiData)
        ? permiData[0]?.nombre_completo
        : permiData?.nombre_completo;
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

  // ── Top cuadras (desde parking_sessions del rango con join cuadras_habilitadas) ──
  const {data: cuadrasRaw} = await supabase
    .from('parking_sessions')
    .select('cuadra_id, monto, cuadras_habilitadas!inner(nombre_display)')
    .gte('iniciada_a', `${desde}T00:00:00`)
    .lte('iniciada_a', `${hasta}T23:59:59`)
    .in('status', ['active', 'expired', 'left_early']);

  const cuadraMap = new Map<string, {nombre_display: string; recaudacion: number; sesiones: number}>();
  if (cuadrasRaw) {
    for (const cRaw of cuadrasRaw as unknown as CuadraJoin[]) {
      const cuadraData = cRaw.cuadras_habilitadas as {nombre_display: string} | {nombre_display: string}[];
      const nombre = Array.isArray(cuadraData)
        ? cuadraData[0]?.nombre_display
        : cuadraData?.nombre_display;
      const prev = cuadraMap.get(cRaw.cuadra_id) ?? {
        nombre_display: nombre ?? '—',
        recaudacion: 0,
        sesiones: 0,
      };
      cuadraMap.set(cRaw.cuadra_id, {
        nombre_display: prev.nombre_display,
        recaudacion: prev.recaudacion + (Number(cRaw.monto) || 0),
        sesiones: prev.sesiones + 1,
      });
    }
  }

  const topCuadras = Array.from(cuadraMap.entries())
    .map(([id, v]) => ({id, ...v}))
    .sort((a, b) => b.recaudacion - a.recaudacion)
    .slice(0, 8);

  // ── Labels ──
  const rangoLabel: Record<Rango, string> = {
    hoy: 'Hoy',
    '7d': 'Últimos 7 días',
    '30d': 'Últimos 30 días',
  };

  const hasPrevData = totalSesionesPrev > 0 || recaudacionPrev > 0;

  return (
    <div className="space-y-6">
      {/* Header + Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
        <RangoSelector actual={rango} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          titulo={`Sesiones · ${rangoLabel[rango]}`}
          valor={totalSesiones}
          subtitulo={`${rangoLabel[rango]}`}
          icon={Activity}
          accentColor="var(--primary)"
          delta={
            hasPrevData
              ? {pct: pctDelta(totalSesiones, totalSesionesPrev), label: diasLabel}
              : undefined
          }
        />
        <KpiCard
          titulo="Recaudación"
          valor={formatARS(recaudacionTotal)}
          subtitulo={rangoLabel[rango]}
          icon={DollarSign}
          accentColor="var(--success)"
          delta={
            hasPrevData
              ? {pct: pctDelta(recaudacionTotal, recaudacionPrev), label: diasLabel}
              : undefined
          }
        />
        <KpiCard
          titulo="% Digital"
          valor={`${pctDigital}%`}
          subtitulo={`${digitales} de ${totalSesiones} sesiones`}
          icon={Smartphone}
          accentColor="var(--accent)"
          delta={
            hasPrevData
              ? {pct: pctDelta(pctDigital, pctDigitalPrev), label: diasLabel}
              : undefined
          }
        />
        <KpiCard
          titulo="Permisionarios activos"
          valor={permActivos > 0 ? permActivos : (permActivosCount ?? 0)}
          subtitulo={permActivos > 0 ? `Con actividad en el período` : 'Con estado activo'}
          icon={Users}
          accentColor="var(--primary)"
          delta={
            hasPrevData && permActivos > 0
              ? {pct: pctDelta(permActivos, permActivosPrev), label: diasLabel}
              : undefined
          }
        />
      </div>

      {/* Composición + Conciliación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ComposicionPagos
          montoDigital={montoDigital}
          montoEfectivo={montoEfectivo}
          sesionesDigital={digitales}
          sesionesEfectivo={sesiones.filter((s) => s.medio_pago === 'efectivo').length}
        />
        <EfectivoConciliar
          totalEfectivo={montoEfectivo}
          permisionariosConEfectivo={permConEfectivo}
        />
      </div>

      {/* Chart + Top permisionarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecaudacionChart datos={datoChart} titulo={chartLabel} />
        </div>
        <div>
          <TopPermisionarios datos={topPermisionarios} />
        </div>
      </div>

      {/* Top cuadras + Sesiones activas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TopCuadras datos={topCuadras} labelRango={rangoLabel[rango]} />
        </div>
        <div className="lg:col-span-2">
          <RealtimeDashboard />
        </div>
      </div>
    </div>
  );
}
