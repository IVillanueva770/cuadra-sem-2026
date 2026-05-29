# Cuadra — Guía de pitch (PunaTech 2026 · Track Ciudad SEM Salta)

> Borrador estratégico para el video/pitch. Pensado desde la óptica del jurado.
> Ajustá la voz a la tuya antes de grabar.

---

## 1. El pitch en una frase

**Cuadra digitaliza el Estacionamiento Medido de Salta sin dejar a nadie afuera: el conductor paga en 20 segundos desde el celular, el permisionario sigue cobrando en su cuadra pero ahora con una herramienta hecha para él, y la Muni ve todo en tiempo real.**

---

## 2. El problema (30s)

El SEM de Salta hoy depende de **tarjetas físicas, efectivo y confianza**. Eso trae:
- Fricción para el conductor (conseguir tarjeta, monedas, no saber cuánto deber).
- Cero trazabilidad para la Muni (¿cuánto se recauda de verdad? ¿cuánto queda en el camino?).
- Un actor clave que cualquier "app de estacionamiento" genérica **ignora o reemplaza**: el **permisionario** — muchas veces adultos mayores jubilados o personas con discapacidad, para quienes el permiso es un programa social.

Las soluciones existentes (parquímetros, apps importadas) no se diseñaron para esta realidad.

---

## 3. La propuesta (30s)

**Cuadra**, repensada desde cero para el SEM real de Salta. Tres experiencias, una sola app web (PWA), sin instalar nada:

1. **Conductor** — escanea el QR de la cuadra, pone la patente, paga con Mercado Pago. Sin registro, sin cuenta, sin descargar app.
2. **Permisionario** — entra con su DNI, ve sus sesiones del día, cobra en efectivo, marca extensiones, concilia el cierre. Interfaz accesible pensada para él.
3. **Municipalidad (Modernización)** — dashboard en vivo: recaudación, % digital vs efectivo, ranking de permisionarios, auditoría de pagos.

---

## 4. Diferenciales — SÍ o SÍ mostrar/decir

Ordenados por impacto en el jurado:

### ⭐ 1. Funciona de verdad — no es un mockup
El diferencial más fuerte y el que más cuesta a la competencia. **Está deployada en producción, con base de datos real, pago real por Mercado Pago y webhook firmado.** Decilo explícito y mostralo:
- *"Esto que ven no es un prototipo de Figma ni un frontend muerto. Es la app andando. Voy a pagar un estacionamiento en vivo, ahora."*
- Hacé el pago real en cámara (tarjeta de prueba) → mostrá la confirmación → mostrá el dashboard de la Muni actualizándose.

### ⭐ 2. Inclusión del permisionario (ángulo social + humano)
Ninguna app genérica resuelve esto. Cuadra **no reemplaza al permisionario, lo potencia**.
- Login por DNI (no email), botones grandes, texto 18px, todo con ícono + etiqueta, lenguaje claro ("Registrar cobro", no "Dashboard").
- *"Pensamos cada pantalla para una persona de 65 años que cobra en la calle, no para un developer."*

### ⭐ 3. El motor de reglas de la Ordenanza 12.170
No es un cobro genérico: **codificamos la normativa municipal**. Horarios diurnos/nocturnos, zonas habilitadas (Balcarce, Güemes, Plaza Alvarado), tarifas auto/moto, fracciones, feriados, fin de turno.
- Mostralo en vivo: intentá cobrar en una cuadra fuera de horario → la app lo bloquea con un mensaje claro. *"La app conoce la ordenanza."*
- Respaldo técnico: 27 tests automatizados sobre las reglas.

### ⭐ 4. Transparencia y trazabilidad para el Estado
- Toda transacción queda registrada y auditada (incluido el webhook de Mercado Pago, con verificación de firma HMAC).
- Conciliación efectivo/digital y liquidación clara: cuánto va a la Muni, cuánto al permisionario.
- *"Por primera vez la Muni sabe, al minuto, cuánto se recaudó y dónde."*

### ⭐ 5. Cero fricción de adopción
- Conductor: sin app, sin registro. Un QR y listo → adopción masiva posible desde el día 1.
- Es una PWA: se instala como app si querés, anda en cualquier celular, no ocupa la App Store.

---

## 5. Guion de demo en vivo (lo que se ve en pantalla)

Orden sugerido para el video (mostrá las 3 experiencias; usá el botón flotante de demo para saltar):

1. **Apertura** — abrí la app: se ve la animación del auto estacionando (marca + memorable).
2. **Conductor paga** (el momento "wow"): QR → patente → 1h → Mercado Pago → *aprobado*. Mostrá el comprobante.
3. **La ordenanza viva**: intentá cobrar fuera de horario → bloqueo con mensaje claro.
4. **Permisionario**: login por DNI → dashboard con la sesión que acabás de generar → registrar un cobro en efectivo → cierre del día (20% Muni / 80% permisionario).
5. **Muni**: dashboard con KPIs, el chart de recaudación, ranking, y la sesión nueva apareciendo **en vivo**.
6. **Cierre**: *"Una sola app, tres actores, funcionando hoy. Esto es Cuadra."*

> Tip: corré `pnpm seed:hoy` el día de grabar para que el dashboard tenga volumen fresco.

---

## 6. Para los slides (bullets)

- **Problema**: SEM analógico → fricción, sin trazabilidad, excluye al permisionario.
- **Solución**: Cuadra — 3 experiencias, una PWA, sin fricción.
- **Diferencial técnico**: app real en producción (Next.js + Supabase + Mercado Pago), motor de reglas de la Ordenanza, 27 tests.
- **Diferencial social**: diseñada para el permisionario (accesibilidad real).
- **Diferencial de gestión**: transparencia y datos en vivo para la Muni.
- **Estado**: live, funcional, end-to-end probado.

---

## 7. Preguntas que puede hacer el jurado (y respuestas)

- *"¿Esto escala / es real o es demo?"* → Está deployada en Vercel, DB en Supabase, pago real por Mercado Pago (sandbox para la demo, un cambio de credencial para producción). Mostralo.
- *"¿Y el permisionario que no sabe usar el celu?"* → Por eso el login es por DNI, los botones son grandes y el lenguaje es claro. Y la Muni puede onboardearlo. La alternativa (reemplazarlo) tiene costo social; nosotros lo incluimos.
- *"¿Seguridad del pago?"* → Mercado Pago maneja los datos de tarjeta (PCI), nosotros nunca los tocamos; el webhook valida firma HMAC.
- *"¿Qué falta para producción?"* → Cambiar credenciales de sandbox a producción, políticas de seguridad de base más estrictas (RLS), y onboarding de permisionarios reales. La base técnica está.

---

## 8. El cierre que queremos dejar

> *"La mayoría de los equipos les van a mostrar una idea. Nosotros les mostramos un sistema que ya funciona, pensado para la Salta real — la del conductor apurado, la del permisionario jubilado y la de la Muni que necesita transparencia. Cuadra no es una maqueta del futuro: es el SEM de Salta, andando hoy."*
