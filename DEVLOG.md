## DEVLOG - Cuadra (PunaTech 2026 · Track Ciudad SEM Salta)

## Estado Actual

**Preparación de la demo + entrega 30/05:**
- **Pago del conductor**: se quitó el efectivo offline de MP (Rapipago/Pago Fácil, método `ticket` omitido) → sólo medios digitales; el efectivo lo cobra el permisionario. Se habilitó `bankTransfer` (transferencia vía MP; el sandbox AR muestra sólo tarjetas, en prod aparecen todos). Botón **"Tarjeta de prueba"** (`TarjetaPrueba.tsx`, DEMO) que copia cada dato para pegar en el Brick.
- **Datos del día**: `pnpm seed:hoy` siembra sesiones/asignaciones/métricas del día actual (ojo timezone UTC: re-correr si se cruza medianoche UTC = 21 hs Salta).
- **Flag de horario**: `DEMO_PERMITIR_FUERA_DE_HORARIO` en `validaciones.ts` permitió cobrar fuera de horario para grabar; **restaurado a `false`** (cumple Ord. 12.170).
- **Botones de salir/volver**: logout en header permi (`LogoutButton`), volver a home en el conductor.
- **Entrega**: respuestas del formulario (Página 4) en `docs/postulacion-cuadra.txt`. QR de demo en `screenshots/demo/`. Repo público, app en `cuadra-sem.vercel.app`.

**Coherencia de datos + microinteracciones a fondo 29/05:**
- **Bug crítico de datos resuelto**: el dashboard traía filas de `parking_sessions` y contaba en JS, pero Supabase capea a 1000 → 7d y 30d daban ambos 1000 y permisionarios activos salían al revés. Ahora `traerSesiones()` pagina de a 1000 (`.range`) y trae todo. Verificado: Hoy 780 / 7d 4.542 / 30d 15.320 (crece correcto).
- **KpiCard**: ícono fijo arriba-derecha (alineado en las 4), número sin truncar (`tabular-nums`), alturas uniformes (título a 2 líneas + `h-full`).
- **`formatARS`** sin el espacio del locale → `$715.230` pegado (afecta toda la app).
- **RangoSelector** con estado optimista (se desliza al instante, no se traba) + navegación en `startTransition`.
- **Listas paginadas** (permisionarios, auditoría): cross-fade por página (`motion.tbody key={pagina}`) en vez de exit/enter por fila (no más parpadeo) + altura reservada. Nuevo **paginador en `/permi`** (`AnterioresList`, 6/pág).
- **Foco de sesión** (`SesionItem`): la card es tocable y se abre en modal con `layoutId` compartido (vuela al frente y se agranda) — patente/horas grandes para legibilidad, duración + monto, acción extender; cierra volviendo a su lugar.
- **Microinteracciones**: `Button` base con `active:scale`; todos los CTAs/selectores de `/permi` con hover + hundir; cards (landing + permi KPIs) con hover-lift; **BottomNav** con pastilla deslizante (`layoutId`).
- **Cierre del día**: jerarquía 2 niveles (desglose liviano + 3 filas-resultado con fondo de color semántico: verde entra / ámbar a rendir / azul total).
- **Logout** reutilizable (`LogoutButton`) en header permi; **Volver** a la home en el conductor (`/pagar`).
- **Logos** con auto recentrado (swap assets skill + app + favicon). Página técnica `arquitectura.html` (+ `-hibrida`) con autoevaluación SEM, 4 diagramas SVG, lightbox, scrollspy, typing.

**Pulido diagramas + microinteracciones 29/05:**
- **Diagramas de la página técnica** rehechos: barras con nombre descriptivo (no `archivo.svg`) + punto verde "en línea" titilante; secuencia de pago con fondo (knockout) detrás de cada label para no pisar las líneas de vida; máquina de estados reorganizada sin la flecha punteada que cruzaba; **DER rehecho** (flechas FK tipo bus, cajas de dinero rotuladas → permisionarios/→Muni, catálogos sin solape, sin flechas sueltas); cada diagrama se **amplía a pantalla completa** al tocarlo (lightbox, clona la figure; sirve en mobile con scroll). "Por qué es rápido" pasó de texto corrido a 4 items.
- **Microinteracciones app**: todos los botones se hunden al click (`active:scale-[0.97]` en el Button base); card de acciones de la landing con hover-lift como los diferenciales; botón "Autocompletar datos de demo" (permi y admin) ahora **escribe las credenciales con efecto máquina de escribir** (helper `typeInto`, email y luego contraseña).
- Verificado en producción (desktop + mobile). Commits `a12f663` (diagramas) y `207f31a` (app).

