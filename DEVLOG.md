## DEVLOG - Cuadra (PunaTech 2026 · Track Ciudad SEM Salta)

## Estado Actual
Bootstrap Next 15 + Tailwind 4 + Supabase listo. Schema de DB aplicado (14 tablas + funciones + RLS). Módulo motor de reglas Ord 12.170 con tests. Datos sintéticos creíbles cargados para demo: 15 permisionarios, 21 cuadras del microcentro de Salta, 21 días de asignaciones y ~14k sesiones distribuidas con métricas diarias calculadas. PWA Conductor end-to-end: `/pagar/[qrcode]` (form patente + tipo + duración con cálculo en vivo), Payment Brick MP, `/pagar/exito/[sid]` con Status Screen + Comprobante + botón liberar (D16), `/verificar/[patente]` vista pública, `/ordenanza` info ley siempre visible (D14).

## Tareas Activas
- [ ] Plan 08: dashboard Muni con datos reales
- [ ] Plan 07: PWA Permisionario
- [ ] Cuadra-10: siguientes pasos posteriores al seed

## Decisiones de Arquitectura
- Seed dinámico vía `@supabase/supabase-js` con `SERVICE_ROLE_KEY` en lugar de Supabase CLI (no instalado). Inserciones por batches de 500. Inserts de permisionarios y cuadras también vía supabase-js (los SQL en `supabase/seeds/` quedan como referencia documentada).
- Constraint único `idx_parking_sessions_patente_active` bloquea repetir patente en sesiones `active`. En el día 0 algunas sesiones quedan vigentes (cubierta_hasta > now), por lo que la generación random puede colisionar; aceptable para demo (corta el batch).

## Sesiones

### [2026-05-28] - Sesión PWA Conductor (Plan 06)
**Objetivo:** Implementar el flow completo del conductor end-to-end.
**Hecho:**
- `src/app/(publico)/pagar/[qrcode]/page.tsx` + `PagoForm.tsx` + `PaymentBrickWrapper.tsx` + `actions.ts`. Form de patente con validación AB123CD/ABC123, selector visual auto/moto (cards con ícono grande estilo kit conductor), stepper +/- de tiempo en pasos de 15min (30–240), email opcional. Validación server-side: D12 (no doble sesión activa por patente) + motor de reglas (horario/feriado/zona). Cálculo en vivo con descuento 20% digital. Payment Brick con X-Idempotency-Key obligatorio.
- `src/app/(publico)/pagar/exito/[sid]/page.tsx` + `StatusScreenWrapper.tsx` + `LiberarBoton.tsx` + `actions-extra.ts`. Status Screen Brick MP + Comprobante card. Botón opt-in "Liberé la cuadra" (D16) con feedback inline.
- `src/components/cuadra/Comprobante.tsx`. Card con header azul institucional, número de comprobante (mp_payment_id o uuid corto), todos los datos de la sesión, total destacado en mono.
- `src/app/(publico)/verificar/[patente]/page.tsx`. Vista pública RPC `verificar_patente_activa` para movilidad entre cuadras (estado activa + dónde se pagó + hasta cuándo).
- `src/app/(publico)/ordenanza/page.tsx`. Módulo siempre visible (D14) con tarifas vigentes, horarios, zonas nocturnas habilitadas y contacto. Lee de DB directamente.
**Decisiones:**
- Server actions con `'use server'` re-validan motor de reglas (timing attacks/double submit). Crean parking_session en estado `extended_pending` antes de llamar a MP; actualizan status a `active`/`rejected` según respuesta. Si MP falla, marcan `rejected`.
- `issuer_id` se castea a number para tipo MP (el Brick devuelve string).
- Iconografía Lucide nueva API (`CircleAlert`, `CircleCheck`, `CircleX`) — la versión instalada (1.16.0 en package.json, pero el d.ts es del set unificado nuevo) ya no exporta `AlertCircle`/`CheckCircle2`/`XCircle`.
- Usé los UI primitives ya existentes (`@/components/ui/{button,card,input,label,badge}`); no recreé. Para el selector vehículo y stepper de tiempo se hicieron botones custom con tokens del DS (azul `#145FB0`, gold sólo donde aplica, sin gradientes).
**Problemas encontrados:**
- Lucide-react: nombres viejos no existen en el d.ts; resuelto renombrando a la API nueva.
- `Button asChild` no existe en mi `button.tsx` (no incluye Slot de Radix); reemplacé por `<Link>` con clases inline.
- RPC `verificar_patente_activa` retorna columnas `sesion_id` y no `parking_session_id` ni `monto`; corregí la interfaz.
**Próximos pasos:**
- Plan 07 (PWA Permisionario) o Plan 08 (dashboard Muni). Probar el flow contra la base seedeada eligiendo un QR de permisionario activo con asignación hoy.

### [2026-05-28] - Sesión seed datos sintéticos (Plan 09)
**Objetivo:** Poblar la base con datos creíbles para que el dashboard Muni del demo se vea con volumen real.
**Hecho:**
- `supabase/seeds/01_permisionarios.sql` (15 permis, nombres reales tipo NOA, mix medios de cobro).
- `supabase/seeds/02_cuadras.sql` (21 cuadras: microcentro diurno + zonas Balcarce/Güemes/Alvarado nocturnas).
- `scripts/seed-dinamico.ts`: inserta estáticos vía supabase-js (idempotente con upsert), genera 21 días de asignaciones, ~14k sesiones distribuidas (70% digital / 30% efectivo, 85% autos / 15% motos), calcula métricas vía RPC `calcular_metricas_diarias`.
- Script `seed` agregado a `package.json` con `tsx --env-file=.env.local`.
**Decisiones:**
- No instalar Supabase CLI ni `pg`; usar SDK Supabase con SERVICE_ROLE_KEY directo. Más simple y portable.
- `tsx --env-file=.env.local` evita dependencia de `dotenv`.
**Problemas encontrados:**
- 1 batch del día 0 tuvo conflict en patente activa (constraint único). Solo afectó ~200 inserts del último día; total final 14293 sesiones, dentro del rango esperado.
**Próximos pasos:**
- Plan 08 (dashboard Muni). Aprovechar los datos cargados.
