# VITAIROS HOME V3.4 — Responsive Motion Rebuild

Fecha de cierre: 2026-10-19

Alcance: home corporativa (`/`) en preview local, sin publicación.

## STATUS

Implementación V3.4 terminada. Se preservó la claridad comercial de V3.3, se recuperó el orden visual de V3.2.1 y se reconstruyó el motion con composiciones específicas para desktop, tablet y mobile.

## BASE SHA

`0be302dba43ad8fd33412763209f2050c6a91371`

## NEW SHA

Corresponde al `HEAD` del commit local `Rebuild VITAIROS responsive motion system`. El SHA exacto se registra en el handoff final, porque el commit no puede contener su propio hash.

## PREVIEW URL

`http://127.0.0.1:4173/?preview=v3.4`

## VISUAL AUDIT

La auditoría obligatoria anterior a la implementación está en `docs/VITAIROS_V3_4_VISUAL_MOTION_AUDIT.md`. Distingue claridad, orden, interacción, responsive e identidad y registra por sección las decisiones KEEP V3.3, ROLLBACK V3.2.1, REBUILD o SIMPLIFY.

## COPY PRESERVED

Se conservaron el hero V3.3, “Una misma base tecnológica. Distintos desafíos.”, la explicación de IA aplicada/software/automatización/datos/integraciones, Diagnóstico/Piloto/Implementación/Escalamiento y los cuatro principios. “Compañía en construcción” continúa eliminado.

## V3.2.1 ELEMENTS RESTORED

- Método con una sola ruta estable en lugar de cuatro miniuniversos.
- Composición más calmada, espacios claros y menor cantidad de focos simultáneos.
- Iniciativas con jerarquía contenido → CTA → visual compartido.
- Esfera y diagramas con estructura reconocible antes que densidad.

## V3.3 ELEMENTS PRESERVED

- Claridad comercial, propuesta y copy de capacidades.
- Interacción de la esfera y vínculos a proyectos.
- Cuatro estados de problemas y sus resultados.
- Cinco componentes de integración y salida a Operación.
- Método de cuatro etapas, iniciativas, noticias, principios, diagnóstico, formulario, privacidad, SEO, favicon, marca y paleta.

## SPHERE

La esfera sigue siendo el único brand motion complejo. El Canvas conserva profundidad, proyectos conectados y respuesta al pointer, pero usa seis rutas operativas como máximo, nodos jerarquizados y una señal más lenta. La composición se lee como red tecnológica organizada y no como nube de partículas.

## SPHERE RESPONSIVE

- Desktop: detalle completo, cinco rutas visibles y mayor radio.
- Tablet: muestreo intermedio de conexiones/nodos, tres rutas y radio controlado.
- Mobile: menor radio, un tercio de conexiones/nodos y dos rutas; queda después del copy y CTA.

No se usa una esfera desktop meramente escalada: JavaScript aplica perfiles de densidad, ruta y radio distintos por viewport.

## PROBLEMS INTERACTION

Proceso, Información, Decisiones y Producto comparten un SVG de seis elementos principales. La base no cambia; cada estado modifica solo posición, forma, jerarquía o ramas necesarias. La transición semántica dura 380 ms y la selección responde de inmediato a click, hover, focus, touch y flechas.

## PROBLEMS RESPONSIVE

- Desktop: selector lateral + visual.
- Tablet: cuatro labels compactos superiores + visual central.
- Mobile: selector horizontal accesible + copy completo + visual debajo.

El estado se comprende detenido. En mobile no se requiere hover y el texto precede geométricamente al visual.

## INTEGRATION INTERACTION

IA, Software, Datos, Automatización e Integraciones son botones reales. Cada selección resalta el componente y su conexión y actualiza un microcopy visible. El SVG conserva cinco entradas, un núcleo con propósito/control/contexto y salida a Operación.

## INTEGRATION RESPONSIVE

Desktop mantiene copy y sistema lado a lado. Tablet usa copy editorial y sistema centrado en bloque. Mobile reorganiza explícitamente los componentes sobre un lienzo vertical compacto, con controles de 44 px y detalle visible en el mismo viewport de la visual.

## METHOD

Se eliminaron los cuatro miniuniversos V3.3. Diagnóstico → Piloto → Implementación → Escalamiento comparten una sola línea de progreso y un traveller. Hover, focus o tap destacan una etapa; el scroll avanza la secuencia y una selección manual conserva prioridad inmediata.

## METHOD RESPONSIVE

Desktop y tablet usan una ruta horizontal continua. Mobile cambia a ruta vertical, botones a ancho completo y traveller descendente. Ninguna etapa se comprime horizontalmente.

## INITIATIVES

VITAIROS-M, Industrial AI, Agro Intelligence y VITAIROS Conecta mantienen nombre, sector, propuesta y CTA. Se retiró motion narrativo innecesario: un único visual compartido acompaña el cambio de iniciativa con nodos, rutas y una transición breve.

## PRINCIPLES

Problema primero, Probar en pequeño, Integrar con la operación y Escalar con evidencia permanecen intactos. Solo conservan reveal, hover/focus y un progreso compartido de baja intensidad; este último se oculta en mobile.

## INTERACTION VALUE

La home sigue respondiendo a cursor, teclado, touch y scroll. Los cambios de estado entregan feedback inicial dentro de 100–250 ms; el movimiento narrativo que continúa después nunca bloquea el significado. No se añadieron modales ni navegación compleja.

