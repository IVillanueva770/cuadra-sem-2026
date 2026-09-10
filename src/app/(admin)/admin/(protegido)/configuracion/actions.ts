'use server';

import {revalidatePath} from 'next/cache';
import {esAdmin} from '@/lib/auth-demo/servidor';
import {actualizarConfig, actualizarTarifa, borrarFeriado} from '@/lib/datos';

// =====================================================
// Tarifas
// =====================================================
export async function updateTarifa(formData: FormData) {
  if (!(await esAdmin())) return {error: 'No autorizado'};

  const id = formData.get('id') as string;
  const monto_por_hora = parseFloat(formData.get('monto_por_hora') as string);
  const monto_por_fraccion_15min = parseFloat(formData.get('monto_por_fraccion_15min') as string);
  const descuento_digital_pct = parseFloat(formData.get('descuento_digital_pct') as string);

  if (!id || isNaN(monto_por_hora) || isNaN(monto_por_fraccion_15min)) {
    return {error: 'Datos inválidos'};
  }

  if (!actualizarTarifa(id, {monto_por_hora, monto_por_fraccion_15min, descuento_digital_pct})) {
    return {error: 'Tarifa no encontrada'};
  }

  revalidatePath('/admin/configuracion');
  return {success: true};
}

// =====================================================
// Config sistema
// =====================================================
export async function updateConfigSistema(formData: FormData) {
  if (!(await esAdmin())) return {error: 'No autorizado'};

  const clave = formData.get('clave') as string;
  const valor = formData.get('valor') as string;

  if (!clave || valor === null) return {error: 'Datos inválidos'};

  // Intentar parsear como JSON, si falla usar como string
  let valorJson: unknown;
  try {
    valorJson = JSON.parse(valor);
  } catch {
    valorJson = valor;
  }

  if (!actualizarConfig(clave, valorJson)) return {error: 'Clave no encontrada'};

  revalidatePath('/admin/configuracion');
  return {success: true};
}

// =====================================================
// Feriados (stub: viewer con delete funcional)
// =====================================================
export async function deleteFeriado(id: string) {
  if (!(await esAdmin())) return {error: 'No autorizado'};
  if (!borrarFeriado(id)) return {error: 'Feriado no encontrado'};
  revalidatePath('/admin/configuracion');
  return {success: true};
}
