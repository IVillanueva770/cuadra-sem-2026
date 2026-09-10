import {CircleCheck, MapPin, CircleX} from 'lucide-react';
import {cuadraPorId, permisionarioPorId, sesionVigentePorPatente} from '@/lib/datos';
import {rehidratarSesionesPropias} from '@/lib/datos/sesiones-propias';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {formatHora} from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function VerificarPage({
  params,
}: {
  params: Promise<{patente: string}>;
}) {
  const {patente} = await params;
  const patenteUpper = patente.toUpperCase();

  await rehidratarSesionesPropias();
  const sesion = sesionVigentePorPatente(patenteUpper);
  const activa = sesion !== null;
  const cuadraNombre = sesion ? cuadraPorId(sesion.cuadra_id)?.nombre_display ?? 'Cuadra asignada' : '';
  const permisionarioNombre = sesion ? permisionarioPorId(sesion.permisionario_id)?.nombre_completo ?? '' : '';

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
          {sesion ? (
            <div className="space-y-3 text-sm">
              <p className="text-gray-700">
                Habilitada hasta las{' '}
                <strong className="text-gray-900">
                  {formatHora(sesion.cubierta_hasta)}
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
                      {cuadraNombre}
                    </strong>
                  </div>
                  <div className="text-xs text-gray-500">
                    Permisionario: {permisionarioNombre}
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
