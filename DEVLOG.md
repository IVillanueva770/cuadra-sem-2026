## DEVLOG - Cuadra (PunaTech 2026 · Track Ciudad SEM Salta)

## Estado Actual
Bootstrap Next 15 + Tailwind 4 + Supabase listo. Schema de DB aplicado (14 tablas + funciones + RLS). Módulo motor de reglas Ord 12.170 con tests. Datos sintéticos creíbles cargados para demo: 15 permisionarios, 21 cuadras del microcentro de Salta, 21 días de asignaciones y ~14k sesiones distribuidas con métricas diarias calculadas.

## Tareas Activas
- [ ] Plan 08: dashboard Muni con datos reales
- [ ] Cuadra-10: siguientes pasos posteriores al seed

## Decisiones de Arquitectura
- Seed dinámico vía `@supabase/supabase-js` con `SERVICE_ROLE_KEY` en lugar de Supabase CLI (no instalado). Inserciones por batches de 500. Inserts de permisionarios y cuadras también vía supabase-js (los SQL en `supabase/seeds/` quedan como referencia documentada).
- Constraint único `idx_parking_sessions_patente_active` bloquea repetir patente en sesiones `active`. En el día 0 algunas sesiones quedan vigentes (cubierta_hasta > now), por lo que la generación random puede colisionar; aceptable para demo (corta el batch).

## Sesiones

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
