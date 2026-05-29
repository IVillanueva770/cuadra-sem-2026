import type {Metadata} from 'next';
import CuadraMark from '@/components/cuadra/CuadraMark';
import LoginAdminForm from './LoginAdminForm';

export const metadata: Metadata = {
  title: 'Acceso · Panel Muni Cuadra',
};

export default function LoginAdminPage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{backgroundColor: 'var(--bg)'}}
    >
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <CuadraMark size={64} tone="light" className="mb-4" style={{boxShadow: '0 8px 24px rgba(20,95,176,0.28)'}} />
          <h1 className="text-2xl font-bold" style={{color: 'var(--fg1)'}}>
            Panel Administrativo
          </h1>
          <p className="text-sm" style={{color: 'var(--fg2)'}}>
            Municipalidad de la Ciudad de Salta
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-1)',
          }}
        >
          <LoginAdminForm />
        </div>

        <p className="text-center text-xs" style={{color: 'var(--fg3)'}}>
          Acceso restringido a personal autorizado de la Municipalidad
        </p>
      </div>
    </main>
  );
}
