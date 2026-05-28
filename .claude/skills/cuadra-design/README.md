# Cuadra — Design System

**Cuadra** es la aplicación web institucional propuesta para digitalizar el **Sistema de Estacionamiento Medido (SEM)** de la **Municipalidad de la Ciudad de Salta, Argentina** — el cobro del estacionamiento en las cuadras del microcentro.

> *"Cuadra. El estacionamiento medido de Salta, simple y digital."*

"Cuadra" significa, en argentino, *manzana de calles*. Es un nombre directo, descriptivo y local. **Cuadra es la marca primaria** del producto; la **Municipalidad de Salta** aparece como endorsement institucional claro pero discreto ("Una iniciativa de la Municipalidad de la Ciudad de Salta").

---

## Productos / superficies

El producto tiene **tres interfaces** distintas, todas con la misma UI accesible (no hay "modo accesible" separado):

| # | Superficie | Quién la usa | Plataforma | Acceso |
|---|------------|--------------|------------|--------|
| 1 | **PWA Conductor** | Cualquier ciudadano que estaciona | Mobile-first | Sin login (QR + patente) |
| 2 | **PWA Permisionario** | Personas que cobran en su cuadra — **adultos mayores jubilados y personas con discapacidad** | Mobile-first, **accesibilidad alta** | Login con DNI |
| 3 | **Panel Admin Muni** | Funcionarios de Coordinación de Modernización | Desktop-first (usable en mobile) | Login institucional |

Cada superficie tiene su UI kit en `ui_kits/`.

---

## Fuentes y materiales recibidos

- **Especificación textual completa** del producto, marca, paleta, tipografía, componentes y reglas de accesibilidad (provista por el equipo de Cuadra).
- **Color oficial confirmado**: `#145FB0` — el azul exacto del logo de la Municipalidad de Salta (un corazón / "abrazo" estilizado).
- **Assets oficiales NO recibidos.** Se referenciaron en `vault/branding-sem/assets/` (`logo-muni-salta-principal.png`, `escudo-muni-salta.png`) pero no se subieron a este proyecto. Ver **Caveats** abajo.
- No se entregó codebase, Figma ni decks. El sistema visual se construyó desde la especificación textual + el color oficial.

---

## Content Fundamentals — voz y copy

La voz de Cuadra es **cercana, honesta e institucional pero amigable**. Nunca corporativa, fría ni burocrática. Español argentino claro y directo (es-AR).

**Reglas:**
- **Voseo y tono de "vos", no "usted".** "Pagá tu estacionamiento", no "Realice el pago de su estacionamiento".
- **Imperativo amigable en acciones primarias:** "Pagar", "Confirmar", "Volver", "Liberé la cuadra".
- **Confirmaciones conversacionales y concretas**, con el dato útil incluido: "Listo, tu sesión está activa hasta las 14:30" — no "Operación exitosa".
- **Errores útiles, nunca códigos crípticos.** Explican qué pasó y qué hacer:
  > *"Ups, la cuadra está fuera de horario diurno hoy. El próximo turno habilitado es a las 22:00 en zonas nocturnas (Balcarce, Güemes, Plaza Alvarado)."*
  > *"No podés iniciar sesión ahora — el turno termina en 8 minutos."*
- **Recordatorios humanos:** "Acordate de tu DNI físico", no "Recuerde portar su documento".
- **Sin jerga ni inglés en UI visible.** Nada de "Get started", "Sign up", "Dashboard" como etiqueta. (En código, sí.)
- **Sin marcas registradas tech.** Excepción: "Pagar con Mercado Pago" en botones de pago.
- **Casing:** títulos y botones en *Sentence case* ("Registrar cobro"), no Title Case ni MAYÚSCULAS. Solo overlines/etiquetas de metadato usan MAYÚSCULAS espaciadas (eco del "MUNICIPALIDAD" del logo).
- **Emoji:** no se usan en UI general. Permitidos solo como refuerzo puntual de íconos de estado de éxito/error, siempre acompañados de texto.
- **Estados siempre con ícono + etiqueta de texto.** Nunca color solo.

---

## Visual Foundations

**Vibe general:** institucional argentino actualizado — en la línea de *Mi Argentina* pero más cálido y con identidad propia. Plano, limpio, mucho aire blanco. Confiable, no decorativo.

