# VITAIROS V3.4.2 — Mobile Performance Recovery

Fecha de cierre: 2026-10-20 (America/Santiago)  
URL evaluada: `http://127.0.0.1:4173/?preview=v3.4.2`  
Base: `cbbb413e736e0f9d3b26a90d56d6a8d5bda21254`  
Producción: no modificada

## RESULTADO EJECUTIVO

La optimización subió la mediana Lighthouse Mobile de **78 a 88**, redujo LCP de **3.833 s a 3.004 s**, TBT de **362 ms a 204 ms** y trabajo de hilo principal de **5.170 s a 2.218 s**. Accessibility, Best Practices y SEO quedaron en 100; CLS permaneció en 0.

El resultado 88 cae dentro del rango obligatorio **88–91: STOP**. No se aplicaron recortes visuales mayores, no se ejecutó Lighthouse Desktop final y no se creó commit.

## ROOT CAUSES

1. Canvas y animación de esfera competían con el primer render: 145 ciclos de `FireAnimationFrame` y 301.70 ms acumulados en el trace de diagnóstico.
2. Inicializadores, observers y mediciones de layout de secciones inferiores corrían durante el arranque aunque el contenido no era visible.
3. Una hoja CSS única de aproximadamente 138 KB bloqueaba render y contenía estilos de toda la experiencia.
4. El LCP era la imagen oficial de 512 px del brand intro: 93.715 B, prioridad Medium y presentación animada.
5. Imágenes, estados y motion inferiores se preparaban antes de que el usuario pudiera consumir el hero.

La diferencia Desktop 97 vs Mobile 78 se explica por el throttling de CPU y red: evaluación JS, Style & Layout, pintura del canvas, composición y CSS bloqueante ocupan mucha más proporción de la ventana crítica móvil. Desktop absorbe ese mismo trabajo con CPU y transferencia más rápidas.

## LCP ELEMENT

La medición directa mediante `PerformanceObserver` identificó:

- tag: `image` dentro de SVG;
- selector funcional: `.intro-mark__official`;
- recurso original: `/conecta/assets/vitairos-isotipo-512.png`;
- tamaño inicial: 93.715 B;
- tamaño renderizado medido: 108.900 px²;
- `renderTime`: 672 ms y `loadTime`: 281 ms en la inspección local directa.

La versión final usa `/conecta/assets/vitairos-isotipo-320.png`, 320×320 RGBA y 19.245 B, precargada con prioridad alta. Mantiene la fuente visual oficial sin recreación.

## LONG TASKS

El diagnóstico Lighthouse modeló un long task de aproximadamente 412 ms atribuido a `homepage.js`. El hilo principal sumaba 5.170 s simulados: 2.138 s de Style & Layout, 1.685 s de Other y 929 ms de Script Evaluation. Después de las optimizaciones, la mediana de main-thread work quedó en 2.218 s.

## CANVAS COST

Antes:

- DPR móvil hasta 1.5;
- RAF continuo mientras hero o brecha eran visibles;
- render en cada frame;
- inicialización durante el arranque.

Después:

- DPR 1 en móvil;
- máximo perceptual de 30 FPS mediante `motionStep=2`;
- loop solo mientras el hero está visible;
- inicialización del canvas móvil únicamente tras una interacción real (`pointer`, `touch`, teclado o scroll);
- identidad inicial preservada mediante esfera SVG, aro y aurora CSS.

## ANIMATION COST

Se conservó motion significativo. La intro móvil se comprimió de 1.3 s a 720 ms y la marca oficial permanece estable desde la primera pintura. Los motores inferiores se activan al entrar en proximidad/visibilidad. `prefers-reduced-motion` no inicializa el canvas y mantiene contenido/fallback visible.

## JS COST

`homepage.js` representaba 3.856 s de CPU simulada y 904 ms de evaluación en el diagnóstico. Se difirieron inicializadores de Valor, Integración, Método, Ecosistema, Principios, ambiente, actualidad y formulario mediante `IntersectionObserver`. Se eliminaron el fallback global redundante de reveal y un timeout de activación masiva a 1.8 s.

