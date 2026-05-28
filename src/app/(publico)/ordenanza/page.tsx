import {Phone, Mail, MapPin, FileText} from 'lucide-react';
import {createServiceClient} from '@/lib/supabase/server';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {formatARS} from '@/lib/utils';

interface Tarifa {
  id: string;
  tipo_vehiculo: 'auto' | 'moto';
  monto_por_hora: number;
  monto_por_fraccion_15min: number;
  descuento_digital_pct: number;
}

interface ZonaNocturna {
  id: string;
  nombre: string;
}

export default async function OrdenanzaPage() {
  const supabase = createServiceClient();
  const [tarifasRes, zonasRes] = await Promise.all([
    supabase.from('tarifas').select('*').is('vigente_hasta', null),
    supabase.from('zonas_nocturnas').select('id, nombre').eq('activa', true),
  ]);

  const tarifas: Tarifa[] = (tarifasRes.data ?? []).map((t) => ({
    id: t.id,
    tipo_vehiculo: t.tipo_vehiculo,
    monto_por_hora: Number(t.monto_por_hora),
    monto_por_fraccion_15min: Number(t.monto_por_fraccion_15min),
    descuento_digital_pct: Number(t.descuento_digital_pct),
  }));

  const zonas: ZonaNocturna[] = zonasRes.data ?? [];

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm uppercase tracking-wider text-gray-500">
          <FileText className="h-4 w-4 text-blue-500" aria-hidden="true" />
          Marco normativo
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          ¿Qué dice la Ordenanza?
        </h1>
        <p className="text-base text-gray-600">
          Ordenanza N° 12.170 del Concejo Deliberante de la Ciudad de Salta.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Tarifas vigentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {tarifas.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0"
            >
              <span className="text-gray-700">
                {t.tipo_vehiculo === 'auto' ? 'Auto / camioneta' : 'Moto'}
              </span>
              <span className="font-mono text-base font-semibold text-gray-900">
                {formatARS(t.monto_por_hora)}/h
              </span>
            </div>
          ))}
          <p className="pt-2 text-xs leading-relaxed text-gray-500">
            Descuento del{' '}
            {tarifas[0]?.descuento_digital_pct ?? 20}% en pagos digitales (lo
            absorbe la Muni). Fraccionamiento cada 15 minutos desde la segunda
            hora.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horarios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed">
          <div>
            <strong className="text-gray-900">Diurno:</strong> lunes a viernes
            de 07:00 a 21:00; sábados de 07:00 a 14:00.
          </div>
          <div>
            <strong className="text-gray-900">Nocturno:</strong> lunes a
            domingo de 22:00 a 05:00 (solo en zonas habilitadas).
          </div>
          <div>
            <strong className="text-gray-900">Feriados:</strong> no se cobra el
            diurno. Sí el nocturno.
          </div>
          <div>
            <strong className="text-gray-900">Tolerancia:</strong> 5 minutos al
            final de cada sesión.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zonas nocturnas habilitadas</CardTitle>
        </CardHeader>
        <CardContent>
          {zonas.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay zonas nocturnas habilitadas.
            </p>
          ) : (
            <ul className="space-y-1 text-base">
              {zonas.map((z) => (
                <li
                  key={z.id}
                  className="flex items-center gap-2 text-gray-800"
                >
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                  {z.nombre}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 flex-none text-blue-500" aria-hidden="true" />
            <span>
              Teléfono ciudadano:{' '}
              <strong className="font-mono text-gray-900">147</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 flex-none text-blue-500" aria-hidden="true" />
            <span className="break-all">
              estacionamientomedido@municipalidadsalta.gob.ar
            </span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin
              className="h-4 w-4 flex-none text-blue-500"
              aria-hidden="true"
            />
            <span>Presencial: Av. Paraguay 1240</span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
