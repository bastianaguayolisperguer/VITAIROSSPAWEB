# Homepage V2 — Informe de QA

Fecha: 2026-10-11  
Rama: `homepage-v2-ai-positioning`  
Entorno validado: servidor HTTP local en `http://127.0.0.1:4173/`

## Resultado

La homepage V2 superó las verificaciones estáticas, funcionales, responsivas y de accesibilidad automatizable definidas para esta entrega. No se realizó despliegue, merge ni modificación de producción.

## Matriz responsive

| Viewport | HTTP | H1 | Main | Overflow horizontal | Reveals visibles | Imágenes rotas | Errores de consola |
| --- | ---: | ---: | --- | ---: | --- | ---: | ---: |
| 1920 × 1080 | 200 | 1 | Sí | 0 px | Sí | 0 | 0 |
| 1440 × 900 | 200 | 1 | Sí | 0 px | Sí | 0 | 0 |
| 1366 × 768 | 200 | 1 | Sí | 0 px | Sí | 0 | 0 |
| 1024 × 768 | 200 | 1 | Sí | 0 px | Sí | 0 | 0 |
| 768 × 1024 | 200 | 1 | Sí | 0 px | Sí | 0 | 0 |
| 430 × 932 | 200 | 1 | Sí | 0 px | Sí | 0 | 0 |
| 390 × 844 | 200 | 1 | Sí | 0 px | Sí | 0 | 0 |
| 360 × 800 | 200 | 1 | Sí | 0 px | Sí | 0 | 0 |

## Interacción y accesibilidad

- El menú móvil abre, cierra con `Escape` y devuelve el foco al botón disparador.
- Existe un único `h1`, un elemento `main`, enlace para saltar al contenido y estados de foco visibles.
- La preferencia `prefers-reduced-motion: reduce` elimina las transiciones perceptibles.
- Los contenidos animados permanecen visibles cuando JavaScript no está disponible.
- Las rutas `/conecta/`, `/vitairos-m/`, `/vitairos-industrial-ai/`, `/agro-intelligence/` y `/bastian-lisperguer/` respondieron HTTP 200.
- La prueba de humo confirmó 23 identificadores únicos y correspondencia entre las 4 preguntas frecuentes visibles y sus datos estructurados.

## Huella inicial

| Recurso | Bytes |
| --- | ---: |
| HTML | 24.172 |
| CSS V2 | 32.953 |
| JavaScript V2 | 4.620 |
| Outfit variable local | 110.884 |
| Isotipo 128 px | 12.663 |
| Isotipo 256 px | 33.141 |
| **Total inicial sin compresión** | **218.433** |

El `index.html` anterior pesaba 1.047.233 bytes. El nuevo documento HTML pesa 24.172 bytes, una reducción aproximada de 97,7 %. La imagen Open Graph (463.774 bytes) es metadato social y no se descarga durante una visita normal.

## Evidencia visual

- `preview/homepage-v2-hero.png`
- `preview/homepage-v2-desktop-full.png`
- `preview/homepage-v2-mobile-full.png`
- `preview/homepage-v2-section-breach.png`
- `preview/homepage-v2-section-solutions.png`
- `preview/homepage-v2-section-capabilities.png`

## Alcance y riesgos pendientes

- La revisión fue local y automatizada en Microsoft Edge; conviene ejecutar Lighthouse y validar Safari/iOS antes de desplegar.
- Los formularios se resolvieron mediante CTA de correo porque el repositorio no expone un backend de captación verificable.
- Las métricas comerciales no verificables fueron retiradas. Cualquier cifra futura deberá contar con una fuente aprobada.
- SEO técnico, textos finales y datos estructurados deben revisarse de nuevo cuando cambien URLs, servicios o datos legales de la empresa.