## DESKTOP

Validado en 1920×1080, 1440×900, 1366×768 y 1200×800. Mantiene riqueza visual completa con un foco funcional principal por sección, layout lateral donde aporta y cero overflow horizontal.

## TABLET

Validado en 1024×768 y 768×1024. Usa composiciones propias: esfera menos densa, problemas con tabs superiores, integración apilada, método horizontal compacto e iniciativas de dos columnas controladas.

## MOBILE

Validado en 430×932, 390×844 y 360×800. Copy y CTA preceden a la esfera; Problemas es contenido-first; Integración es táctil; Método es vertical; Iniciativas prioriza sector, valor y CTA. No hay visuales desktop comprimidas ni overflow horizontal.

## REDUCED MOTION

`prefers-reduced-motion` activa fallback de esfera, detiene señal/rutas/traveller/transiciones, muestra la integración conectada y conserva los seis elementos de Problemas y las cuatro etapas del Método. La home sigue clara y completa sin animación.

## ACCESSIBILITY

- Problemas: `tablist`, `tab`, `aria-selected`, `tabpanel`, roving `tabindex` y flechas.
- Integración: botones nativos, `aria-pressed` y detalle `aria-live`.
- Método: botones nativos, `aria-pressed`, navegación por flechas y focus visible.
- Iniciativas: `aria-expanded` y enlaces nativos.
- Objetivos táctiles relevantes: ≥44 px en mobile.
- Un solo `h1`, cero IDs duplicados y orden de tabulación preservado.

## TECHNICAL QA

- `tests/home-v3-4-qa.cjs`: nueve viewports, 21 capturas, interacción, teclado, touch targets, reduced motion, errores de navegador y secuencias de frames.
- `node --check`: JavaScript de home y QA sintácticamente válido.
- `git diff --check`: sin errores de whitespace.
- Resultado final esperado/registrado: `failures: []`, cero errores de consola, requests fallidas o respuestas HTTP ≥400.
- Sin nuevas librerías, Three.js, dependencias o infraestructura.

## VISUAL QA

Revisión humana realizada sobre capturas reales de desktop, tablet y mobile:

- Orden: cada sección tiene un protagonista y un ambiente secundario.
- Balance: esfera, diagramas y copy recuperan respiración sin perder identidad.
- Lectura: problemas e integración se entienden también estáticos.
- Jerarquía: copy y CTA dominan en mobile.
- Interacción: feedback inmediato y estados persistentes.
- Densidad: desktop 100%, tablet aproximadamente 75%, mobile aproximadamente 50%.
- Motion: máximo un foco fuerte y un fondo ambiental por sección.

La percepción final de la esfera como activo premium queda marcada para validación cualitativa externa; técnicamente y en la inspección interna no presenta desorden.

## LIGHTHOUSE

Medición local final con preset desktop y Edge limpio, sin extensiones:

- Performance: **94** (objetivo ≥92).
- Accessibility: **100** (objetivo ≥98).
- Best Practices: **100** (objetivo ≥95).
- SEO: **100** (objetivo ≥95).
- FCP: **0,1 s**; LCP: **0,2 s**; TBT: **180 ms**; CLS: **0,012**; Speed Index: **1,3 s**.

El JSON completo está en `preview/home-v3.4-responsive-motion-rebuild/lighthouse-report.json`.

## SCREENSHOTS

Las 21 capturas obligatorias están en `preview/home-v3.4-responsive-motion-rebuild/screenshots/`, numeradas `01` a `21`, incluyendo siete heroes, tres problemas, tres integraciones, tres métodos, dos iniciativas y tres páginas completas.

## MOTION EVIDENCE

Se generaron 73 frames sin agregar dependencias: 24 de esfera (desktop/mobile, 5,4 s cada secuencia), 25 de Problemas, 16 de Integración y 8 de Método. Están agrupados por interacción y viewport en `preview/home-v3.4-responsive-motion-rebuild/motion-evidence/`.

## BEFORE AFTER

`preview/home-v3.4-responsive-motion-rebuild/before-after/` contiene comparativas V3.2.1/V3.3/V3.4 para esfera, problemas, integración, método y mobile. V3.4 conserva el significado de V3.3 y recupera estructura, ritmo y consistencia de V3.2.1.

## KNOWN ISSUES

- **NEEDS REVIEW cualitativo:** confirmar con personas nuevas que la esfera se interpreta como red tecnológica organizada y premium; es una validación de percepción, no un fallo técnico.
- La evidencia de motion se entrega como secuencias densas de frames porque no se añadió una dependencia pesada para producir video.
- Canvas conserva fallback; equipos sin aceleración gráfica verán la versión estática completa.

## RECOMMENDATION

Revisar el preview local en 1440, 1024 y 390 junto con las secuencias de motion. Si la validación humana confirma orden, identidad y comprensión en tres segundos, abrir una tarea separada de release. No desplegar desde esta rama.

## PRODUCTION STATUS

Producción intacta. No hubo push, merge, deploy, cambios en Cloudflare, DNS, Pages, Workers, planes, facturación, servicios, infraestructura, backend, formularios, destinatarios ni verticales.

VITAIROS V3.4 LISTA PARA VALIDACIÓN VISUAL RESPONSIVE. PRODUCCIÓN NO MODIFICADA.
