# VITAIROS Agro Intelligence — QA final de preproducción V2

Fecha de cierre: 24 de octubre de 2026

Branch: `agro-intelligence-v2`

Ruta auditada: `/agro-intelligence/`

Canonical: `https://www.vitairos.com/agro-intelligence/`

## Resultado ejecutivo

La landing mantiene la dirección estratégica aprobada: gestión hídrica como wedge inicial y plataforma extensible de inteligencia operacional. La auditoría final no detectó bloqueantes de merge. Se corrigieron dos hallazgos reales: el CTA principal del hero era demasiado genérico para el wedge y la imagen social no identificaba marca/producto.

No se realizó merge, deploy, cambio de DNS, Cloudflare ni pipeline.

## Matriz de aprobación

| CATEGORÍA | ESTADO | EVIDENCIA |
|---|---|---|
| VISUAL | PASS | Hero, jerarquía, imagen, contraste, espaciado, CTAs, diagramas, cards, títulos, formulario y footer revisados en las cinco capturas finales. |
| RESPONSIVE | PASS | 1440, 1024, 768, 390 y 320 px; 0 px de overflow horizontal; menú móvil abre/cierra; diagramas y cards se apilan sin cortes. |
| FUNCTIONAL | PASS | Anchors válidos; CTA principal llega a `#diagnostico`; CTA de integración adapta intención/copy/desafío; validación nativa, redirect de éxito, honeypot y eventos verificados. |
| SEO | PASS | Title, description, canonical, robots, un único H1, JSON-LD válido, sitemaps y jerarquía semántica correctos. |
| SOCIAL | PASS | OG y Twitter/X completos; imagen JPEG 1200 × 630 con VITAIROS, Agro Intelligence y tesis hídrica; title/description coherentes para LinkedIn, WhatsApp y X. |
| PERFORMANCE | PASS | Edge headless local: LCP 280–856 ms, CLS 0, 6 requests y 150–240 KB transferidos según viewport; sin frameworks nuevos ni recursos fallidos. |
| ACCESSIBILITY | PASS | Skip link, landmarks, labels, nombres accesibles, foco visible, un único H1, jerarquía sin saltos, controles ≥42 px y `prefers-reduced-motion`. |
| CLAIMS | PASS | Sin porcentajes, ROI, resultados, clientes o arquitectura sensible no sustentados; Duoc UC Quillota figura únicamente como validación “En preparación”. |
| SECURITY | PASS | Sin secretos, claves, rutas locales, comentarios sensibles, debug ni tracking nuevo; FormSubmit y `dataLayer` existentes preservados. |
| REGRESSION | PASS | `/`, `/vitairos-m/`, `/conecta/` y `/vitairos-industrial-ai/`: HTTP 200, H1/title, CSS, assets, navegación, footer, consola y overflow correctos. |

## Evidencia visual final

- `docs/screenshots/agro-v2-final/desktop-1440.png` — 1440 × 11987
- `docs/screenshots/agro-v2-final/desktop-1024.png` — 1024 × 11217
- `docs/screenshots/agro-v2-final/tablet-768.png` — 768 × 14952
- `docs/screenshots/agro-v2-final/mobile-390.png` — 390 × 19076
- `docs/screenshots/agro-v2-final/mobile-320.png` — 320 × 19313
- `docs/screenshots/agro-v2-final/agro-v2-final-contact-sheet.png` — 1912 × 1730

Las capturas son full-page. En mobile se generaron por stitching controlado para evitar el límite de 16384 px de Chromium; no se observaron duplicaciones, saltos ni seams visuales.

## Responsive y visual

| Viewport | Ruta | Overflow | Menú | Imágenes | Botón mínimo | Consola / JS / red |
|---|---:|---:|---:|---:|---:|---:|
| 1440 × 1000 | 200 | 0 px | N/A | PASS | 43 px | 0 errores |
| 1024 × 900 | 200 | 0 px | N/A | PASS | 43 px | 0 errores |
| 768 × 1024 | 200 | 0 px | PASS | PASS | 50 px | 0 errores |
| 390 × 844 | 200 | 0 px | PASS | PASS | 50 px | 0 errores |
| 320 × 720 | 200 | 0 px | PASS | PASS | 50 px | 0 errores |

El CTA principal del hero quedó como “Solicitar diagnóstico de gestión hídrica”. Es visible, conserva prioridad frente a “Ver cómo funciona”, funciona a una o dos líneas según ancho y desplaza correctamente al formulario. “Explorar integración” permanece como CTA secundario y adapta el formulario sin competir con la conversión principal.

## Formulario, estados y analítica

- `POST` preservado hacia `https://formsubmit.co/contacto@vitairos.com`.
- Campos, nombres, `required`, `maxlength`, tipos, consentimiento y honeypot verificados.
- Formulario vacío bloqueado por validación nativa; email inválido activa `typeMismatch`.
- `_next` preservado en `https://www.vitairos.com/agro-intelligence/?enviado=1#diagnostico`.
- Estado de éxito visible, enfocable y asociado al formulario con `aria-describedby`.
- Eventos comprobados sobre un `dataLayer` preexistente: `hero_cta`, `diagnostic_cta`, `integration_cta`, `contact_submit`.
- No se incorporó proveedor ni script de tracking.

