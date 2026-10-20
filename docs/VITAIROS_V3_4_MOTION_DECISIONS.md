# VITAIROS V3.4 — Motion Decisions

Fecha: 2026-10-19

Base: V3.3 `0be302dba43ad8fd33412763209f2050c6a91371`

Referencia histórica: V3.2.1 `f0482a6`

| SECTION | V3.2.1 | V3.3 | V3.4 | DECISION | WHY | DESKTOP | TABLET | MOBILE | INTERACTION | ACCESSIBILITY |
|---|---|---|---|---|---|---|---|---|---|---|
| Hero / sphere | Malla calmada, elegante y ordenada. | Más jerarquía, rutas y señal, pero densidad casi uniforme entre tamaños. | Red tecnológica organizada con seis rutas máximas y perfiles reales de densidad. | **REBUILD** | La esfera es brand motion; debe expresar identidad, no explicar cada capacidad. | Profundidad completa, `edgeStep 1`, cinco rutas visibles. | Densidad intermedia, `edgeStep 2`, tres rutas. | Copy/CTA primero, esfera reposicionada, `edgeStep 3`, dos rutas y radio menor. | Pointer y focus en proyectos; movimiento lento y controlado. | Fallback completo con `prefers-reduced-motion`; links conservan nombres accesibles. |
| Problemas | Visual abstracta y limpia, con significado limitado. | Cuatro escenas expresivas pero difíciles de comparar. | Un SVG estable de seis elementos con cuatro estados semánticos. | **REBUILD** | La estructura fija permite reconocer qué cambió y conservar el significado en reposo. | Tabs a la izquierda y visual lateral. | Cuatro labels compactos arriba y visual centrado. | Selector horizontal, copy antes del visual y composición de menor densidad. | Click, hover, focus, touch y flechas; feedback inicial de 180–380 ms. | `tablist`, `tab`, `aria-selected`, `tabpanel`, roving `tabindex`, focus visible y targets ≥44 px. |
| Integración | Banda visual contenida pero poco explicativa. | Cinco entradas, núcleo y operación; lectura correcta, escala excesiva y sin detalle por componente. | SVG estático-first con cinco componentes, núcleo, operación y microcopy inmediato. | **SIMPLIFY** | Mantiene la explicación V3.3 con una única gramática visual y sin partículas libres. | Copy y sistema lado a lado. | Copy editorial arriba y sistema horizontal centrado. | Sistema apilado específico, controles táctiles y detalle visible. | Hover/focus/tap resaltan componente y conexión; pulso secundario sutil. | Botones nativos, `aria-pressed`, región `aria-live`, targets de 44 px; reduced motion muestra conexión final. |
| Método | Una ruta común, ordenada y coherente. | Cuatro miniuniversos aumentan ruido y altura. | Una sola ruta estable, cuatro etapas y un único traveller. | **ROLLBACK V3.2.1 visual + KEEP V3.3 copy** | El método requiere secuencia, no cuatro escenas diferentes. | Ruta horizontal limpia con progreso continuo. | Misma ruta con proporciones compactas y copy legible. | Ruta vertical y pulso descendente; etapas a ancho completo. | Hover/focus/tap seleccionan etapa; scroll actualiza progreso sin anular una elección inmediata. | Botones nativos, `aria-pressed`, navegación por flechas, focus visible y lectura completa sin motion. |
| Iniciativas | Índice y visual compartido con buena jerarquía. | Múltiples transformaciones semánticas elevan la carga visual. | Índice, sector, valor, CTA y un solo visual compartido de baja energía. | **SIMPLIFY** | La propuesta de cada vertical debe dominar; el visual acompaña. | Índice + preview balanceados. | Índice de 300 px + preview compacto. | Contenido y CTA antes del visual; preview de 330 px. | Hover/focus/click/tap mantienen cambio de iniciativa. | `aria-expanded` por iniciativa; contenido crítico visible y enlaces nativos. |
| Principios | Contenido directo y motion mínimo. | Copy superior y pulso compartido. | Se conserva el sistema V3.3; el progreso auxiliar se retira en mobile. | **KEEP V3.3 / SIMPLIFY MOBILE** | El motion ya es proporcional al mensaje. | Línea/pulso de baja intensidad. | Misma lógica con densidad ambiental reducida. | Sin progreso auxiliar; contenido completo. | Scroll reveal y hover/focus discreto. | Sin contenido oculto; reduced motion deja todos los principios activos y legibles. |
| Ambiente general | Nodos y líneas coherentes con la identidad. | Mayor cantidad de focos simultáneos. | Ambiente conservado con actividad ligada a visibilidad y sin nuevas escenas. | **KEEP / CONTROL** | La página debe sentirse viva sin competir con brand o functional motion. | Máximo un foco funcional fuerte más ambiente. | Parallax y densidad reducidos. | Desplazamiento mínimo y sin elementos críticos flotantes. | Reacciones de baja energía y suspensión fuera del viewport. | Motion prescindible; copy, orden y contraste sobreviven sin animación. |

## Clasificación final

- **Brand motion:** esfera VITAIROS.
- **Functional motion:** Problemas e Integración.
- **Functional motion mínimo:** progreso del Método.
- **Ambient motion:** redes de fondo, reveals, Principios e Iniciativas.
- **Eliminado:** cuatro miniuniversos animados del Método y toda partícula libre en diagramas semánticos.

## Regla aplicada

Ningún contenido crítico depende de hover, canvas o animación. La información permanece disponible mediante texto visible, controles táctiles, navegación por teclado y estados finales de reduced motion.
