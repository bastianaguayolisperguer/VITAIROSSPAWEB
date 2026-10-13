# Cierre pre-producción — Homepage V3.2

Fecha: 2026-10-13  
Branch: `homepage-v2-ai-positioning`  
Base: V3.1 (`143e95d2d3ad4de1551947b39747f9e8e77ca615`)  
Producción: no modificada.

## Alcance

V3.2 aplica únicamente correcciones finales sobre la home validada. No cambia arquitectura, hero, continuidad oscura, narrativa, ecosistema ni tecnología base.

## Correcciones

1. Se eliminó por completo “Página en preparación”. El cierre de principios conserva solo “Conocer VITAIROS”.
2. “Trabaja con nosotros” se integró como séptima intención del diagnóstico. Su rama utiliza intención → contexto → contacto, omite la etapa comercial que no corresponde, conserva respuestas al volver y adapta el asunto del formulario.
3. Las etiquetas de capítulo eliminan los prefijos `02 /`, `03 /`, etc. La numeración funcional interna de Método, Ecosistema y Diagnóstico permanece.
4. Evidencia separa media y copy en filas reales de grid. Ya no existe superposición intencional ni accidental; cada card crece según su contenido.
5. Los títulos reciben espacio tipográfico seguro y overflow visible. Se ajustan line-height y padding inferior para proteger descendentes como la “g”.

## QA final

- Smoke test V3.2 aprobado.
- Browser QA aprobado en 8 viewports.
- 0 overflow horizontal.
- 0 imágenes rotas.
- 0 errores de consola o `pageerror`.
- 0 IDs duplicados.
- 0 placeholders visibles.
- 0 etiquetas de capítulo numeradas.
- 0 px de superposición entre media y copy en las dos noticias.
- 0 títulos detectados dentro de ancestros con clipping.
- Rama laboral, regreso editable, menú, teclado, tap, reduced motion y breakpoint de 1100 px verificados.

## Evidencia visual

1. `preview/homepage-v3-2-01-placeholder-removed.png`
2. `preview/homepage-v3-2-02-diagnostic-careers.png`
3. `preview/homepage-v3-2-03-editorial-section-label.png`
4. `preview/homepage-v3-2-04-evidence-card-fixed.png`
5. `preview/homepage-v3-2-05-title-g-fixed.png`
6. `preview/homepage-v3-2-06-desktop-full.png`
7. `preview/homepage-v3-2-07-mobile-full.png`

## Pendientes externos

- Safari/iOS y hardware móvil real.
- Envío controlado de FormSubmit para oportunidad comercial e interés laboral.
- Lighthouse/WebPageTest en un entorno equivalente al CDN.
- Aprobación creativa final antes de cualquier push, merge o deploy.
