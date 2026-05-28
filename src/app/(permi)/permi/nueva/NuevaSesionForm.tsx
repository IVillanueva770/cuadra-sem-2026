'use client';

import {useState, useTransition} from 'react';
import {useRouter} from 'next/navigation';
import {Car, Bike, AlertCircle, CheckCircle2} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {formatARS} from '@/lib/utils';
import {registrarEfectivo} from './actions';
import type {TipoVehiculo} from '@/lib/motor-reglas/tipos';

const DURACIONES = [60, 75, 90, 120, 150, 180] as const;

function formatDuracion(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

type Step = 'datos' | 'confirmar' | 'exito';

interface Calculo {
  monto: number;
  montoSinDescuento: number;
  cuadraId: string;
  cuadraNombre: string;
  asignacionId: string | null;
}

export default function NuevaSesionForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('datos');
  const [patente, setPatente] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState<TipoVehiculo>('auto');
  const [duracion, setDuracion] = useState<number>(60);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [calculo, setCalculo] = useState<Calculo | null>(null);
  const [, setSesionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCalcular() {
    if (!patente.trim()) {
      setError('Ingresá la patente del vehículo.');
      return;
    }
    setError(null);

    startTransition(async () => {
      const res = await registrarEfectivo({
        patente: patente.trim(),
        tipoVehiculo,
        duracionMinutos: duracion,
        emailConductor: email || undefined,
        modo: 'calcular',
      });

      if (!res.ok) {
        setError(res.error);
        return;
      }

      if (res.modo === 'calcular') {
        setCalculo({
          monto: res.monto,
          montoSinDescuento: res.montoSinDescuento,
          cuadraId: res.cuadraId,
          cuadraNombre: res.cuadraNombre,
          asignacionId: res.asignacionId,
        });
        setStep('confirmar');
      }
    });
  }

  function handleConfirmar() {
    setError(null);
    startTransition(async () => {
      const res = await registrarEfectivo({
        patente: patente.trim(),
        tipoVehiculo,
        duracionMinutos: duracion,
        emailConductor: email || undefined,
        modo: 'confirmar',
      });

      if (!res.ok) {
        setError(res.error);
        setStep('datos');
        return;
      }

      if (res.modo === 'confirmar') {
        setSesionId(res.sesionId);
        setStep('exito');
      }
    });
  }

  // — ÉXITO —
  if (step === 'exito') {
    return (
      <div className="p-6 space-y-6 text-center">
        <div
          className="mx-auto flex items-center justify-center w-16 h-16 rounded-full"
          style={{backgroundColor: 'var(--success-bg)'}}
          aria-hidden="true"
        >
          <CheckCircle2
            className="h-8 w-8"
            style={{color: 'var(--success)'}}
          />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold" style={{color: 'var(--fg1)'}}>
            Cobro registrado
          </h2>
          <p className="text-base font-mono tracking-wider" style={{color: 'var(--primary)'}}>
            {patente}
          </p>
          <p className="text-sm" style={{color: 'var(--fg2)'}}>
            {formatDuracion(duracion)} · {calculo ? formatARS(calculo.monto) : ''}
          </p>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              setStep('datos');
              setPatente('');
              setEmail('');
              setDuracion(60);
              setCalculo(null);
              setSesionId(null);
            }}
            className="w-full h-14 rounded-[10px] text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{backgroundColor: 'var(--primary)', color: 'white'}}
          >
            Registrar otro cobro
          </button>
          <button
            type="button"
            onClick={() => router.push('/permi')}
            className="w-full h-12 rounded-[10px] text-base font-medium border transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{borderColor: 'var(--border-strong)', color: 'var(--fg1)'}}
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  // — CONFIRMAR —
  if (step === 'confirmar' && calculo) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold" style={{color: 'var(--fg1)'}}>
            Confirmá el cobro
          </h2>
          <p className="text-sm mt-1" style={{color: 'var(--fg2)'}}>
            Revisá los datos antes de registrar.
          </p>
        </div>

        <div
          className="rounded-2xl border divide-y"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border)',
            boxShadow: 'var(--shadow-1)',
          }}
        >
          {[
            {label: 'Cuadra', value: calculo.cuadraNombre},
            {
              label: 'Patente',
              value: patente,
              mono: true,
            },
            {
              label: 'Vehículo',
              value: tipoVehiculo === 'auto' ? 'Auto' : 'Moto',
            },
            {label: 'Duración', value: formatDuracion(duracion)},
            {label: 'Medio de pago', value: 'Efectivo'},
          ].map(({label, value, mono}) => (
            <div
              key={label}
              className="flex items-center justify-between px-4 py-3"
            >
              <span className="text-sm" style={{color: 'var(--fg2)'}}>
                {label}
              </span>
              <span
                className={`text-base font-semibold ${mono ? 'font-mono tracking-wider' : ''}`}
                style={{color: 'var(--fg1)'}}
              >
                {value}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-base font-semibold" style={{color: 'var(--fg1)'}}>
              Total
            </span>
            <span
              className="font-mono text-2xl font-bold"
              style={{color: 'var(--primary)'}}
            >
              {formatARS(calculo.monto)}
            </span>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-[10px] border p-3 text-sm"
            style={{
              borderColor: 'var(--error)',
              backgroundColor: 'var(--error-bg)',
              color: '#991B1B',
            }}
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={isPending}
            className="w-full h-14 rounded-[10px] text-base font-semibold transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{backgroundColor: 'var(--primary)', color: 'white'}}
          >
            {isPending ? 'Registrando…' : 'Confirmar cobro'}
          </button>
          <button
            type="button"
            onClick={() => setStep('datos')}
            disabled={isPending}
            className="w-full h-12 rounded-[10px] text-base font-medium border transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{borderColor: 'var(--border-strong)', color: 'var(--fg1)'}}
          >
            Volver y editar
          </button>
        </div>
      </div>
    );
  }

  // — DATOS —
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{color: 'var(--fg1)'}}>
          Registrar cobro
        </h1>
        <p className="text-base mt-1" style={{color: 'var(--fg2)'}}>
          Completá los datos del estacionamiento.
        </p>
      </div>

      {/* Patente */}
      <div className="space-y-2">
        <Label htmlFor="patente" className="text-base font-semibold">
          Patente del vehículo
        </Label>
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
          disabled={isPending}
          className="h-14 text-xl font-mono tracking-wider"
        />
      </div>

      {/* Tipo de vehículo */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Tipo de vehículo</Label>
        <div className="grid grid-cols-2 gap-3">
          {(['auto', 'moto'] as const).map((tipo) => {
            const Icon = tipo === 'auto' ? Car : Bike;
            const active = tipoVehiculo === tipo;
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => setTipoVehiculo(tipo)}
                aria-pressed={active}
                disabled={isPending}
                className="flex flex-col items-center justify-center gap-2 rounded-[10px] border-2 py-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50"
                style={{
                  borderColor: active ? 'var(--primary)' : 'var(--border-strong)',
                  backgroundColor: active ? 'var(--blue-50)' : 'var(--bg-surface)',
                  color: active ? 'var(--primary)' : 'var(--fg2)',
                }}
              >
                <Icon className="h-8 w-8" aria-hidden="true" />
                <span className="text-base font-semibold capitalize">{tipo}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Duración */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">Duración</Label>
        <div className="grid grid-cols-3 gap-2">
          {DURACIONES.map((mins) => {
            const active = duracion === mins;
            return (
              <button
                key={mins}
                type="button"
                onClick={() => setDuracion(mins)}
                aria-pressed={active}
                disabled={isPending}
                className="h-14 rounded-[10px] border-2 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
                style={{
                  borderColor: active ? 'var(--primary)' : 'var(--border-strong)',
                  backgroundColor: active ? 'var(--primary)' : 'var(--bg-surface)',
                  color: active ? 'white' : 'var(--fg1)',
                }}
              >
                {formatDuracion(mins)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Email conductor (opcional) */}
      <div className="space-y-2">
        <Label htmlFor="email-conductor" className="text-base font-semibold">
          Email del conductor{' '}
          <span className="font-normal" style={{color: 'var(--fg3)'}}>
            (opcional)
          </span>
        </Label>
        <Input
          id="email-conductor"
          type="email"
          placeholder="conductor@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          disabled={isPending}
          className="h-14"
        />
        <p className="text-sm" style={{color: 'var(--fg3)'}}>
          Se usa si el conductor necesita pagar una extensión.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-[10px] border p-3 text-sm"
          style={{
            borderColor: 'var(--error)',
            backgroundColor: 'var(--error-bg)',
            color: '#991B1B',
          }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleCalcular}
        disabled={isPending || !patente.trim()}
        className="w-full h-14 rounded-[10px] text-base font-semibold transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        style={{backgroundColor: 'var(--primary)', color: 'white'}}
      >
        {isPending ? 'Calculando…' : 'Ver monto y confirmar'}
      </button>
    </div>
  );
}