No se envió información al endpoint externo durante QA para evitar generar un contacto real. La entrega efectiva de correo debe confirmarse con un único smoke test controlado después de publicar, sin datos sensibles.

## SEO y social preview

- Title: `VITAIROS Agro Intelligence | Inteligencia operacional para agricultura`.
- Canonical único y correcto.
- Meta description natural y alineada con riego, campo, operación, visibilidad y trazabilidad.
- JSON-LD parseable con `WebPage`, `Service` y `FAQPage`.
- `sitemap.xml` principal y sitemap de Agro actualizados.
- Open Graph simulado para LinkedIn y WhatsApp: title breve, description, URL, imagen y alt presentes.
- Twitter/X Card simulada: `summary_large_image`, title, description, imagen y alt presentes.
- Asset social final: JPEG 1200 × 630, 151 KB, con branding legible y fotografía de operación agrícola real.

## Performance equivalente a Lighthouse

El repositorio no incluye Lighthouse instalado y no se agregó una dependencia nueva. Se ejecutó un equivalente reproducible con Playwright + Microsoft Edge, PerformanceObserver y Resource Timing sobre servidor local. No se fabricaron scores de Lighthouse.

| Viewport | FCP | LCP | CLS | Long tasks | Transferencia | Requests |
|---|---:|---:|---:|---:|---:|---:|
| 1440 | 856 ms | 856 ms | 0 | 0 | 240319 B | 6 |
| 1024 | 416 ms | 416 ms | 0 | 0 | 150099 B | 6 |
| 768 | 360 ms | 360 ms | 0 | 0 | 240319 B | 6 |
| 390 | 388 ms | 388 ms | 0 | 0 | 150099 B | 6 |
| 320 | 280 ms | 280 ms | 0 | 0 | 150099 B | 6 |

El hero usa `srcset` WebP de 720/1200/1920 px, dimensiones explícitas, preload/fetch priority y no genera CLS. CSS y JS son locales; el script productivo es `defer` y no hay bloqueo material de interacción.

## Claims y posicionamiento

- El hero comunica en menos de cinco segundos control de riego, mejores decisiones y uso de datos existentes.
- La gestión hídrica es el primer caso de uso; el producto se presenta como plataforma extensible.
- No aparecen proveedores de modelos, GPT, RAG, embeddings, prompts, datasets, endpoints ni arquitectura propietaria.
- No hay porcentajes de ahorro, ROI, productividad, hectáreas, clientes, predicciones garantizadas ni resultados inventados.
- Duoc UC Quillota se describe como primera validación en terreno “En preparación”, no como cliente, piloto exitoso o caso de éxito.
- Sensores, IoT, clima, imágenes, satélite, drones y 5G están separados en “Siguiente etapa” y sujetos a caso de uso/factibilidad.

## Regresiones

| Ruta | HTTP | H1 / title | CSS / assets | Nav / footer | Overflow | Runtime |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 200 | PASS | PASS | PASS | 0 px | 0 errores |
| `/vitairos-m/` | 200 | PASS | PASS | PASS | 0 px | 0 errores |
| `/conecta/` | 200 | PASS | PASS | PASS | 0 px | 0 errores |
| `/vitairos-industrial-ai/` | 200 | PASS | PASS | PASS | 0 px | 0 errores |

También se validaron `robots.txt`, ambos sitemaps, favicon ICO/PNG, apple-touch-icon, privacidad y términos con HTTP 200 y contenido no vacío.

## Diff contra `main`

- Modificados: landing Agro, política de privacidad Agro y los dos sitemaps.
- Nuevos productivos: CSS, JS y cuatro assets de Agro.
- Nuevos de soporte: este QA, changelog, script reproducible y seis evidencias visuales finales.
- Eliminados: ninguno.
- Compartido/global: únicamente `sitemap.xml`; no se modificó CSS, JS, navegación ni footer compartido de otras rutas.
- Exclusivo de Agro: toda la implementación y los assets dentro de `agro-intelligence/`.
- No se detectaron archivos innecesarios; capturas preliminares y recortes temporales fueron retirados.

## Comandos ejecutados

- `node --check agro-intelligence/script.js`
- `node --check tests/agro-v2-qa.mjs`
- `node tests/agro-v2-qa.mjs`
- `git diff --check`
- parseo XML de `sitemap.xml` y `agro-intelligence/sitemap.xml`
- escaneo de secretos, rutas locales, comentarios de debug y claims prohibidos

No existe pipeline de build o lint en este sitio estático. El navegador real actuó como parser HTML, link checker, verificador de runtime y motor de layout.

## Limitaciones no bloqueantes

- La entrega real de FormSubmit requiere un smoke test controlado en el dominio publicado.
- El cache de previews sociales debe refrescarse en cada plataforma después de publicar el asset nuevo.
- Las métricas locales no sustituyen datos de campo; sí descartan regresiones materiales de peso, layout y ejecución antes del merge.

## Veredicto

**READY FOR MERGE.** La branch puede pasar al workflow normal de revisión y merge. Este documento no autoriza ni ejecuta merge o deploy.