**Logo recentrado + página técnica de ingeniería 29/05:**
- **Logo:** el usuario recentró el auto dentro del cartel (el pendiente de marca). Se reemplazaron los 7 assets en el skill `cuadra-design` (symbol, lockups color/light/mono, íconos PWA 192/512, splash) y se propagaron a `public/icons/` + `app/icon.svg` (favicon). El symbol nuevo envuelve el auto en `<g transform="translate(0,-2.6)">`. `CuadraMark` ya estaba consistente (usa viewBox propio recortado al auto).
- **Página técnica `public/arquitectura.html`** reescrita a fondo como documento de ingeniería entre pares (sin frases de venta): §1 problema en términos técnicos, §2 **autoevaluación punto por punto contra el pliego SEM** (6 requisitos obligatorios + 5 consideraciones + mapeo a criterios 33/33/33), §3 diagrama de capas, §4 secuencia del pago + análisis de latencia, §5 registro del efectivo, §6 DER de las 14 tablas + máquina de estados, §7 motor de reglas, §8 integridad/seguridad, §9 escala, §10 stack. **4 diagramas SVG hechos a mano** (capas, secuencia, DER, estados). Estética blueprint (grilla técnica, mono, acento cian, numeración §, engranaje decorativo).
- **Dos versiones para que el usuario elija:** `arquitectura.html` (blueprint clara) y `arquitectura-hibrida.html` (texto claro + diagramas sobre paneles oscuros). Los SVG usan tokens `--d-*` heredados, así el mismo markup sirve en ambos temas. Ambas linkeadas desde el FAB de DemoNav. **PENDIENTE: el usuario elige una y se borra la otra.**
- Fuentes de verdad usadas: documento SEM original (`Downloads/SEM Diagnostico PunaTech 2026.docx`) y el schema real (`supabase/migrations/00000000_initial_schema.sql`).

**Pulido final 29/05 (post-cascada, deployado):**
- **Paginadores**: componente `src/components/cuadra/Paginador.tsx` (rango con elipsis si >7 páginas, hover/tap con motion, "Mostrando X–Y de Z"). Integrado en permisionarios (8/pág) y auditoría (15/pág) del admin.
- **Logo en headers azules sin cuadro**: `CuadraMark` gana variante `plain` (solo el auto, recortes "calados" con `cutout` sobre el fondo azul). Aplicada en header permi (`size 40`) y sidebar admin (`size 44`) — adiós al cuadro que chocaba contra el fondo.
- **Página técnica para el jurado**: `public/arquitectura.html` (standalone, estilos del DS). De ingeniero a ingeniero: stack, arquitectura por capas, por qué es rápido (Brick sin redirect vs ~2 min del v1), flujo de pago end-to-end, motor de reglas, modelo de datos, seguridad, escalabilidad y pasos a producción. Accesible desde el FAB de DemoNav ("Arquitectura técnica (jurado)").
- Build limpio + 32/32 verdes. Commit `904386e`.

**Pulido a fondo 29/05 (cascada planes 12-17, todos deployados):**
- **Bugs/marca (12)**: panel admin ahora responsive (sidebar = drawer con hamburguesa en mobile, fijo en desktop); logo Cuadra en el admin; favicon Cuadra (`app/icon.svg`); fix sesión cruzada entre roles (logins hacen signOut al montar, `/permi` redirige a `/login` si no hay perfil, DemoNav entra por los logins).
- **Flujo permisionario-céntrico (13, el corazón)**: el permisionario ahora opera el cobro **digital** además del efectivo — en `/permi/nueva` elige medio; digital genera sesión `extended_pending` + pantalla `/permi/cobro/[sid]` con **QR** (`qrcode.react`) que el conductor escanea y paga en `/pagar/sesion/[sid]` (Brick); realtime confirma. **Validación de patente vigente**: no cobra dos veces, avisa "cubierta hasta HH:MM" y ofrece extender (movilidad entre cuadras). Helper `src/lib/sesiones/patente-vigente.ts`.
- **Dashboard Muni (14)**: filtro de rango (Hoy/7d/30d con `?rango=`), KPIs con comparativa vs período anterior, composición digital/efectivo, efectivo a conciliar (20% Muni), top cuadras por recaudación.
- **Tablas admin (15)**: permisionarios con buscador + filtros + recaudación 30d; auditoría con filtros + contadores.
- **Animaciones (16)**: entrada stagger sobria en los 3 perfiles + microinteracciones, respeta `prefers-reduced-motion`. Helper `src/lib/anim.ts`.
- **Landing pública (17)**: home institucional one-screen — input real "verificar patente", accesos por actor, nota al conductor sobre el QR, **co-branding con logo Muni** en el pie.
- Doc `docs/PITCH.md` corregido: el antecedente 2024-25 murió por **latencia** (no política); diferencial central = velocidad + permisionario como agente activo del cobro digital.
- Build limpio + 32/32 tests verdes en cada plan. Screenshots en `screenshots/pulido-29may/`.

