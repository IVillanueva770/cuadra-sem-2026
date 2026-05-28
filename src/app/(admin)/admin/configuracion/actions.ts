'use server';

import {revalidatePath} from 'next/cache';
import {createServiceClient} from '@/lib/supabase/server';

// =====================================================
// Tarifas
// =====================================================
export async function updateTarifa(formData: FormData) {
  const id = formData.get('id') as string;
  const monto_por_hora = parseFloat(formData.get('monto_por_hora') as string);
  const monto_por_fraccion_15min = parseFloat(formData.get('monto_por_fraccion_15min') as string);
  const descuento_digital_pct = parseFloat(formData.get('descuento_digital_pct') as string);

  if (!id || isNaN(monto_por_hora) || isNaN(monto_por_fraccion_15min)) {
    return {error: 'Datos inválidos'};
  }

  const supabase = createServiceClient();
  const {error} = await supabase
    .from('tarifas')
    .update({monto_por_hora, monto_por_fraccion_15min, descuento_digital_pct})
    .eq('id', id);

  if (error) return {error: error.message};

  revalidatePath('/admin/configuracion');
  return {success: true};
}

// =====================================================
// Config sistema
// =====================================================
export async function updateConfigSistema(formData: FormData) {
  const clave = formData.get('clave') as string;
  const valor = formData.get('valor') as string;

  if (!clave || valor === null) return {error: 'Datos inválidos'};

  const supabase = createServiceClient();

  // Intentar parsear como JSON, si falla usar como string JSON
  let valorJson: unknown;
  try {
    valorJson = JSON.parse(valor);
  } catch {
    valorJson = valor;
  }

  const {error} = await supabase
    .from('config_sistema')
    .update({valor: valorJson})
    .eq('clave', clave);

  if (error) return {error: error.message};

  revalidatePath('/admin/configuracion');
  return {success: true};
}

// =====================================================
// Feriados (stub — viewer con delete funcional)
// =====================================================
export async function deleteFeriado(id: string) {
  const supabase = createServiceClient();
  const {error} = await supabase.from('feriados').delete().eq('id', id);
  if (error) return {error: error.message};
  revalidatePath('/admin/configuracion');
  return {success: true};
}
