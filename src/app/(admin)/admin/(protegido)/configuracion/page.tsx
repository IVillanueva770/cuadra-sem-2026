import type {Metadata} from 'next';
import {listarConfig, listarFeriados, listarHorarios, listarZonas, tarifasVigentes} from '@/lib/datos';
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
  const tarifas = tarifasVigentes();
  const horarios = listarHorarios();
  const feriados = listarFeriados();
  const zonas = listarZonas();
  const configs = listarConfig();

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
        <TarifasEditor tarifas={tarifas} />
      </div>

      <div
        className="rounded-2xl border p-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-1)',
        }}
      >
        <HorariosViewer horarios={horarios} />
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
          <FeriadosManager feriados={feriados} />
        </div>
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-1)',
          }}
        >
          <ZonasManager zonas={zonas} />
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
        <ConfigSistema configs={configs} />
      </div>
    </div>
  );
}
