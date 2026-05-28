---
name: cuadra-design
description: Use this skill to generate well-branded interfaces and assets for Cuadra — the digital metered-parking system (SEM) for the Municipality of Salta, Argentina — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, brand assets, and UI kit components for the three Cuadra surfaces (PWA Conductor, PWA Permisionario, Panel Admin Muni).
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc.), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

Key files:
- `README.md` — product context, voice/copy rules (es-AR voseo), visual foundations, iconography, caveats, index.
- `colors_and_type.css` — design tokens (color, type, spacing, radius, shadow) + semantic classes. Start here for any build.
- `assets/` — Cuadra logos (SVG color/light/mono + symbol), PWA icons (192/512), Muni endorsement (placeholder — see caveats), QR placeholder.
- `preview/` — small specimen cards for every token group.
- `ui_kits/{conductor,permisionario,admin}/` — interactive React+Babel recreations of each surface, with shared `primitives.jsx`.

Non-negotiables to honor: accessibility first (48px tap targets, 18px body, WCAG AA contrast, visible focus, `prefers-reduced-motion`, icon + text label always); Spanish argentino (voseo, no English in UI); institutional-but-warm tone; Muni blue `#145FB0` primary; gold `#D97706` accent used sparingly; no gradients/neumorphism/glassmorphism; one accessible UI for everyone.

If the user invokes this skill without other guidance, ask them what they want to build or design, ask a few focused questions, and act as an expert designer who outputs HTML artifacts _or_ production code depending on the need.