---

Capa de DEMO para el pitch (28/05 noche): **SplashScreen** de apertura (auto que estaciona, recrea logo-explorations/splash.html con motion, 1x por sesión, re-disparable). **DemoNav** = FAB flotante en todas las pantallas para saltar entre las 3 experiencias con credenciales a la vista (DEMO ONLY, sacable borrando `<DemoNav/>` del layout + el archivo). Botón "Autocompletar datos de demo" en ambos logins. Usuario admin de demo: `admin@municipalidadsalta.gob.ar / muni2026` (script `seed:admin`). Doc de pitch en `docs/PITCH.md`. Dependencia nueva: `motion` (Framer Motion).

PENDIENTE de marca: el auto del logo está ~3.6px bajo del centro vertical del cuadrado (mismo trazo en symbol/logo/splash). Lo ajusta el usuario en el design system y regenera assets (hay PNG raster que no se editan a mano).

🌐 **LIVE EN PRODUCCIÓN: https://cuadra-sem.vercel.app** (Vercel, proyecto `cuadra-sem`, región gru1, conectado al repo GitHub). Next.js 15.5.18 (bump desde 15.2.3 por CVE-2025-66478 que Vercel bloqueaba). 10 env vars de producción seteadas (MP test tokens, Supabase, RESEND, APP_URL, NEXT_PUBLIC_APP_URL, MP_WEBHOOK_SECRET). Webhook MP con HMAC funcionando y auditando en `webhook_events` (verificado con POST de prueba). Supabase conecta en prod (/ordenanza renderiza tarifas reales). Webhook en modo permisivo (STRICT_WEBHOOK no seteado): valida firma y loguea, no rechaza.

Bootstrap Next 15 + Tailwind 4 + Supabase listo. Schema de DB aplicado (14 tablas + funciones + RLS). Motor de reglas Ord 12.170 con 27 tests unit verdes. Datos sintéticos cargados: 15 permisionarios, 21 cuadras del microcentro de Salta, 21 días de asignaciones y ~14k sesiones con métricas diarias calculadas.

Flows implementados: PWA Conductor (`/pagar/[qrcode]`, `/pagar/exito/[sid]`, `/verificar/[patente]`, `/ordenanza`). PWA Permisionario (`/login`, `/permi`, `/permi/nueva`, `/permi/extender/[sid]`, `/permi/conciliar`). Dashboard Admin (`/admin/*`). Webhook MP en `/api/webhooks/mp`.

Suite de tests: 27 unit + 5 integration (vitest) todos verdes. 24 E2E (Playwright, desktop+mobile) verdes, 4 skip condicionales por horario nocturno (motor bloquea cobro fuera de 07:00-21:00). 0 fallando.

El bug de redirect loop en `/login` está RESUELTO: se movió `login/` del grupo `(permi)` al grupo `(publico)` (sin auth-guard). La URL `/login` se mantiene. Verificado: GET /login → 200.

Cascada de planes COMPLETA (07, 08, 11 + fix). Único pendiente: Plan 10 (Deploy Vercel), que requiere presencia del usuario (login Vercel, env vars, webhook MP HMAC).

## Sesiones

