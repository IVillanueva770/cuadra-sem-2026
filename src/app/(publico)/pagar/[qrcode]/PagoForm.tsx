'use client';

import Link from 'next/link';
import {useState, useTransition} from 'react';
import {Car, Bike, MapPin, CircleAlert, Minus, Plus, ArrowLeft} from 'lucide-react';
import {motion, useReducedMotion} from 'motion/react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {formatARS} from '@/lib/utils';
import {validarYCalcular} from './actions';
import PaymentBrickWrapper from './PaymentBrickWrapper';

interface Props {
  permisionarioId: string;
  permisionarioNombre: string;
  cuadraId: string;
  cuadraNombre: string;
}

type Step = 'datos' | 'pagar';

const MIN_DURACION = 30;
const MAX_DURACION = 240;
const STEP_DURACION = 15;

function formatDuracion(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export default function PagoForm({
  permisionarioId,
  permisionarioNombre,
  cuadraId,
  cuadraNombre,
}: Props) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState<Step>('datos');
  const [patente, setPatente] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState<'auto' | 'moto'>('auto');
  const [duracion, setDuracion] = useState(60);
  const [email, setEmail] = useState('');
  const [calculo, setCalculo] = useState<{
    monto_total: number;
    monto_sin_descuento: number;
    descuento: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function ajustarDuracion(delta: number) {
    setDuracion((d) =>
      Math.min(MAX_DURACION, Math.max(MIN_DURACION, d + delta))
    );
  }

  function handleContinuar() {
    setError(null);
    startTransition(async () => {
      const res = await validarYCalcular({
        cuadraId,
        tipoVehiculo,
        duracion,
        patente,
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }

      setCalculo(res.calculo);
      setStep('pagar');
    });
  }

  if (step === 'datos') {
    return (
      <motion.main
        className="mx-auto max-w-md p-6 space-y-6"
        key="step-datos"
        initial={reduced ? false : {opacity: 0, y: 8}}
        animate={reduced ? {} : {opacity: 1, y: 0}}
        exit={reduced ? {} : {opacity: 0, y: -8}}
        transition={{duration: 0.18, ease: [0.4, 0, 0.2, 1]}}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver
        </Link>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-blue-500" aria-hidden="true" />
          <span className="font-semibold">{cuadraNombre}</span>
          <span className="text-gray-400">·</span>
          <span>Atiende {permisionarioNombre}</span>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Pagá tu estacionamiento
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Te identificamos por la patente. No hace falta registrarse.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos del vehículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="patente">Patente</Label>
              <Input
                id="patente"
                placeholder="ABC123 o AB123CD"
                value={patente}
                onChange={(e) =>
                  setPatente(e.target.value.toUpperCase().replace(/\s/g, ''))
                }
                maxLength={7}
                autoFocus
                inputMode="text"
                autoCapitalize="characters"
                className="font-mono text-xl tracking-wider"
              />
              <p className="text-xs text-gray-500">
                Como aparece en tu chapa patente.
              </p>
            </div>

            <div className="space-y-2">
              <Label>¿Qué estás estacionando?</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoVehiculo('auto')}
                  aria-pressed={tipoVehiculo === 'auto'}
                  className={`flex flex-col items-center justify-center gap-2 rounded-[10px] border-2 py-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    tipoVehiculo === 'auto'
                      ? 'border-blue-500 bg-blue-50 text-blue-500'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Car className="h-8 w-8" aria-hidden="true" />
                  <span className="text-base font-semibold">Auto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipoVehiculo('moto')}
                  aria-pressed={tipoVehiculo === 'moto'}
                  className={`flex flex-col items-center justify-center gap-2 rounded-[10px] border-2 py-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    tipoVehiculo === 'moto'
                      ? 'border-blue-500 bg-blue-50 text-blue-500'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Bike className="h-8 w-8" aria-hidden="true" />
                  <span className="text-base font-semibold">Moto</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>¿Cuánto tiempo vas a estar?</Label>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => ajustarDuracion(-STEP_DURACION)}
                  disabled={duracion <= MIN_DURACION}
                  aria-label="Restar 15 minutos"
                  className="grid h-14 w-14 place-items-center rounded-[10px] border-2 border-gray-200 text-blue-500 transition-colors hover:bg-gray-50 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <Minus className="h-6 w-6" />
                </button>
                <div className="flex-1 text-center">
                  <div className="font-mono text-3xl font-medium text-gray-900">
                    {formatDuracion(duracion)}
                  </div>
                  <div className="text-xs text-gray-500">
                    de {MIN_DURACION} a {MAX_DURACION} min · pasos de{' '}
                    {STEP_DURACION}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => ajustarDuracion(STEP_DURACION)}
                  disabled={duracion >= MAX_DURACION}
                  aria-label="Sumar 15 minutos"
                  className="grid h-14 w-14 place-items-center rounded-[10px] border-2 border-gray-200 text-blue-500 transition-colors hover:bg-gray-50 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="vos@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <p className="text-xs text-gray-500">
                Te mandamos el comprobante por mail.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-[10px] border border-red-200 bg-red-50 p-3 text-sm text-red-900"
              >
                <CircleAlert
                  className="mt-0.5 h-4 w-4 flex-none"
                  aria-hidden="true"
                />
                <span>{error}</span>
              </div>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleContinuar}
              disabled={isPending || !patente}
            >
              {isPending ? 'Calculando…' : 'Continuar al pago'}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-500">
          Identificamos tu auto por la patente. Acordate de tu DNI físico por si
          te lo piden.
        </p>
      </motion.main>
    );
  }

  if (step === 'pagar' && calculo) {
    return (
      <motion.main
        className="mx-auto max-w-md p-6 space-y-6"
        key="step-pagar"
        initial={reduced ? false : {opacity: 0, y: 8}}
        animate={reduced ? {} : {opacity: 1, y: 0}}
        transition={{duration: 0.18, ease: [0.4, 0, 0.2, 1]}}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{cuadraNombre}</Badge>
          <Badge variant="outline" className="font-mono">
            {patente}
          </Badge>
          <Badge variant="secondary">{formatDuracion(duracion)}</Badge>
        </div>

        <motion.div
          initial={reduced ? false : {opacity: 0, y: 6}}
          animate={reduced ? {} : {opacity: 1, y: 0}}
          transition={{duration: 0.2, ease: [0.4, 0, 0.2, 1], delay: 0.05}}
        >
          <Card>
            <CardContent className="space-y-1 p-5">
              <div className="text-sm uppercase tracking-wider text-gray-500">
                Total a pagar
              </div>
              <div className="font-mono text-4xl font-semibold text-gray-900">
                {formatARS(calculo.monto_total)}
              </div>
              {calculo.descuento > 0 && (
                <p className="pt-1 text-sm text-emerald-700">
                  Pago digital · descuento de {formatARS(calculo.descuento)} (lo
                  absorbe la Muni)
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <PaymentBrickWrapper
          amount={calculo.monto_total}
          permisionarioId={permisionarioId}
          cuadraId={cuadraId}
          patente={patente}
          tipoVehiculo={tipoVehiculo}
          duracionMinutos={duracion}
          email={email}
        />

        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
          <span className="font-medium text-gray-800">¿Preferís pagar en efectivo?</span> Decíselo al permisionario: lo cobra en mano y lo registra al instante, sin papeles.
        </div>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setStep('datos')}
        >
          Volver
        </Button>
      </motion.main>
    );
  }

  return null;
}
