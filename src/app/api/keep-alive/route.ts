/**
 * Keep-alive del proyecto Supabase.
 *
 * Cuadra es un demo (no producción) que se mantiene linkeado en la página de
 * proyectos. El plan free de Supabase pausa el proyecto tras 7 días sin
 * actividad, lo que rompería el link. Este endpoint hace una consulta mínima
 * para registrar actividad y evitar la pausa. Lo dispara el cron de Vercel
 * (ver vercel.json).
 *
 * Usa el service client (bypassa RLS) para que el ping cuente como actividad
 * sin depender del estado de las policies.
 */
import {NextResponse} from 'next/server';
import {createServiceClient} from '@/lib/supabase/server';

// Debe ejecutarse de verdad en cada corrida del cron, nunca servir cacheado.
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Si CRON_SECRET está configurado, exigirlo. Vercel lo envía como
  // `Authorization: Bearer <CRON_SECRET>` en los crons cuando la env existe.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ok: false, error: 'unauthorized'}, {status: 401});
    }
  }

  try {
    const supabase = createServiceClient();
    // Consulta mínima (head + count, sin traer filas) sólo para registrar actividad.
    const {error} = await supabase
      .from('config_sistema')
      .select('*', {count: 'exact', head: true});

    if (error) {
      return NextResponse.json({ok: false, error: error.message}, {status: 500});
    }

    return NextResponse.json({ok: true, ts: new Date().toISOString()});
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ok: false, error: msg}, {status: 500});
  }
}
