# VITAIROS V3.4.2 — Production Release

Fecha de cierre: 2026-10-20 (America/Santiago)  
Rama: `home-v3.4.1-commercial-interaction-fix`

## STATUS

**NO-GO preproducción.** La recuperación móvil mejoró la mediana de Performance de **78 a 88**, pero no alcanzó el gate obligatorio de **92**. La regla definida para el rango 88–91 exige detenerse y no realizar automáticamente sacrificios visuales mayores.

No hubo commit de release, push, merge, deploy, pruebas reales de formularios ni cambios en producción.

## SHAS

- `PREVIOUS_MAIN_SHA`: `c77ade880948c28dd2eb2ad36d4a5a657158bced`
- `APPROVED_SHA` / `BASE_SHA`: `cbbb413e736e0f9d3b26a90d56d6a8d5bda21254`
- `NEW_SHA`: **NOT CREATED** — el gate móvil no pasó.
- `ROLLBACK_SHA`: `c77ade880948c28dd2eb2ad36d4a5a657158bced`

`origin/main` no fue actualizado ni modificado. No fue necesario hacer rollback porque producción nunca cambió.

## LIGHTHOUSE MOBILE — FINAL CLEAN MEDIAN OF 3

Las tres corridas finales se realizaron con perfiles temporales limpios e independientes, mismo servidor local, mismas condiciones y sin extensiones.

| Corrida | Performance | Accessibility | Best Practices | SEO | FCP | LCP | Speed Index | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 91 | 100 | 100 | 100 | 1.954 s | 3.004 s | 2.406 s | 140 ms | 0 |
| 2 | 88 | 100 | 100 | 100 | 2.103 s | 3.153 s | 2.103 s | 204 ms | 0 |
| 3 | 85 | 100 | 100 | 100 | 1.986 s | 3.004 s | 2.342 s | 328 ms | 0 |
| **Mediana** | **88** | **100** | **100** | **100** | **1.986 s** | **3.004 s** | **2.342 s** | **204 ms** | **0** |

Resultado de gates:

- Mobile Performance: **88 — STOP** (objetivo ≥92).
- Accessibility: **100 — PASS** (objetivo ≥98).
- Best Practices: **100 — PASS** (objetivo ≥95).
- SEO: **100 — PASS** (objetivo ≥95).

Evidencia:

- `preview/home-v3.4.2-production-release/batch-11-clean-mobile-1.json`
- `preview/home-v3.4.2-production-release/batch-11-clean-mobile-2.json`
- `preview/home-v3.4.2-production-release/batch-11-clean-mobile-3.json`

## MOBILE BEFORE / AFTER

| Métrica mediana | Antes | Después | Cambio |
| --- | ---: | ---: | ---: |
| Performance | 78 | 88 | +10 puntos |
| FCP | 1.958 s | 1.986 s | +28 ms |
| LCP | 3.833 s | 3.004 s | -829 ms |
| Speed Index | 2.649 s | 2.342 s | -307 ms |
| TBT | 362 ms | 204 ms | -158 ms |
| CLS | 0 | 0 | sin cambio |
| Main-thread work | 5.170 s | 2.218 s | -2.952 s |

La reducción material de LCP, TBT y trabajo del hilo principal demuestra mejora real, no un ajuste cosmético de Lighthouse.

## QUÉ IMPIDE ALCANZAR 92

1. `assets/homepage.css` sigue siendo una hoja única de aproximadamente 138 KB y render-blocking. Lighthouse aún estima alrededor de 840 ms de ahorro potencial mediante una separación más profunda de CSS crítico y diferido.
2. Outfit permanece como fuente variable oficial de aproximadamente 111 KB. Ya usa preload y `font-display: swap`; quitarla o sustituirla violaría el alcance visual.
3. El LCP continúa siendo la marca oficial del brand intro. El PNG visible se redujo de 93.715 B a 19.245 B y se priorizó, pero su render todavía comparte la ventana crítica con estilos, composición e introducción de marca.
4. Persiste variabilidad de TBT por pintura, composición y motion de la primera carga. La esfera ya se difiere hasta interacción real en móvil; recortar más identidad o motion sería una degradación perceptible.
5. Llegar de 88 a 92 probablemente requiere dividir/refactorizar la hoja CSS o reducir más la secuencia visual. Ambas son intervenciones mayores y no se autorizan automáticamente dentro del gate 88–91.

## DESKTOP REGRESSION

El plan exige repetir Desktop solo después de aprobar Mobile. Como Mobile quedó en 88, no se ejecutó una corrida Desktop posterior.

