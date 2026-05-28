import {CircleCheck, MapPin, CircleX} from 'lucide-react';
import {createServiceClient} from '@/lib/supabase/server';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {formatHora} from '@/lib/utils';

interface VerificacionRow {
  sesion_id: string;
  cubierta_hasta: string;
  permisionario_nombre: string;
  cuadra_nombre: string;
}

export default async function VerificarPage({
  params,
}: {
  params: Promise<{patente: string}>;
}) {
  const {patente} = await params;
  const patenteUpper = patente.toUpperCase();

  const supabase = createServiceClient();
  const {data: sesion} = await supabase.rpc('verificar_patente_activa', {
    p_patente: patenteUpper,
  });

  const filas: VerificacionRow[] = Array.isArray(sesion) ? sesion : [];
  const activa = filas.length > 0;

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <header>
        <p className="text-sm uppercase tracking-wider text-gray-500">
          Verificación de patente
        </p>
        <h1 className="font-mono text-3xl font-bold text-gray-900">
          {patenteUpper}
        </h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {activa ? (
              <>
                <CircleCheck
                  className="h-6 w-6 text-emerald-600"
                  aria-hidden="true"
                />
                Sesión activa
              </>
            ) : (
              <>
                <CircleX className="h-6 w-6 text-gray-400" aria-hidden="true" />
                Sin sesión activa
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activa ? (
            <div className="space-y-3 text-sm">
              <p className="text-gray-700">
                Habilitada hasta las{' '}
                <strong className="text-gray-900">
                  {formatHora(filas[0].cubierta_hasta)}
                </strong>
                .
              </p>
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin
                  className="mt-0.5 h-4 w-4 flex-none text-blue-500"
                  aria-hidden="true"
                />
                <div>
                  <div>
                    Cobrado en{' '}
                    <strong className="text-gray-900">
                      {filas[0].cuadra_nombre}
                    </strong>
                  </div>
                  <div className="text-xs text-gray-500">
                    Permisionario: {filas[0].permisionario_nombre}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Esta patente no tiene una sesión activa en este momento. Si
              estacionaste, asegurate de haber pagado en la cuadra donde estás.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <Badge variant="outline">
          {activa
            ? 'Cualquier cuadra del microcentro acepta esta sesión'
            : 'Verificación pública · Ordenanza N° 12.170'}
        </Badge>
      </div>
    </main>
  );
}
