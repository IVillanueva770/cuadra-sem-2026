# UI Kit — PWA Permisionario

Interfaz para la persona que cobra el estacionamiento en su cuadra asignada — **adultos mayores jubilados y personas con discapacidad**. Login con DNI. **Mobile-first con requisito de accesibilidad alta.**

## Decisiones de accesibilidad
- Tipografía más grande aún (patentes en 26px mono, saldo 38px, body 18–20px).
- Botones de pantalla completa de 52px+; selectores de tiempo de 64px.
- Contraste alto, vocabulario simple ("Autos en tu cuadra", "A cobrar").
- Una sola UI accesible (no hay "modo normal" separado).

## Flujo
Ver sesiones activas en su cuadra + saldo del día → registrar cobro en efectivo → confirmación grande → cobrar extensiones pendientes → mostrar su credencial QR.

## Archivos
- `index.html` — demo con bottom-nav (Mi cuadra · Cobrar · Mi QR).
- `primitives.jsx` — primitivos compartidos (copia del kit Conductor).
- `screens.jsx` — `MiCuadra` (con `SesionCard`), `Cobrar`, `CobroOK`, `Credencial`.
