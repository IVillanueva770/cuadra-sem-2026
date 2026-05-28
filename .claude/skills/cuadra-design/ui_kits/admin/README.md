# UI Kit — Panel Admin Muni

Interfaz para funcionarios de la Coordinación General de Modernización. Login con email institucional. **Desktop-first** (usable en mobile), UI más densa tipo dashboard institucional.

## Vistas
- **Resumen**: KPIs en tiempo real (recaudación, sesiones, permisionarios, tasa de cobro digital), gráfico de recaudación semanal, ranking de permisionarios.
- **Permisionarios**: tabla con filtros laterales (período, zona).
- **Mapa de cuadras**: mapa Leaflet del microcentro de Salta con cuadras y sesiones activas + panel de filtros.
- **Configuración**: tabs (Tarifas, Horarios, Feriados, Zonas) con formularios, switches y calendario de feriados editable.

## Archivos
- `index.html` — layout con sidebar + topbar + vista Resumen, navegable entre vistas. Carga **Leaflet** vía CDN.
- `primitives.jsx` — primitivos compartidos (copia del kit Conductor).
- `components.jsx` — `Sidebar`, `AdminTopBar`, `StatCard`, `BarChart`, `RankingTable`, `FilterPanel` (+ iconos extra).
- `views.jsx` — `MapaCuadras` (Leaflet), `Configuracion` (`TarifasForm`, `FeriadosCalendar`, `Switch`).

## Notas
- Ancho de diseño 1280px. El gráfico de barras es CSS puro (no librería).
- El mapa usa tiles CartoDB light + `circleMarker` por cuadra.