### [2026-05-29] - Sesión Plan 14: dashboard Muni con filtros + comparativas + composición
**Objetivo:** Hacer el dashboard admin mucho más útil para el jurado Muni: filtro de rango temporal, KPIs con comparativa vs período anterior, composición digital/efectivo, conciliación de efectivo, top cuadras.
**Hecho:**
- `KpiCard.tsx`: prop `delta?: {pct, label, positiveIsGood?}` — muestra flecha + % vs período anterior con color (verde si sube, rojo si baja). No rompe si no hay datos previos.
- `RecaudacionChart.tsx`: prop `titulo?` — título dinámico según rango.
- `RangoSelector.tsx` (nuevo): client component con chips "Hoy / 7 días / 30 días". Highlight con `motion.div layoutId="rango-activo"` que viaja entre chips (NO bg-color por chip). `router.push('/admin?rango=...')`.
- `ComposicionPagos.tsx` (nuevo): barra horizontal segmentada + dos cards Digital/Efectivo (montos + sesiones + %). Refuerza el 20% de descuento digital.
- `EfectivoConciliar.tsx` (nuevo): muestra total efectivo + cuánto corresponde rendir a la Muni (20%), con texto claro de trazabilidad.
- `TopCuadras.tsx` (nuevo): lista top 8 cuadras por recaudación en el rango, igual estética que `TopPermisionarios`.
- `admin/page.tsx`: reescrito con `searchParams: Promise<SearchParams>` (Next.js 15 async). Resuelve rango `hoy|7d|30d` (default `7d`), calcula `desde`/`hasta` + período anterior. 3 queries paralelos: sesiones actuales, sesiones prev, métricas_diarias. Layout nuevo: header+selector / 4 KPIs / composición+conciliación / chart+top permi / top cuadras+realtime.
**Decisiones:**
- `searchParams` como `Promise<SearchParams>` (patrón Next.js 15 async params). Resuelto con `await searchParams`.
- Top cuadras desde `parking_sessions` con join `cuadras_habilitadas!inner(nombre_display)` — no desde `metricas_diarias` (que no tiene cuadra_id). Costo extra de una query pero data correcta.
- Permisionarios activos: en rango muestra los con actividad en el período; fallback a `count` global (estado activo) si no hay sesiones.
- Delta en KPIs: si no hay datos del período anterior, se omite la comparativa con gracia (no muestra flecha).
**Notas de columnas:** metricas_diarias tiene `recaudacion_digital` y `recaudacion_efectivo` (no usadas aún para el chart, están disponibles para mejoras futuras).
**Resultado build/tests:** `pnpm build` limpio. `pnpm test:run` 32/32 verdes.
**Commit:** `37d4337` — push a master OK.

