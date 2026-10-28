# VITAIROS Agro Intelligence V2.1 — registro de despliegue

## Identificación

- Fecha: 2026-10-28 (America/Santiago).
- Source branch: `agro-intelligence-v2`.
- Source commit aprobado: `a47eac70152ecfe1ddbffa9aff3bb5cb99afd0de`.
- `main` anterior: `eeb9cd6e7acbb5352e8a721b332f720e51311aa8`.
- Rollback point: tag local anotado `pre-agro-intelligence-v2-1`, apuntando a `eeb9cd6e7acbb5352e8a721b332f720e51311aa8` (tag no publicado).
- Merge commit: `d10893546539d910144a4f76306311ff0299b71c`.
- `main` final de la publicación: `d10893546539d910144a4f76306311ff0299b71c`.
- El árbol de la versión Agro aprobada y el árbol integrado en `main` coincidieron exactamente para `agro-intelligence/` y `sitemap.xml`.

## Pre-flight, merge, push y deploy

- Se confirmó working tree limpio, remote esperado, branch exacta y relación ahead/behind antes de tocar `main`.
- Se revisó el historial aprobado: V2.1 visual, intro agua + hoja, fluidez, duración 2,30 s, reduced motion, cirugía comercial, reducción de redundancia, diferenciación producto/BI/FMS, sustentabilidad prudente, CTA final y FAQ comprimida.
- El diff final no contenía secretos, `.env`, tokens, debug, archivos temporales ni rutas locales servidas. `.assetsignore` excluye `.git`, `docs`, `tests` y `preview` del bundle público.
- Merge controlado `--no-ff`, sin conflictos, rebase, squash ni force push.
- Push normal completado: `eeb9cd6..d108935 main -> main`.
- Deploy ejecutado por el workflow existente de Cloudflare Worker con assets estáticos conectado a `main`.
- No se modificaron DNS, SSL, dominio, bindings, variables ni configuración de infraestructura.

## Producción y cache

- URL: `https://www.vitairos.com/agro-intelligence/`.
- Estado: HTTP 200 sobre HTTPS.
- La versión pública contiene el headline y la identificación de intro V2.1 aprobados.
- HTML, CSS, JS, hero, isotipo/logo y OG image fueron comprobados. CSS y JS públicos coinciden con los archivos aprobados tras normalizar CRLF a LF; los assets binarios comparados coinciden por SHA-256.
- No se detectaron referencias a `localhost`, `127.0.0.1`, `trycloudflare`, `file://` ni rutas locales.

## QA local y regresiones

- Suite V2.1: PASS en 1440, 1024, 768, 390 y 320 px.
- Suite de intro: PASS en desktop, mobile y reduced motion.
- Cero overflow horizontal, imágenes rotas, errores de consola, errores de página o requests fallidos.
- Regresión local y productiva: `/`, `/vitairos-m/`, `/conecta/`, `/vitairos-industrial-ai/` y `/agro-intelligence/` responden HTTP 200 y conservan contenido principal, título y layout sin overflow.
- La suite histórica `tests/agro-v2-qa.mjs` conserva un locator estricto obsoleto para `[data-intent="integration"]`, que hoy encuentra dos CTA válidos. Se usaron las suites V2.1 vigentes y una regresión de rutas equivalente; no se modificó código aprobado.

## Smoke visual y responsive en producción

- PASS en 1440, 1024, 768, 390 y 320 px.
- Intro, hero, producto, tabs Alertas/Trazabilidad, integraciones, roadmap, Duoc discreto, equipo, FAQ, CTA, formulario, footer, navegación móvil y scroll progress verificados.
- Cero overflow, anchors faltantes, imágenes rotas, errores de consola, errores HTTP o diferencias de assets detectadas.
- La validación comercial/visual humana final queda pendiente, según el alcance acordado.

## Intro

- Desktop cold-cache: 2428 ms desde activación hasta retiro.
- Mobile cold-cache: 2440 ms desde activación hasta retiro.
- Reduced motion: 686 ms.
- Logo completo y disponible al `DOMContentLoaded`; agua + hoja visibles en modo normal y omitidas en reduced motion.
- Sin flash, pieza tardía, salto, logo incompleto ni pausa de red adicional observada.
- La intro no se repite dentro de la misma sesión.

## Formulario

- Se realizó un único smoke test real en producción con datos QA identificables.
- Validación nativa: PASS.
- Honeypot: vacío.
- Submit: exactamente un POST a `https://formsubmit.co/contacto@vitairos.com`.
- Respuesta del endpoint: HTTP 200.
- No se observó la redirección `_next` ni el success state durante la automatización; no se reintentó para respetar el límite de un solo envío.
- `PENDING MANUAL EMAIL RECEIPT CONFIRMATION`.

## Analytics

- Eventos comprobados sin añadir tracking: `hero_cta`, `diagnostic_cta`, `integration_cta` y `contact_submit`.
- El evento `contact_submit` se emitió también en el único submit real.

## SEO y social

- Title, meta description, canonical, H1, OG title/description/image, Twitter metadata y JSON-LD: PASS sobre el HTML público real.
- Canonical: `https://www.vitairos.com/agro-intelligence/`.
- `robots.txt` y `sitemap.xml`: HTTP 200; robots referencia el sitemap y el sitemap contiene la URL Agro.
- Imagen social pública: HTTPS, HTTP 200, JPEG, 1200 × 630, branding VITAIROS aprobado.

## Lighthouse de producción

- Lighthouse: 13.6.0, perfil mobile 390 × 844, auditoría real sobre producción.
- Performance: 88.
- Accessibility: 100.
- Best Practices: 100.
- SEO: 100.
- FCP: 1,2 s.
- LCP: 2,5 s.
- CLS: 0.
- TBT: 370 ms.
- Speed Index: 3,3 s.
- Lighthouse advirtió que la CPU del entorno de prueba era más lenta que su referencia, lo que puede reducir el score de Performance. No se alteró la versión aprobada para perseguir un score.

## Seguridad y claims

- Respuestas 404 confirmadas para `.env`, `.git/HEAD`, `.assetsignore`, `package.json`, `wrangler.toml`, tests, docs, `preview/` y equivalentes bajo `/agro-intelligence/`.
- No se expusieron secrets, tokens, claves, filesystem, directorios, rutas locales, debug ni información interna sensible.
- Sin claims no autorizados de ROI, ahorro, porcentajes, clientes, caso de éxito, piloto exitoso, OpenAI, GPT, RAG, MaaS o automatización autónoma.
- Duoc aparece una sola vez y únicamente como “Validación en terreno en preparación · Duoc UC Quillota”.

## Incidentes y pendientes

- P0: ninguno.
- P1: ninguno confirmado.
- P2: ninguno.
- P3/tooling: locator obsoleto en la suite histórica V2, sin impacto en el sitio ni en las suites V2.1 vigentes.
- Pendiente manual: confirmar la recepción del correo QA.
- Pendiente manual: revisión comercial/visual humana final directamente sobre producción.
- No fue necesario ejecutar rollback.

## Estado

`PRODUCTION STATUS: DEPLOYED — MANUAL VERIFICATION PENDING`