- **Color:** primario azul institucional Muni `#145FB0` (escala 50→900 derivada). Acento dorado salteño `#D97706` (evoca montaña y tierra) para destacados, badges y CTA cálidos. Neutros gris carbón (`#1F2937` texto, `#4B5563` secundario). Fondos: blanco `#FFFFFF`, off-white `#FAFAF9` (app), gris muy claro `#F3F4F6` (secciones). Estados semánticos con par color+fondo claro. **Sin gradientes llamativos.** Como mucho, un wash plano de color.
- **Tipografía:** **DM Sans** (Google Fonts) en todo — geométrica, moderna, muy legible, hace eco del wordmark geométrico "Salta" del logo Muni. Monoespaciada **DM Mono** para patentes, montos, números de comprobante. **Body 18px** por accesibilidad (más grande de lo habitual). Line-height ≥ 1.5 en todo body. Jerarquía clara con respiración.
- **Espaciado:** sistema de 4px (4·8·12·16·24·32·48·64). Padding de cards: 16px mobile / 24px desktop. Generoso, nunca apretado.
- **Backgrounds:** planos. Off-white para el lienzo de app; blanco para superficies/cards; gris claro para secciones alternas. **Sin imágenes de fondo, sin texturas, sin stock photos.** Si hace falta imagen, son ilustraciones planas o íconos.
- **Bordes:** sutiles, 1px `#E5E7EB`. Los bordes definen las cards tanto como (o más que) la sombra.
- **Sombras:** máximo **2 niveles**, suaves. `--shadow-1` para cards en reposo, `--shadow-2` para elementos elevados (modales, menús, toasts). Nunca sombras de marketing.
- **Corner radius:** 6px chips/badges · 10px inputs/botones · 16px cards/modales · pill (9999px) para botones redondeados y toggles. Consistencia por familia de componente.
- **Cards:** fondo blanco, borde 1px sutil + `--shadow-1`, radius 16px, padding 16/24px. Limpias, sin acentos de borde-izquierdo de color (anti-patrón a evitar).
- **Animación:** mínima y funcional. Easing `cubic-bezier(0.4,0,0.2,1)`, 120–200ms. Fades y desplazamientos cortos; **sin bounces ni microinteracciones decorativas**. **Respeta `prefers-reduced-motion`** (se anula casi toda transición).
- **Hover:** oscurecer el color (primary → `--blue-600`); en superficies, fondo `--gray-50`. **Press/active:** color aún más oscuro (`--blue-700`); sin "shrink" exagerado.
- **Focus:** **siempre visible** — outline 2px azul con offset 2px en todo elemento interactivo. Regla de accesibilidad innegociable.
- **Tap targets:** mínimo **48×48px** (más generoso que el estándar 44).
- **Transparencia/blur:** uso mínimo. Solo scrim de modales (negro ~40%). Sin glassmorphism ni neumorfismo.
- **Layout:** top bar institucional fija (logo Cuadra + ícono Muni discreto a la derecha). En PWAs, bottom navigation fija (3–5 ítems, ícono + texto). En Admin, sidebar de navegación + filtros.

---

## Iconography

- **Sistema de íconos:** **Lucide** (https://lucide.dev) — trazo lineal de 2px, esquinas redondeadas, estilo limpio y neutral que combina con DM Sans y el tono institucional. Cargado vía CDN (`lucide@latest`). *Sustitución/elección nuestra: no había un set definido en la especificación; Lucide es el match más cercano al estilo plano y accesible buscado — confirmar o reemplazar.*
- **Stroke width:** 2px (default Lucide). Tamaños: 20px inline, 24px en botones/nav, 28–32px en estados grandes/empty states.
- **Regla de accesibilidad:** **los íconos SIEMPRE llevan etiqueta de texto visible** en navegación y acciones. Nunca se asume que el usuario reconoce el ícono solo. Íconos decorativos llevan `aria-hidden="true"`.
- **Emoji:** no como sistema iconográfico. Solo refuerzo puntual en estados de éxito/error, junto a texto.
- **Logos / marca:** SVG para Cuadra — `assets/cuadra-symbol.svg` (mark), `cuadra-logo-color.svg` / `-light.svg` / `-mono.svg` (lockups). PWA icons en PNG 192/512 (`cuadra-icon-192.png`, `-512.png`). **Logo oficial Muni (recibido):** `muni-salta-principal.png` (azul) y `muni-salta-blanco.png` (blanco, para fondos oscuros), más `muni-salta-heart.png` / `-blanco.png` (solo el corazón, recortado para top bars compactos).
- **QR:** componente central del producto (credencial del permisionario, comprobante). Se renderiza como imagen/lib QR real en producción; en los UI kits se usa un placeholder de patrón QR.

---

## Caveats (importante — necesito tu ayuda)

1. **Logos oficiales de la Muni:** ✅ recibidos e integrados (`muni-salta-principal.png` / `muni-salta-blanco.png`). El corazón se usa solo en top bars; el lockup completo en el header del Admin y en la card de marca.
2. **Wordmark Cuadra:** ✅ logo definitivo aprobado — un **cartel azul de estacionamiento con un auto minimalista «estacionado»**, estilo señalización urbana. Assets: `cuadra-symbol.svg` (mark), `cuadra-logo-color/light/mono.svg` (lockups), íconos PWA 192/512. La animación de apertura (`logo-explorations/splash.html`) dibuja el cartel y estaciona el auto.
3. **Tipografía:** elegí **DM Sans** (una de tus dos opciones). Si preferís Inter, lo cambio en un token.
4. **Set de íconos (Lucide):** elección nuestra a falta de uno definido. Confirmá o decime cuál preferís.

---

## Index — qué hay en este proyecto

| Archivo / carpeta | Qué es |
|---|---|
| `README.md` | Este documento — contexto, voz, foundations, iconografía, índice. |
| `colors_and_type.css` | Design tokens: CSS variables de color, tipografía, espaciado, radius, sombras, motion + clases semánticas. |
| `SKILL.md` | Manifiesto para usar este sistema como Agent Skill. |
| `assets/` | Logos Cuadra (SVG color/light/mono + symbol), PWA icons (PNG 192/512), endorsement Muni (placeholder). |
| `preview/` | Tarjetas del Design System tab (color, tipografía, espaciado, componentes). |
| `ui_kits/conductor/` | UI kit PWA Conductor (QR → patente → pago → comprobante). |
| `ui_kits/permisionario/` | UI kit PWA Permisionario (sesiones activas, registrar cobro). |
| `ui_kits/admin/` | UI kit Panel Admin Muni (métricas, ranking, filtros, mapa). |

Cada UI kit tiene su propio `README.md`, `index.html` (demo interactiva) y componentes `.jsx`.