### [2026-05-29] - Sesión Plan 13: flujo permisionario-céntrico
**Objetivo:** Dar al permisionario la capacidad de operar cobro digital (QR) y validar patente vigente para no cobrar dos veces.
**Hecho:**
- `src/lib/sesiones/patente-vigente.ts`: helper `buscarSesionVigente(patente)` compartido — busca sesión `active` y `cubierta_hasta > now`, devuelve `minutos_restantes`.
- `src/app/(permi)/permi/nueva/actions.ts`: `registrarEfectivo` reescrito — nuevo campo `medio` (`efectivo`|`digital`), devuelve AMBOS montos en modo `calcular`, detecta patente vigente (nuevo modo `vigente` en vez del viejo error), crea sesión `extended_pending` para cobro digital.
- `src/app/(permi)/permi/nueva/NuevaSesionForm.tsx`: reescrito con 4 pasos: datos → vigente (con botón extender) | elegir-medio (selector Efectivo/Digital con precios y 20% off badge) → éxito/redirect a QR.
- `src/app/(permi)/permi/cobro/[sid]/page.tsx` + `CobroQRClient.tsx`: pantalla con QR (`qrcode.react`) + suscripción realtime a `parking_sessions` id=eq.{sid}; cuando `status='active'` muestra confirmación. Botón cancelar marca `rejected`.
- `src/app/(publico)/pagar/sesion/[sid]/page.tsx`: ruta pública de pago de sesión existente — valida status (active/rejected/vencida), muestra datos + monto con descuento, renderiza Brick.
- `src/app/(publico)/pagar/sesion/[sid]/PagoSesionBrick.tsx` + `actions.ts` (`pagarSesion`): copia de PaymentBrickWrapper ajustada para sesión existente. Action crea payment MP con `metadata.parking_session_id`.
- `src/app/(publico)/pagar/[qrcode]/actions.ts`: `validarYCalcular` usa `buscarSesionVigente` con mensaje claro en voseo y minutos restantes.
- `src/app/(permi)/permi/page.tsx`: sección nueva "Esperando pago" con sesiones `extended_pending` + `digital_mp` (badge ámbar via QrCode).
- `src/app/(permi)/permi/SesionItem.tsx`: badge diferenciado para `extended_pending` con `digital_mp` = "Esperando pago".
- `pnpm add qrcode.react` → v4.2.0.
**Decisiones:**
- `extended_pending` reusado tal cual (ya existía en el flujo conductor). No se agregó estado nuevo.
- `buscarSesionVigente` usa `createServiceClient` (bypass RLS) para que funcione tanto en server actions autenticadas como en rutas públicas.
- El webhook ya busca por `mp_payment_id` — cuando `pagarSesion` actualiza la sesión con el ID, el webhook posterior la encontrará bien. La metadata `parking_session_id` queda como refuerzo pero no es el path primario.
- TypeScript: el discriminated union de `pagarSesion` requería cast explícito en el Brick client por limitación del inferencer.
**Resultado build/tests:** `pnpm build` limpio. `pnpm test:run` 32/32 verdes. Ningún test ajustado (el viejo mensaje de patente activa no estaba en tests de vitest).
**Commit:** `c43dd22` — push a master OK.
**Próximos pasos (pendientes para el orquestador):**
- Realtime del QR: la suscripción usa `postgres_changes` con `filter: id=eq.{sid}`. Requiere que Supabase tenga realtime habilitado para la tabla `parking_sessions` (ya lo estaba para el dashboard permi, así que debería funcionar).
- Webhook con `metadata.parking_session_id`: el webhook actual busca por `mp_payment_id` (path feliz). Si por alguna razón el pago llega antes de que `pagarSesion` actualice `mp_payment_id`, el webhook no encontrará la sesión. Pendiente: agregar fallback por `metadata.parking_session_id` en el webhook.
- `/permi/extender/[sid]`: ya existe y funciona. El botón "Extender estadía" del step `vigente` apunta ahí correctamente.

## Tareas Activas
- [x] SMOKE TEST — HECHO y exitoso (Playwright en prod, 28/05 noche). Pago sandbox APRO → approved (Payment ID 1327288274). MP envió la notificación al webhook → registrada en webhook_events con firma HMAC válida (sin warning de firma inválida en logs). Motor de reglas verificado: bloqueó cobro nocturno en cuadra diurna. Screenshots en screenshots/smoke-test-prod/.
- [x] Plan 10: Deploy a Vercel — HECHO. App live en https://cuadra-sem.vercel.app, env vars + webhook MP configurados.
- [ ] (Recomendado para prod real) Activar STRICT_WEBHOOK=true: ya se confirmó en logs que la firma HMAC de MP valida correctamente, así que se puede endurecer sin riesgo.
- [ ] EL DÍA DE LA DEMO: `pnpm seed:hoy` para refrescar actividad del día (idealmente de día por el tema timezone UTC).
- [ ] EL DÍA DE LA DEMO: correr `pnpm seed:hoy` para refrescar la actividad del día (KPIs, dashboard permisionario, sesiones activas). El seed completo genera datos relativos a su día de corrida, así que "hoy" queda viejo al día siguiente. Idealmente correrlo de día (ver nota timezone).
- [ ] DEUDA TÉCNICA timezone: el dashboard (admin y permisionario) calcula "hoy" con `new Date().toISOString()` = día UTC, no día Salta. De día no afecta; de noche (>21 Salta = 00 UTC) el "día" rota. Para producción real, hacer los queries de "hoy" timezone-aware (America/Argentina/Salta).
- [ ] Tests por horario: el cálculo $560 (conductor) y el registro de cobro (permisionario) hacen skip automático fuera de 07:00-21:00 Salta. Correr en horario laboral para verlos verdes.

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

