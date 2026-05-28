# UI Kit — PWA Conductor

Interfaz pública para cualquier ciudadano que estaciona. **Sin login**: se identifica el auto por patente vía el QR del permisionario. **Mobile-first absoluto.**

## Flujo
Escanear QR → ingresar patente + tipo de vehículo + tiempo (+ email opcional) → pagar (Mercado Pago o efectivo) → comprobante con QR de verificación.

## Archivos
- `index.html` — demo interactiva (máquina de estados del flujo completo) dentro de un frame de teléfono.
- `primitives.jsx` — `Icon`, `Button`, `Field`, `Badge`, `Banner`, `TopBar`, `BottomNav` (compartidos con los otros kits).
- `screens.jsx` — `ScanScreen`, `ScannerScreen`, `PatenteScreen` (con `VehicleSelect` + `TimeStepper`), `PagoScreen`, `ComprobanteScreen`.

## Notas de diseño
- Botones de 52px y selectores +/- de 56px (tap targets ≥ 48px).
- Tipo de vehículo como tarjetas con ícono + texto, no radio buttons.
- Copy en voseo: "Pagá tu estacionamiento", "Listo, ya estás cubierto".
- Top bar institucional: logo Cuadra + marca Muni discreta a la derecha.
- "Pagar con Mercado Pago" es la única marca de proveedor permitida.