No se introdujeron bundles, dependencias o terceros nuevos.

## CSS COST

La hoja `assets/homepage.css` transfiere aproximadamente 138 KB. En la medición final Lighthouse estima cerca de 69 % de CSS no utilizado en el primer viewport y alrededor de 840 ms de ahorro potencial si se separa más agresivamente CSS crítico y diferido.

Se aplicó `content-visibility: auto` y `contain-intrinsic-size: auto 900px` a secciones inferiores móviles. Se probó carga asíncrona con CSS crítico mínimo, pero se revirtió por CLS 0.061. Dividir correctamente la hoja exige un refactor más amplio y validación visual adicional; no corresponde realizarlo automáticamente en el rango STOP 88–91.

## IMAGE COST

- Brand intro: 93.715 B → 19.245 B, misma fuente oficial y transparencia.
- Recurso LCP: preload y `fetchpriority="high"`.
- Imágenes below-the-fold: `loading="lazy"` y `decoding="async"`.
- Dimensiones explícitas conservadas.
- Logo VITAIROS-M oficial exacto preservado en `/vitairos-m/assets/vitairos-m-isotype-transparent.png`.

## FONT COST

Outfit es una sola fuente variable de aproximadamente 111 KB. No hay variantes duplicadas. Usa preload y `font-display: swap`. No se cambió la tipografía ni se eliminó la fuente porque forman parte de la identidad aprobada. Un subset adicional requeriría validar cobertura de caracteres y no se aplicó a ciegas.

## NETWORK AND THIRD PARTIES

La navegación inicial del diagnóstico transfirió aproximadamente 508.582 B en 11 requests. No hubo recursos de terceros ni trabajo atribuible a terceros. El problema dominante fue CPU/render propio, no proliferación de requests.

## OPTIMIZATIONS APPLIED

| Change | Cause | Before | After | Visual impact | Decision |
| --- | --- | --- | --- | --- | --- |
| DPR 1, 30 FPS y pausa por visibilidad | Canvas competía con render | RAF continuo, DPR 1.5 | loop limitado y pausado | No perceptible | KEEP |
| Inicialización del canvas tras interacción móvil | Canvas durante ventana crítica | arranque inmediato | fallback visual primero | Identidad preservada; movimiento inicia al interactuar | KEEP |
| `IntersectionObserver` para secciones inferiores | JS/layout fuera del viewport | inicio inmediato | inicio al acercarse/verse | Ninguno | KEEP |
| Eliminar fallback/timeout global de reveal | Trabajo duplicado | scroll + timeout | observer único | Ninguno | KEEP |
| `content-visibility` móvil | Style/Layout de página completa | render temprano | render diferido | Ninguno validado | KEEP |
| Lazy/async en imágenes inferiores | Transferencia no crítica | eager | diferida | Ninguno | KEEP |
| Intro móvil a 720 ms y marca estable | LCP ligado a animación | 1.3 s | 720 ms | Secuencia más ágil, misma composición | KEEP |
| Isotipo oficial optimizado 320 px | LCP de 93.715 B | 512 px | 320 px, 19.245 B | Sin degradación perceptible | KEEP |

## OPTIMIZATIONS REVERTED

| Batch | Change | Median result | Reason | Decision |
| --- | --- | ---: | --- | --- |
| 7 | Geometría/glows simplificados y 24 FPS | 77 | TBT empeoró a 481 ms y reducía riqueza visual | REVERT |
| 8 | CSS crítico inline + hoja completa asíncrona | 81 | CLS subió a 0.061 | REVERT |
| 9 | Canvas retrasado 6 s | 79 | TBT 422 ms; no mejoró la mediana | REVERT |
| Exploración previa | `requestIdleCallback` amplio + marca tenue | 71–76 | Regresión de score y jerarquía visual | REVERT |
| Exploración previa | Observer de proximidad excesiva + marca estática | 74–77 | Sin mejora | REVERT |

## ITERATION RESULTS