### [2026-05-29] - Sesión suite de tests canónica (Plan 11)
**Objetivo:** Instalar Playwright, escribir tests E2E del conductor y permisionario, tests de integración del webhook MP, confirmar 27 unit verdes.
**Hecho:**
- Instalado `@playwright/test@1.60.0` + chromium via `pnpm exec playwright install chromium`.
- Creado `playwright.config.ts`: testDir `tests/e2e`, workers 1, reporter list, baseURL localhost:3000, locale es-AR, timezone Salta, webServer `pnpm dev`, proyectos `mobile-chrome` (Pixel 7) y `desktop-chrome`. GlobalSetup en `tests/setup/global-setup.ts`.
- Creado `tests/setup/global-setup.ts`: crea idempotente el usuario de auth de test (`20184567@cuadra.local` / `test123`), lo vincula al permisionario CUADRA-001, y garantiza asignación del día en curso.
- Creado `tests/setup/seed-test-user.ts`: script standalone para crear el usuario de test.
- Creado `tests/setup/ensure-test-assignment.ts`: script para crear asignación diaria del permisionario de test.
- Creado `src/app/api/webhooks/mp/route.ts`: el route del webhook NO EXISTÍA (directorio mp vacío). Implementado con manejo correcto de body no-JSON (400), eventos no-payment (200 skipped), y actualización de sesión.
- Creado `tests/integration/webhook-mp.test.ts`: 5 tests de integración del webhook, todos verdes.
- Creado `tests/e2e/flow-conductor.spec.ts`: 10 tests E2E del conductor, 9 verdes + 1 skip condicional por horario.
- Creado `tests/e2e/flow-permisionario.spec.ts`: 4 tests E2E marcados skip por bug de routing (ver Tareas Activas).
- Creado `tests/CHECKLIST-MANUAL.md`: checklist de pruebas manuales.
- Actualizado `vitest.config.ts`: excluir `tests/e2e/**` (archivos Playwright no son specs de Vitest).
- Actualizado `package.json`: scripts `playwright` y `playwright:ui`.
- Actualizado `.gitignore`: agregar `.playwright/`.
**Decisiones:**
- Los tests E2E del conductor que dependen de cobro (motor de reglas) usan skip condicional al detectar bloqueo por horario, en lugar de fallar. Honestidad sobre la franja horaria.
- Los tests E2E del permisionario se marcaron con `test.skip` estático porque el bug de routing es bloqueante y no corresponde a este plan resolverlo.
- El globalSetup de Playwright garantiza datos del día (asignación diaria) para que los tests del conductor sean reproducibles en cualquier día.
**Problemas encontrados:**
- `src/app/api/webhooks/mp/route.ts` no existía — el directorio `mp/` estaba vacío. Implementado de cero.
- Vitest levantaba los spec files de Playwright (`.spec.ts`) porque no estaban excluidos. Resuelto con `exclude: ['**/tests/e2e/**']` en vitest.config.ts.
- Los selectors del plan original tenían discrepancias con el código real: `getByText('Auto')` falla por strict mode (2 elementos). Corregido a `getByRole('button', {name: 'Auto'})`.
- `getByRole('alert')` falla por strict mode: Next.js inyecta un `div[role=alert]` extra como route announcer. Corregido con `.filter({hasText: ...})`.
- La URL del login es `/login` (no `/permi/login`). Pero `/login` está dentro del grupo `(permi)` con layout que redirige a `/login` → redirect loop.
- Los tests del conductor fallaban en días sin asignación (fecha cambió a las 00:00). Resuelto con globalSetup que crea la asignación idempotentemente al inicio de cada corrida.
**Resultado:**
- `pnpm test:run`: **32/32 verdes** (27 unit motor-reglas + 5 integration webhook).
- `pnpm playwright`: **18/28 verdes, 10 skip** (4 E2E permisionario × 2 proyectos: bug routing; 1 cálculo $560 × 2 proyectos: fuera de horario).
- 0 tests fallando.
**Próximos pasos:**
- Resolver bug de routing `/login` (ver Tareas Activas).
- Activar los 8 tests skip de permisionario una vez resuelto el bug.

