# CHECKLIST DE PRUEBAS MANUALES — Cuadra

> Pruebas que no se pueden automatizar completamente (pago real MP, verificación
> de movilidad en campo) o que complementan los tests E2E para demos y validación
> pre-deploy.

---

## Flujo Conductor

### QR válido → Pago digital (MercadoPago)

- [ ] Escanear QR físico de un permisionario activo.
- [ ] Verificar que la página muestra el nombre correcto del permisionario y cuadra.
- [ ] Ingresar patente válida (formato ABC123 o AB123CD).
- [ ] Seleccionar tipo de vehículo: Auto.
- [ ] Seleccionar duración 1 h.
- [ ] Hacer click en "Continuar al pago".
- [ ] Verificar que el monto mostrado es $560 (descuento 20% en digital).
- [ ] Completar el pago con tarjeta de crédito de prueba MP (4009 1753 3280 6176, vto 11/25, CVV 123).
- [ ] Verificar redirección a pantalla de éxito con patente y duración.
- [ ] Verificar que aparece la sesión como activa en `/verificar/[patente]`.

### QR válido → Moto

- [ ] Repetir el flujo anterior con tipo = Moto.
- [ ] Verificar monto = $240 (1h moto digital).

### Horario fuera de servicio

- [ ] Intentar acceder a `/pagar/[qr]` un domingo después de las 21:00 (o un feriado).
- [ ] Verificar que aparece mensaje de error "Fuera de horario".

### QR inválido

- [ ] Acceder a `/pagar/QR-INVALIDO-XYZ`.
- [ ] Verificar página 404 de Next.js.

### Patente inválida

- [ ] Ingresar "INVALIDA" en el campo patente.
- [ ] Verificar que el error de formato aparece sin llegar al paso de pago.

### Verificación de movilidad

- [ ] Acceder a `/verificar/[patente]` con una patente que tenga sesión activa.
- [ ] Verificar que muestra "Sesión activa", horario de cobertura, cuadra y nombre del permisionario.
- [ ] Acceder con una patente sin sesión activa.
- [ ] Verificar que muestra "Sin sesión activa".

---

## Flujo Permisionario

> Prerequisito: bug de routing resuelto (ver `tests/e2e/flow-permisionario.spec.ts`).

### Login

- [ ] Acceder a `/login`.
- [ ] Ingresar DNI y contraseña válidos.
- [ ] Verificar redirección al dashboard `/permi`.

### Login fallido

- [ ] Ingresar DNI incorrecto.
- [ ] Verificar mensaje de error "DNI o contraseña incorrectos".

### Dashboard

- [ ] Verificar que muestra: Activas, Total hoy, Recaudado.
- [ ] Si hay efectivo en el día: verificar card "Efectivo a rendir a la Muni" con 20%.

### Registrar cobro efectivo

- [ ] Ir a "Registrar cobro".
- [ ] Ingresar patente válida.
- [ ] Seleccionar tipo de vehículo y duración.
- [ ] Click en "Ver monto y confirmar".
- [ ] Verificar que el monto calculado es correcto (auto 1h = $700 en efectivo).
- [ ] Confirmar el cobro.
- [ ] Verificar pantalla de éxito con patente y monto.
- [ ] Verificar que la sesión aparece en el dashboard como activa.

### Cierre del día (conciliación)

- [ ] Acceder a `/permi/conciliar`.
- [ ] Verificar total de sesiones, total recaudado, efectivo a rendir.
- [ ] Confirmar cierre del día.

---

## Flujo Admin

### Login admin

- [ ] Acceder a `/admin/login`.
- [ ] Ingresar credenciales de admin.
- [ ] Verificar redirección al dashboard admin `/admin`.

### Dashboard admin

- [ ] Verificar métricas del día: total sesiones, recaudado, promedio.
- [ ] Verificar gráfico de sesiones por hora.

### Gestión de permisionarios

- [ ] Listar permisionarios activos.
- [ ] Crear nuevo permisionario con todos los campos.
- [ ] Editar datos de un permisionario existente.

### Asignaciones diarias

- [ ] Verificar que las asignaciones del día son correctas.
- [ ] Verificar el mapa/lista de cuadras asignadas.

---

## Webhook MercadoPago (staging)

- [ ] Simular webhook de pago aprobado desde el panel de MP sandbox.
- [ ] Verificar que la `parking_session` cambia de `extended_pending` a `active`.
- [ ] Simular webhook de pago rechazado.
- [ ] Verificar que la sesión cambia a `rejected`.

---

## Notas de ambiente

- Tests automáticos E2E: `pnpm playwright`
- Tests unitarios + integración: `pnpm test:run`
- Datos de test pre-cargados: `pnpm tsx --env-file=.env.local tests/setup/seed-test-user.ts`
- Verificar asignación del día: `pnpm tsx --env-file=.env.local tests/setup/ensure-test-assignment.ts`
