import type {Metadata} from 'next';
import Link from 'next/link';
import {createServiceClient} from '@/lib/supabase/server';
import {Button} from '@/components/ui/button';
import {UserPlus} from 'lucide-react';
import PermisListClient, {type PermisionarioConMetrica} from './PermisListClient';

export const metadata: Metadata = {
  title: 'Permisionarios · Panel Muni Cuadra',
};

export const dynamic = 'force-dynamic';

export default async function PermisionariosPage() {
  const supabase = createServiceClient();

  const {data: permisionarios, error} = await supabase
    .from('permisionarios')
    .select('id, nombre_completo, dni, qr_code, medio_cobro_tipo, estado, fecha_alta, email')
    .order('nombre_completo', {ascending: true});

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4" style={{color: 'var(--fg1)'}}>
          Permisionarios
        </h1>
        <p className="text-sm" style={{color: 'var(--error)'}}>
          Error al cargar permisionarios: {error.message}
        </p>
      </div>
    );
  }

  // ── Recaudación por permisionario últimos 30 días ──
  const hace30 = new Date();
  hace30.setDate(hace30.getDate() - 29);
  const desde30 = hace30.toISOString().split('T')[0];

  const {data: metricasRaw} = await supabase
    .from('metricas_diarias')
    .select('permisionario_id, recaudacion_total, sesiones_total')
    .gte('fecha', desde30);

  // Agrupar por permisionario_id
  const metricasMap = new Map<string, {recaudacion30d: number; sesiones30d: number}>();
  if (metricasRaw) {
    for (const m of metricasRaw) {
      const prev = metricasMap.get(m.permisionario_id) ?? {recaudacion30d: 0, sesiones30d: 0};
      metricasMap.set(m.permisionario_id, {
        recaudacion30d: prev.recaudacion30d + (Number(m.recaudacion_total) || 0),
        sesiones30d: prev.sesiones30d + (Number(m.sesiones_total) || 0),
      });
    }
  }

  // Combinar permisionarios con métricas
  const datos: PermisionarioConMetrica[] = (permisionarios ?? []).map((p) => {
    const metricas = metricasMap.get(p.id) ?? {recaudacion30d: 0, sesiones30d: 0};
    return {
      ...p,
      recaudacion30d: metricas.recaudacion30d,
      sesiones30d: metricas.sesiones30d,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{color: 'var(--fg1)'}}>
            Permisionarios
          </h1>
          <p className="text-sm mt-0.5" style={{color: 'var(--fg2)'}}>
            {datos.length} registrados en el sistema
          </p>
        </div>
        <Link href="/admin/permisionarios/nuevo">
          <Button className="gap-2">
            <UserPlus size={16} aria-hidden="true" />
            Nuevo permisionario
          </Button>
        </Link>
      </div>

      <PermisListClient datos={datos} />
    </div>
  );
}