| Estado / batch | Performance median | LCP median | TBT median | Outcome |
| --- | ---: | ---: | ---: | --- |
| Diagnóstico inicial | 78 | 3.833 s | 362 ms | Baseline |
| Perfil limpio corregido | 78 | 3.455 s | 458 ms | Baseline comparable |
| Batch 6 | 81 | 3.454 s | 393 ms | Keep |
| Batch 7 | 77 | — | 481 ms | Revert |
| Batch 8 | 81 | — | — | Revert por CLS 0.061 |
| Batch 9 | 79 | — | 422 ms | Revert |
| Batch 10 | 86 | 3.456 s | 227 ms | Keep |
| Batch 11 final | 88 | 3.004 s | 204 ms | Keep; STOP rule |

## MOBILE BEFORE — MEDIAN OF 3

| Performance | Accessibility | Best Practices | SEO | FCP | LCP | Speed Index | TBT | CLS |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 78 | 100 | 100 | 100 | 1.958 s | 3.833 s | 2.649 s | 362 ms | 0 |

## MOBILE AFTER — MEDIAN OF 3

| Performance | Accessibility | Best Practices | SEO | FCP | LCP | Speed Index | TBT | CLS |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 88 | 100 | 100 | 100 | 1.986 s | 3.004 s | 2.342 s | 204 ms | 0 |

Corridas finales: Performance 91, 88 y 85. La mediana, no el mejor resultado, define el gate.

## DESKTOP BEFORE / AFTER

| Métrica | Before | After |
| --- | ---: | ---: |
| Performance | 97 | NOT RUN |
| Accessibility | 100 | NOT RUN |
| Best Practices | 96 | NOT RUN |
| SEO | 100 | NOT RUN |
| LCP | 0.7 s | NOT RUN |
| TBT | 120 ms | NOT RUN |
| CLS | 0.012 | NOT RUN |

Desktop final no se ejecutó porque el plan lo condiciona a aprobar primero Mobile y Mobile quedó en el rango STOP.

## VISUAL REGRESSION

**PASS.** Revisión automatizada y visual en 1440×900, 1024×768, 390×844 y 360×800; cobertura adicional en 1920×1080, 1366×768, 1200×800, 768×1024 y 430×932. Sin clipping, overlap, overflow, imágenes rotas, secciones ausentes ni cambios de composición significativos.

## INTERACTION REGRESSION

**PASS.** Mouse, touch, teclado, tabs, flechas, hover, click y foco visible validados en Problemas, Integración, Método y Ecosistema. Reduced motion mantiene el contenido visible y evita inicializar el canvas.

## RESPONSIVE QA

**PASS.** HTTP 200, ancho documental correcto, sin errores de consola, requests fallidos o respuestas inválidas. Evidencia completa en `preview/home-v3.4.2-production-release/qa-results.json` y capturas en `preview/home-v3.4.2-production-release/screenshots/`.

## FORM QA

**PASS sin envío real.** Se verificaron el formulario corporativo y los tres flujos VITAIROS-M, incluyendo método, endpoints conservados, `lead_type`, consentimiento requerido, propósito, `privacy_version=2026-10` y tracking. No se transmitieron datos ni se activaron servicios externos.

## REMAINING GAP TO 92

El gap de cuatro puntos se concentra en CSS render-blocking/no utilizado, la fuente oficial y la variabilidad restante de pintura/composición durante el primer viewport. La siguiente intervención razonable sería separar estructuralmente CSS crítico y diferido, con QA visual completo. Alternativamente podría reducirse más el motion/identidad inicial, pero eso sería una concesión visual mayor expresamente prohibida de forma automática por el gate 88–91.

## RELEASE DECISION

- `NEW SHA`: **NOT CREATED**
- `RELEASE READY`: **NO**
- `PRODUCTION STATUS`: **UNCHANGED**
- Push / merge / deploy: **NOT RUN**
- Infrastructure / billing changes: **NONE**

VITAIROS V3.4.2 CONTINÚA DETENIDA POR PERFORMANCE MÓVIL. PRODUCCIÓN NO MODIFICADA.
