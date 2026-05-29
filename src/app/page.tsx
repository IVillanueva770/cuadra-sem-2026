import Image from 'next/image';
import Link from 'next/link';
import {QrCode, Zap, Users, Eye} from 'lucide-react';
import {Button} from '@/components/ui/button';
import CuadraMark from '@/components/cuadra/CuadraMark';
import VerificarPatenteInput from './VerificarPatenteInput';

const DIFERENCIALES = [
  {Icon: Zap, titulo: 'En segundos', texto: 'Pagás al instante, sin descargar ninguna app.'},
  {Icon: Users, titulo: 'Con el permisionario', texto: 'Sigue siendo quien cobra, ahora también en digital.'},
  {Icon: Eye, titulo: 'Transparente', texto: 'La Ordenanza siempre a la vista. Sin cobros indebidos.'},
];

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10"
      style={{background: 'var(--bg)'}}
    >
      <div className="w-full max-w-3xl flex flex-col items-center gap-9">

        {/* Hero */}
        <section className="flex flex-col items-center gap-4 text-center">
          <CuadraMark size={80} tone="light" style={{boxShadow: '0 10px 28px rgba(20, 95, 176, 0.30)'}} />
          <div>
            <h1
              className="text-4xl font-bold"
              style={{color: 'var(--fg1)', letterSpacing: '-0.02em'}}
            >
              Cuadra
            </h1>
            <p className="body-m mt-1.5" style={{color: 'var(--fg2)'}}>
              El estacionamiento medido de Salta, ahora digital.
            </p>
          </div>
        </section>

        {/* Diferenciales */}
        <section className="grid w-full gap-4 sm:grid-cols-3">
          {DIFERENCIALES.map(({Icon, titulo, texto}) => (
            <div
              key={titulo}
              className="group flex flex-col items-start gap-4 rounded-2xl border p-5 shadow-[var(--shadow-1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-2)]"
              style={{background: 'var(--bg-surface)', borderColor: 'var(--border)'}}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                style={{backgroundColor: 'var(--primary)', boxShadow: '0 6px 16px rgba(20, 95, 176, 0.32)'}}
              >
                <Icon style={{width: 22, height: 22, color: '#fff'}} aria-hidden="true" />
              </div>
              <div>
                <p className="text-base font-bold" style={{color: 'var(--fg1)'}}>{titulo}</p>
                <p className="text-sm mt-1 leading-relaxed" style={{color: 'var(--fg2)'}}>{texto}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Card de acciones */}
        <section
          className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-1)',
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.06em]" style={{color: 'var(--fg3)'}}>¿Qué querés hacer?</p>

          <VerificarPatenteInput />

          <div className="border-t" style={{borderColor: 'var(--border)'}} aria-hidden="true" />

          <Link href="/ordenanza" className="block">
            <Button variant="secondary" className="w-full">
              ¿Qué dice la Ordenanza?
            </Button>
          </Link>
        </section>

        {/* Nota al conductor */}
        <section className="flex items-start gap-2 text-center justify-center max-w-md">
          <QrCode
            className="shrink-0 mt-0.5"
            style={{width: 16, height: 16, color: 'var(--fg3)'}}
            aria-hidden="true"
          />
          <p className="caption" style={{color: 'var(--fg3)'}}>
            ¿Estás estacionando? Escaneá el QR del permisionario en tu cuadra para pagar.
          </p>
        </section>

        {/* Accesos del sistema */}
        <nav
          className="flex justify-center items-center gap-2 caption"
          style={{color: 'var(--fg3)'}}
          aria-label="Accesos del sistema"
        >
          <Link href="/login" className="hover:underline underline-offset-2 transition-colors" style={{color: 'var(--fg3)'}}>
            Soy permisionario
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/admin/login" className="hover:underline underline-offset-2 transition-colors" style={{color: 'var(--fg3)'}}>
            Municipalidad
          </Link>
        </nav>

        {/* Pie institucional con co-branding */}
        <footer className="flex flex-col items-center gap-2">
          <Image
            src="/icons/muni-salta-principal.png"
            alt="Municipalidad de la Ciudad de Salta"
            width={0}
            height={44}
            sizes="100vw"
            style={{width: 'auto', height: '44px'}}
            className="opacity-80"
          />
          <p className="caption text-center" style={{color: 'var(--fg3)'}}>
            Una iniciativa de la Municipalidad de la Ciudad de Salta.
          </p>
        </footer>

      </div>
    </main>
  );
}