### [2026-05-28] - Sesión orquestación cascada (Planes 07, 08 + fix routing)
**Objetivo:** Ejecutar la cadena pendiente de planes vía Opus-orquesta-Sonnet (07 PWA Permisionario → 08 Dashboard Muni → 11 tests), revisando cada resultado.
**Hecho:**
- Plan 07 (PWA Permisionario) ejecutado por Sonnet: 16 archivos, build limpio. Commit `b6fee51`.
- Plan 08 (Dashboard Admin Muni) ejecutado por Sonnet: 22 archivos, recharts, build limpio. Commit `2e418d1`.
- Plan 11 (tests) ejecutado por Sonnet: ver sesión anterior. Commit `9faa04e`.
- Fix del bug de redirect loop `/login` (commit `4643f0c`): `git mv` de `(permi)/login` a `(publico)/login`; activados los 4 E2E del permisionario que estaban en skip; corregidos selectors ambiguos (`getByLabel('Contraseña', {exact})`, `getByRole('link', 'Registrar cobro')`, `button '1 h' exact`).
**Decisiones:**
- El fix de routing lo hizo el orquestador directamente (no se delegó a Sonnet): cambio acotado y verificable en el momento, con el usuario presente.
- Guardrails impuestos a cada Sonnet sobre el plan literal: push a `master` (los planes decían `main`), gestor real por lockfile (pnpm, no npm), DS Cuadra manda sobre el JSX genérico, esquema real manda sobre nombres asumidos, honestidad estricta de tests (no marcar verde lo no verificado).
**Problemas encontrados:**
- Los planes literales decían `git push origin main` pero el repo usa `master`. Corregido en cada delegación.
- El webhook MP (`/api/webhooks/mp/route.ts`) no existía pese a figurar el plan 05 como hecho; lo creó el Sonnet del plan 11 en versión minimal. PENDIENTE reconciliar con la versión HMAC del plan 10.
**Próximos pasos:**
- Plan 10 (Deploy Vercel) con el usuario presente. Ver Tareas Activas.

### [2026-05-28] - Sesión preparación pre-deploy (orquestador)
**Objetivo:** Dejar listos los pendientes que no requieren al usuario, antes del deploy del plan 10.
**Hecho:**
- Webhook MP reconciliado (`src/app/api/webhooks/mp/route.ts`): se mantuvieron los shapes que cubren los 5 tests de integración y se agregó encima: validación de firma HMAC-SHA256 (con `timingSafeEqual`, modo estricto vía `STRICT_WEBHOOK`), auditoría en `webhook_events` (best-effort), consulta del status real del pago a la API de MP (import dinámico de `@/lib/mp/server`), y `runtime = 'nodejs'`. Mock del test actualizado para incluir `insert`.
- Script `scripts/seed-hoy.ts` + alias `pnpm seed:hoy`: refresca idempotente la actividad del día (borra sesiones de hoy, asignaciones upsert, ~30-80 sesiones/permi, recalcula métricas). Usa día UTC + horas UTC 10-21 (= 07-18 Salta) para coincidir con el criterio "hoy" del dashboard.
- Script `scripts/check-metricas.ts`: diagnóstico del estado de `metricas_diarias`/`parking_sessions` por fecha.
- Verificado: `metricas_diarias` ahora tiene datos de hoy (2026-05-29 UTC). Antes llegaba solo al 28.
**Decisiones:**
- No re-correr el seed completo (es aditivo, duplicaría las ~14k sesiones históricas). En su lugar, script acotado al día.
- Manifest PWA + icons ya existían (plan 06); no se regeneraron.
- Descubierta deuda técnica de timezone (dashboard razona en UTC). No se refactorizó ahora (scope/riesgo); documentada en Tareas Activas. De día no afecta la demo.
**Problemas encontrados:**
- Primera versión de seed-hoy usó `setHours` local → generó "28" mientras el dashboard lee "29" (UTC). Corregido a criterio UTC explícito (`Date.UTC`). La corrida fallida dejó el día 28 con sesiones regeneradas pero coherentes (métricas recalculadas); aceptable para datos de demo.
**Próximos pasos:**
- Plan 10 (Deploy Vercel) con el usuario.

### [2026-05-28] - Sesión deploy a producción (Plan 10)
**Objetivo:** Deployar Cuadra a Vercel con el usuario presente (login, env vars, webhook MP).
**Hecho:**
- `vercel link` al proyecto `cuadra-sem` (cuenta ivillanueva770), conectado al repo GitHub.
- `vercel.json` (framework nextjs, región gru1, build/install con pnpm).
- 10 env vars de producción seteadas vía CLI (escribiendo el valor sin newline para evitar `\r` de Windows en los secrets).
- Deploy a producción. App live en https://cuadra-sem.vercel.app, sin protección SSO (pública).
- Webhook MP configurado en el panel de MP (evento payment) con su Secret Signature → `MP_WEBHOOK_SECRET`.
- Smoke test del webhook: POST de prueba → 200 + fila auditada en `webhook_events`.
**Decisiones:**
- Bump Next 15.2.3 → 15.5.18: Vercel rechaza el deploy de 15.2.3 por CVE-2025-66478. Se subió a la última 15.x (no a 16, para evitar breaking). Build + 32 tests verdes tras el bump.
- Webhook en modo permisivo (sin STRICT_WEBHOOK): valida la firma y loguea, pero no rechaza, para no perder notificaciones si el formato del manifest HMAC difiere. Endurecer luego de verificar en logs.
- APP_URL y NEXT_PUBLIC_APP_URL apuntan a cuadra-sem.vercel.app (el código usa ambos nombres en distintos lugares).
**Problemas encontrados:**
- `pnpm add next@15` no actualizaba (15.2.3 satisface el rango); hubo que pinear 15.5.18 explícito tras consultar el registry.
**Próximos pasos:**
- Smoke test de pago sandbox end-to-end (ver Tareas Activas).
- El día de la demo: `pnpm seed:hoy`.

