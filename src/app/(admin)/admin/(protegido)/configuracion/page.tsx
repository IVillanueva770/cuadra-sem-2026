import type {Metadata} from 'next';
import {createServiceClient} from '@/lib/supabase/server';
import TarifasEditor from './TarifasEditor';
import HorariosViewer from './HorariosViewer';
import FeriadosManager from './FeriadosManager';
import ZonasManager from './ZonasManager';
import ConfigSistema from './ConfigSistema';

export const metadata: Metadata = {
  title: 'Configuración · Panel Muni Cuadra',
};

export const dynamic = 'force-dynamic';

export default async function ConfiguracionPage() {
  const supabase = createServiceClient();

  const [
    {data: tarifas},
    {data: horarios},
    {data: feriados},
    {data: zonas},
    {data: configs},
  ] = await Promise.all([
    supabase
      .from('tarifas')
      .select('id, tipo_vehiculo, monto_por_hora, monto_por_fraccion_15min, descuento_digital_pct, vigente_desde, vigente_hasta')
      .is('vigente_hasta', null)
      .order('tipo_vehiculo'),
    supabase
      .from('horarios_turnos')
      .select('id, turno, dia_semana, hora_inicio, hora_fin, activo')
      .order('turno')
      .order('dia_semana'),
    supabase
      .from('feriados')
      .select('id, fecha, descripcion, permite_nocturno, permite_diurno')
      .order('fecha'),
    supabase
      .from('zonas_nocturnas')
      .select('id, nombre, activa, created_at')
      .order('nombre'),
    supabase
      .from('config_sistema')
      .select('id, clave, valor, descripcion')
      .order('clave'),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold" style={{color: 'var(--fg1)'}}>
          Configuración
        </h1>
        <p className="text-sm mt-0.5" style={{color: 'var(--fg2)'}}>
          Parámetros operativos del sistema de estacionamiento medido.
        </p>
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        <TarifasEditor tarifas={tarifas ?? []} />
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        <HorariosViewer horarios={horarios ?? []} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-1)',
          }}
        >
          <FeriadosManager feriados={feriados ?? []} />
        </div>
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-1)',
          }}
        >
          <ZonasManager zonas={zonas ?? []} />
        </div>
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        <ConfigSistema configs={configs ?? []} />
      </div>
    </div>
  );
}
