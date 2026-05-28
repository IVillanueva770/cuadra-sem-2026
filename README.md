# Cuadra

> Sistema de Estacionamiento Medido (SEM) digital para la Municipalidad de la Ciudad de Salta.

Hackathon **PunaTech 2026** · Track de la Ciudad · 28-30 mayo 2026

🔗 **Live**: https://cuadra-sem-2026.vercel.app *(deploy pendiente)*

## Equipo

- **Ignacio Villanueva** — [@IVillanueva770](https://github.com/IVillanueva770) — Lead técnico, full-stack
- **Sofía** — Investigación, UX, pitch *(GitHub a definir)*

## Qué hace

Cuadra digitaliza el cobro del estacionamiento medido en las cuadras del microcentro de Salta. Implementa la **Ordenanza N° 12.170** con:

- 💳 Pago digital con **Mercado Pago Payment Brick**: tarjeta de crédito/débito, transferencia, cuenta MP, Rapipago, Pago Fácil.
- 💵 Pago en efectivo con **registro digital obligatorio** (conciliación al cierre del turno).
- 🤖 **Motor de reglas automático**: tarifas, fraccionamiento 15 min post-2da hora, descuento 20% pago digital, zonificación nocturna, tolerancia 5 min.
- 🚫 **Bloqueo automático de cobros indebidos** (fuera de horario, feriados, zonas no habilitadas).
- ♿ **PWA accesible** para conductores y permisionarios (adultos mayores), WCAG AA.
- 📊 **Dashboard Modernización Muni** con métricas en tiempo real.
- 🔄 **Movilidad entre cuadras** por patente (el "papelito" digital).

## Stack

- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Server Actions Next.js + Supabase Postgres + Supabase Auth + Realtime
- **Pagos**: Mercado Pago Payment Brick + SDK Node + webhooks (cuenta única Muni)
- **Email**: Resend
- **Deploy**: Vercel + Supabase Cloud
- **Tipografía**: DM Sans + DM Mono (Google Fonts)
- **Íconos**: Lucide
- **Idioma**: Español argentino (es-AR), zona horaria America/Argentina/Salta

## Herramientas de IA usadas

- **Claude Code** (Opus 4.7 + Sonnet 4.6) — diseño de arquitectura, generación de código, motor de reglas, planificación.
- **Claude Design** — generación del design system completo (`.claude/skills/cuadra-design/`) con tokens, paleta, tipografía, 3 UI Kits, logos.
- **Mercado Pago SDK** — patrón de integración basado en el repo oficial [@goncy/next-mercadopago](https://github.com/goncy/next-mercadopago).

## Boilerplate base declarado

- `pnpm create next-app@15.2.3 . --typescript --tailwind --eslint --app --src-dir --turbopack --use-pnpm`
- Componentes shadcn manuales (Button, Card, Input, Label, Badge) con tokens de Cuadra del DS.

Toda la lógica del proyecto (motor de reglas, integración MP, 3 PWAs, dashboard, schemas Supabase, design system aplicado) fue desarrollada durante el evento **28-30 mayo 2026**.

## Setup local

```bash
git clone https://github.com/IVillanueva770/cuadra-sem-2026.git
cd cuadra-sem-2026
pnpm install
cp .env.example .env.local
# Completar variables (Supabase URL + keys; MP test credentials)
pnpm dev
```

## Licencia

MIT.