### [2026-05-28] - Sesión smoke test E2E en producción (Playwright)
**Objetivo:** Validar el flujo de pago completo en prod con navegador real.
**Hecho:**
- Flujo conductor /pagar/CUADRA-001: UI renderiza con datos reales (Gorriti 100, María Cristina Aramayo). Validación de patente OK (rechazó formato inválido). Motor de reglas OK: bloqueó con "Esta cuadra no está habilitada para cobro nocturno" (era ~22h Salta, cuadra diurna).
- Pago sandbox en /mp-test: Payment Brick renderiza en prod, tokeniza la tarjeta. Primer intento falló por payer.email inválido (usé `.local`, MP exige TLD válido — error de dato de prueba, no de código). Segundo intento con email válido → **approved, Payment ID 1327288274**.
- Webhook: MP envió la notificación firmada → POST /api/webhooks/mp 200 sin warning de firma → HMAC validó. Registrado en webhook_events (event_type=payment, payment_id=1327288274).
- Screenshots en screenshots/smoke-test-prod/.
**Decisiones:**
- Smoke del pago vía /mp-test (no /pagar) porque a la hora del test el motor bloqueaba el flujo real por horario nocturno. /mp-test no pasa por el motor, valida MP+Brick+webhook puro.
**Problemas encontrados:**
- /mp-test serializa el error de MP como "[object Object]" (su catch hace String(error) y el SDK de MP lanza objetos planos, no Error). Mejora menor pendiente si se quiere, pero /mp-test es página de validación temprana. El error real se obtuvo de los runtime logs de Vercel.
**Próximos pasos:**
- Activar STRICT_WEBHOOK si se quiere endurecer (la firma ya valida).
- El día de la demo: pnpm seed:hoy.

### [2026-05-28] - Sesión capa de demo + pitch
**Objetivo:** Hacer la app navegable para el pitch (cualquiera ve las 3 experiencias) + animación de apertura + material de pitch.
**Hecho:**
- `SplashScreen` (src/components/cuadra/) montado en layout: recrea la intro del auto que estaciona con motion. 1x por sesión (sessionStorage), respeta prefers-reduced-motion, re-disparable vía evento `cuadra:replay-splash`.
- `DemoNav` (src/components/demo/) FAB flotante DEMO ONLY: salta a Conductor/Permisionario/Muni con credenciales visibles + "Ver intro de nuevo".
- Botón "Autocompletar datos de demo" en login permisionario y admin.
- Usuario admin de demo creado (`scripts/seed-admin-demo.ts`, `pnpm seed:admin`).
- Fix KPI admin "Permisionarios activos" (0 → 14): el count va en `count`, no en `data`.
- Pulido de errores de `/mp-test` (mostraba "[object Object]").
- `docs/PITCH.md`: guion de pitch, diferenciales para el jurado, guion de demo en vivo.
- Verificado en prod con Playwright: splash en DOM OK, FAB navega, login admin de demo entra al dashboard con datos. Smoke test de pago end-to-end (sesión previa): approved + webhook con HMAC.
**Decisiones:**
- DemoNav y credenciales de demo aislados/etiquetados DEMO ONLY para quitar fácil en producción real.
- Splash es parte del producto (no demo-only): vive en el layout como SplashScreen.
**Próximos pasos:**
- Logo: centrar el auto (lo hace el usuario en el design system).
- Grabar video de pitch (ver docs/PITCH.md). Correr `pnpm seed:hoy` antes.