| Métrica | Desktop antes | Desktop después |
| --- | ---: | ---: |
| Performance | 97 | NOT RUN — mobile gate failed |
| Accessibility | 100 | NOT RUN — mobile gate failed |
| Best Practices | 96 | NOT RUN — mobile gate failed |
| SEO | 100 | NOT RUN — mobile gate failed |
| LCP | 0.7 s | NOT RUN — mobile gate failed |
| TBT | 120 ms | NOT RUN — mobile gate failed |
| CLS | 0.012 | NOT RUN — mobile gate failed |

## OPTIMIZATIONS INCLUDED

- Canvas móvil limitado a DPR 1 y 30 FPS, pausado fuera del hero.
- Inicialización del canvas móvil diferida hasta interacción real, manteniendo una esfera SVG estática, aro y aurora desde la primera pintura.
- Duración de intro móvil reducida a 720 ms; marca oficial estable e inmediatamente visible.
- Inicializadores de secciones inferiores activados mediante `IntersectionObserver` cuando corresponden.
- Eliminado trabajo redundante de reveal en scroll y su timeout global.
- `content-visibility: auto` con tamaños intrínsecos en secciones inferiores móviles.
- Imágenes inferiores con `loading="lazy"` y `decoding="async"`.
- Recurso LCP priorizado y sustituido por una variante oficial optimizada de 320×320, sin rediseño ni degradación perceptible.
- Contraste de la firma del ecosistema corregido y logo oficial VITAIROS-M preservado.

Detalles y lotes revertidos: `docs/VITAIROS_V3_4_2_MOBILE_PERFORMANCE.md`.

## RESPONSIVE, VISUAL AND INTERACTION QA

Resultado: **PASS**.

Viewports validados: 1920×1080, 1440×900, 1366×768, 1200×800, 1024×768, 768×1024, 430×932, 390×844 y 360×800.

Se confirmó:

- HTTP local 200 y sin overflow horizontal.
- Sin imágenes rotas, secciones colapsadas, IDs duplicados, clipping ni solapamientos.
- Hero, Problemas, Integración, Método, Ecosistema, Principios, actualidad, formulario y footer presentes.
- Mouse/click, touch, teclado, tabs, flechas, hover y foco visible.
- `prefers-reduced-motion: reduce`: contenido visible, canvas no inicializado y fallback de esfera activo.
- Sin errores de consola, requests fallidos ni respuestas HTTP inválidas.
- Logo VITAIROS-M oficial exacto, con proporción, transparencia, `object-fit: contain` y filtro neutro.

Evidencia: `preview/home-v3.4.2-production-release/qa-results.json` y `preview/home-v3.4.2-production-release/screenshots/`.

## FORM AND PRIVACY QA

Resultado de contrato: **PASS, sin envíos reales**.

- Formulario corporativo: `method=post`, endpoint conservado, `lead_type=commercial`, consentimiento requerido y `privacy_version=2026-10`.
- VITAIROS-M: tres formularios (`person`, `professional`, `institution`), consentimiento requerido, propósito específico y `privacy_version=2026-10`.
- Tracking UTM, referrer y landing path conservado.
- No se transmitieron datos, no se generaron correos y no se activó ningún flujo externo.

## VERTICALS AND BRAND

- VITAIROS-M: contrato y logo PASS; sin cambios dentro de su vertical.
- Industrial AI, Agro Intelligence, Conecta y Bastian Lisperguer: no modificados.
- Asset exacto VITAIROS-M: `/vitairos-m/assets/vitairos-m-isotype-transparent.png`.
- Asset optimizado del brand intro: `/conecta/assets/vitairos-isotipo-320.png` (320×320, 19.245 B, misma fuente oficial).

## INFRASTRUCTURE, COST AND PRODUCTION

- `DEPLOYMENT ID`: **NOT CREATED**.
- Worker productivo previsto: `vitairosspaweb`, no inspeccionado ni modificado durante este cierre.
- Producción: `https://www.vitairos.com/`, **UNCHANGED**.
- Infraestructura nueva: **NONE**.
- Cambios de costo: **NONE**.
- No se mostró ni aceptó precio, upgrade, billing, trial o consumo facturable.
- No se creó Worker, Pages, KV, D1, R2, Durable Object, Turnstile ni binding.

## FINAL VERDICT

**RELEASE READY: NO**  
**PRODUCTION STATUS: UNCHANGED**

VITAIROS V3.4.2 CONTINÚA DETENIDA POR PERFORMANCE MÓVIL. PRODUCCIÓN NO MODIFICADA.
