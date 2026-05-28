import Image from 'next/image';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-md p-6 space-y-6">
      <div className="flex justify-center pt-8">
        <Image src="/icons/cuadra-logo-color.svg" alt="Cuadra" width={232} height={64} priority />
      </div>

      <Card>
        <CardContent className="p-6 space-y-4 text-center">
          <h1 className="h-l">Cuadra</h1>
          <p className="body-m text-gray-500">
            El estacionamiento medido de Salta, simple y digital.
          </p>
          <div className="grid gap-3 pt-2">
            <Link href="/ordenanza">
              <Button variant="secondary" className="w-full">¿Qué dice la Ordenanza?</Button>
            </Link>
            <Link href="/verificar/ABC123">
              <Button variant="ghost" className="w-full">Verificar patente</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="caption text-center">
        Una iniciativa de la Municipalidad de la Ciudad de Salta
      </p>
    </main>
  );
}
