import Image from 'next/image';
import Link from 'next/link';
import {QrCode} from 'lucide-react';
import {Button} from '@/components/ui/button';
import VerificarPatenteInput from './VerificarPatenteInput';

export default function HomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-8"
      style={{background: 'var(--bg)'}}
    >
      <div className="w-full max-w-md flex flex-col gap-8">

        {/* Hero */}
        <section className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/icons/cuadra-logo-color.svg"
            alt="Cuadra"
            width={200}
            height={56}
            priority
          />
          <p className="body-m" style={{color: 'var(--fg2)'}}>
            El estacionamiento medido de Salta, ahora digital.
          </p>
        </section>

        {/* Card de acciones */}
        <section
          className="rounded-2xl p-6 flex flex-col gap-5"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-1)',
          }}
        >
          <p className="overline" style={{color: 'var(--fg3)'}}>¿Qué querés hacer?</p>

          <VerificarPatenteInput />

          <div
            className="border-t"
            style={{borderColor: 'var(--border)'}}
            aria-hidden="true"
          />

          <Link href="/ordenanza" className="block">
            <Button variant="secondary" className="w-full">
              ¿Qué dice la Ordenanza?
            </Button>
          </Link>
        </section>

        {/* Nota al conductor */}
        <section className="flex items-start gap-2 text-center justify-center">
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
          <Link
            href="/login"
            className="hover:underline underline-offset-2 transition-colors"
            style={{color: 'var(--fg3)'}}
          >
            Soy permisionario
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="/admin/login"
            className="hover:underline underline-offset-2 transition-colors"
            style={{color: 'var(--fg3)'}}
          >
            Municipalidad
          </Link>
        </nav>

        {/* Pie institucional con co-branding */}
        <footer className="flex flex-col items-center gap-2 pb-2">
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
