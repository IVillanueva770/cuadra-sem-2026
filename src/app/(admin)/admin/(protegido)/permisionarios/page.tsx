import type {Metadata} from 'next';
import Link from 'next/link';
import {fechaISO, listarPermisionarios, metricasDiarias} from '@/lib/datos';
import {Button} from '@/components/ui/button';
import {UserPlus} from 'lucide-react';
import PermisListClient, {type PermisionarioConMetrica} from './PermisListClient';

export const metadata: Metadata = {
  title: 'Permisionarios · Panel Muni Cuadra',
};

export const dynamic = 'force-dynamic';

export default async function PermisionariosPage() {
  const permisionarios = listarPermisionarios();

  // ── Recaudación por permisionario últimos 30 días ──
  const hoy = new Date();
  const hace30 = new Date(hoy);
  hace30.setDate(hace30.getDate() - 29);

  const metricasMap = new Map<string, {recaudacion30d: number; sesiones30d: number}>();
  for (const m of metricasDiarias(fechaISO(hace30), fechaISO(hoy))) {
    const prev = metricasMap.get(m.permisionario_id) ?? {recaudacion30d: 0, sesiones30d: 0};
    metricasMap.set(m.permisionario_id, {
      recaudacion30d: prev.recaudacion30d + m.recaudacion_total,
      sesiones30d: prev.sesiones30d + m.sesiones_total,
    });
  }

  // Combinar permisionarios con métricas
  const datos: PermisionarioConMetrica[] = permisionarios.map((p) => {
    const metricas = metricasMap.get(p.id) ?? {recaudacion30d: 0, sesiones30d: 0};
    return {
      id: p.id,
      nombre_completo: p.nombre_completo,
      dni: p.dni,
      qr_code: p.qr_code,
      medio_cobro_tipo: p.medio_cobro_tipo,
      estado: p.estado,
      fecha_alta: p.fecha_alta,
      email: p.email,
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
