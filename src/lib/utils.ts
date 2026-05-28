import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatHora(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('es-AR', {
    timeZone: 'America/Argentina/Salta',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFecha(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Salta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
