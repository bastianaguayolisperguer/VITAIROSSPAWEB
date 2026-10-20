# VITAIROS V3.4.2 — Critical CSS Performance

Fecha: 2026-10-20  
Rama: `home-v3.4.1-commercial-interaction-fix`  
PERFORMANCE_BASE_SHA: `b08aa0dfdab078e2e88db88b409299cba8e36a41`  
FINAL_RELEASE_SHA: `32c8d95ad5ad3af77cfc0b768a0c46f65526f074`  
Commit de release: `Refactor VITAIROS critical CSS for mobile performance`

## Resultado ejecutivo

**PERFORMANCE GATE: PASS**

- Lighthouse Mobile final: mediana **92**, con cinco corridas 92/92/92/92/92.
- Accessibility / Best Practices / SEO: **100 / 100 / 100** en las cinco corridas.
- Lighthouse Desktop final: mediana **100**, con tres corridas 100/100/100.
- Lighthouse Mobile CLS: **0** en las cinco corridas.
- QA visual, responsive, interacciones, reduced motion, fallback sin JavaScript y contratos de formularios: **PASS**.
- Producción, Cloudflare, DNS, endpoints y payloads: **sin cambios**.
- No se hizo push, merge ni deploy.

## Preservación del baseline

Antes de modificar CSS se auditó el working tree completo y se creó el checkpoint requerido:

`b08aa0dfdab078e2e88db88b409299cba8e36a41` — `Preserve validated VITAIROS mobile performance optimizations`

Ese commit conserva DPR móvil, esfera a máximo perceptual de 30 FPS, pausa por visibilidad, inicialización diferida, IntersectionObserver, eliminación de reveal redundante, content-visibility, lazy/async images, intro móvil de 720 ms, isotipo oficial de 320 px y preload/fetchpriority del LCP.

## CSS architecture before

- Una única hoja bloqueante: `assets/homepage.css`.
- Tamaño sin comprimir: **137.912 bytes**.
- Mezcla de base, header, hero, secciones inferiores, responsive, estados, animaciones y legacy V3.1–V3.4.1.
- CSS no utilizado en el primer viewport según Lighthouse del baseline final: **96.000 bytes**.
- Diagnóstico previo: aproximadamente 69 % sin uso inicial y hasta 840 ms de ahorro potencial estimado.

## CSS architecture after

- `assets/homepage-critical.css`: **96.865 bytes**, único stylesheet bloqueante.
- `assets/homepage-deferred.css`: **52.608 bytes**, descargado como `media="print"` y aplicado antes de que contenido inferior pueda entrar en viewport.
- El antiguo `assets/homepage.css` fue retirado; no queda una tercera hoja monolítica cargable.
- Las 4.041 declaraciones del origen quedaron asignadas exactamente una vez durante el split. El mayor tamaño combinado se debe al overhead de repetir selectores/delimitadores al dividir reglas por propiedad, no a declaraciones duplicadas.
- El CSS diferido se activa por primer wheel/touch/pointer, teclas de scroll, URL con hash, scroll restaurado o intersección de `#brecha`.
- `<noscript>` carga la hoja completa. `html.no-js` mantiene visibles los contenidos `reveal` si la ejecución de scripts falla.

La separación por componentes completos se descartó porque dejaba estilos y contraste inferiores incompletos durante la carga. La solución final conserva en critical toda geometría, tipografía, color y accesibilidad necesarias; difiere decoración, sombras, transforms, transiciones y motion secundario.

## Comparación Mobile median

| Métrica | Baseline aprobado | Final | Cambio |
| --- | ---: | ---: | ---: |
| Performance | 88 | 92 | +4 puntos |
| Accessibility | 100 | 100 | 0 |
| Best Practices | 100 | 100 | 0 |
| SEO | 100 | 100 | 0 |
| FCP | 1.986 ms | 1.802 ms | −184 ms |
| LCP | 3.004 ms | 3.152 ms | +148 ms |
| Speed Index | 2.342 ms | 1.802 ms | −540 ms |
| TBT | 204 ms | 38 ms | −166 ms |
| CLS | 0 | 0 | 0 |
| Main thread | 2.218 ms | 1.137 ms | −1.081 ms |
| Style & Layout | 1.053,4 ms | 363,1 ms | −690,3 ms |
| Transfer total | 378.087 bytes | 391.881 bytes | +13.794 bytes |
| Lighthouse unused CSS | 96.000 bytes | 114.164 bytes | +18.164 bytes |

El objetivo ideal LCP ≤2,5 s no se alcanzó. El gate mejora porque disminuyeron de forma sustancial TBT, Speed Index, main-thread y Style & Layout sin alterar el elemento LCP ni la jerarquía visual.

### Render blocking

- Before: una hoja bloqueante de **137.912 bytes**.
- After: una hoja bloqueante de **96.865 bytes**.
- Reducción bloqueante: **41.047 bytes (29,8 %)**.
- La versión de Lighthouse usada no emitió `render-blocking-resources.overallSavingsMs`; por eso no se inventa una cifra after. El árbol de dependencias final muestra únicamente `homepage-critical.css` en la cadena bloqueante.

### Interpretación de unused CSS y transferencia

Lighthouse cuenta la hoja `media="print"` descargada pero todavía no aplicable como CSS no utilizado. Por eso el valor de bytes unused y la transferencia total suben aunque el trabajo real de estilos inicial baje: Style & Layout cae de 1.053,4 a 363,1 ms y main-thread de 2.218 a 1.137 ms. Retrasar también la descarga reduciría transferencia/coverage, pero elevaría el riesgo de flash al primer scroll; no se aplicó porque el gate ya pasa y la prioridad es preservar la experiencia.

## Batches medidos

| Batch | Intervención | Mobile x3 / mediana | Decisión |
| --- | --- | --- | --- |
| 1 | Split por componentes + promoción inmediata | 76 | Revertido |
| 2 | Split por componentes + `media=print` por intención | 73; A11y 94 | Revertido |
| 3 | Split por propiedades + aplicación inmediata | 55 | Revertido |
| 4 | Eliminación aislada de 47 clases legacy sin referencia | 57 | Revertido |
| Recheck | Checkpoint exacto en el entorno actual | 60/88/81; mediana 81 | Diagnóstico de variabilidad; baseline aprobado sigue siendo 88 |
| 5 | Estructura crítica + decoración por primera intención | 82/92/91; mediana 91; A11y 97 | Ajustado solo por contraste/ownership |
| Final | Split por propiedad, contraste AA y fallback no-JS | 92/92/92/92/92; mediana 92 | Retenido |

No se retuvo ninguna eliminación legacy: el batch dedicado empeoró la medición. No se tocó Outfit, esfera, DPR, FPS, densidad, rutas ni asset 320 px.

## Mobile final — cinco corridas limpias

| Run | Perf | A11y | BP | SEO | FCP | LCP | SI | TBT | CLS | Main thread |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 92 | 100 | 100 | 100 | 1.802 ms | 3.152 ms | 1.802 ms | 42 ms | 0 | 1.255 ms |
| 2 | 92 | 100 | 100 | 100 | 1.802 ms | 3.152 ms | 1.802 ms | 47 ms | 0 | 1.177 ms |
| 3 | 92 | 100 | 100 | 100 | 1.802 ms | 3.152 ms | 1.802 ms | 34 ms | 0 | 1.087 ms |
| 4 | 92 | 100 | 100 | 100 | 1.802 ms | 3.152 ms | 1.802 ms | 33 ms | 0 | 1.103 ms |
| 5 | 92 | 100 | 100 | 100 | 1.802 ms | 3.152 ms | 1.802 ms | 38 ms | 0 | 1.137 ms |
| **Mediana** | **92** | **100** | **100** | **100** | **1.802 ms** | **3.152 ms** | **1.802 ms** | **38 ms** | **0** | **1.137 ms** |

Evidencia: `preview/home-v3.4.2-critical-css-phase2/final-mobile/`.

## Desktop final — tres corridas limpias

| Run | Perf | A11y | BP | SEO | FCP | LCP | SI | TBT | CLS | Main thread |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 468 ms | 642 ms | 787 ms | 11 ms | 0,0117 | 745 ms |
| 2 | 100 | 100 | 100 | 100 | 469 ms | 642 ms | 788 ms | 13 ms | 0,0117 | 756 ms |
| 3 | 100 | 100 | 100 | 100 | 469 ms | 643 ms | 814 ms | 11 ms | 0,0117 | 791 ms |
| **Mediana** | **100** | **100** | **100** | **100** | **469 ms** | **642 ms** | **788 ms** | **11 ms** | **0,0117** | **756 ms** |

Evidencia: `preview/home-v3.4.2-critical-css-phase2/final-desktop/`.

## Visual regression y carga

PASS en 1920×1080, 1440×900, 1366×768, 1200×800, 1024×768, 768×1024, 430×932, 390×844 y 360×800.

- HTTP 200, sin overflow horizontal, imágenes rotas, IDs duplicados, labels cortados, reveals bloqueados, errores de consola, requests fallidos o respuestas 4xx/5xx.
- Isotipo oficial VITAIROS-M conservado en 166×166, `object-fit:contain`, sin filtros ni cambios de opacidad.
- Inspección directa de hero móvil, Integración móvil, Método móvil y página desktop completa: sin pérdida de riqueza, tipografía, espaciado o contenido.
- Capturas before/after disponibles en `preview/home-v3.4.2-production-release/screenshots/` y `preview/home-v3.4.2-critical-css-phase2/visual-qa/screenshots/`.
- Test de carga con red móvil y CPU 4×: capturas a 0, 100, 300, 500, 1.000, 2.000 y 3.000 ms en 390×844 y 360×800; geometría estable, sin overflow ni CLS adicional; la hoja diferida activa antes del primer desplazamiento visible.
- Fallback sin JavaScript: contenido visible, hoja completa presente y sin overflow.

## Interaction QA

PASS:

- Problemas: mouse, teclado por flechas y touch.
- Integración: cinco capacidades, mouse, teclado y touch.
- Método: cuatro etapas.
- Ecosistema: cuatro iniciativas, mouse, teclado y touch.
- Focus visible: outline sólido de 2 px.
- Reduced motion: media query activa, esfera en fallback, contenido visible y ancho estable.

## Form QA

PASS sin envíos reales:

- Home corporativa: action, POST, consentimiento obligatorio y `privacy_version=2026-10` intactos.
- VITAIROS-M persona, professional e institution: tres contratos presentes, endpoints aceptados, consentimiento obligatorio, propósito y payload keys intactos.
- No se modificaron endpoints ni payloads.

## Known issues

1. LCP Mobile final es 3,152 s, 148 ms mayor que el baseline aprobado y por encima del objetivo ideal de 2,5 s. El gate pasa por la reducción de TBT, Speed Index y trabajo de main-thread. Reducirlo más requeriría intervenir Outfit/asset/hero, fuera del alcance conservador de esta fase.
2. El audit Lighthouse de unused CSS sube porque incluye el recurso `media=print` ya transferido. Evitar esa descarga inicial exigiría carga dinámica por sección y aumentaría el riesgo de flash en scroll rápido.
3. Lighthouse Desktop registra CLS 0,0117, dentro del rango “good” y sin regresión visual observada. Mobile final permanece en CLS 0.
4. La emulación CDP de red móvil/CPU 4× observa un font swap inicial de Outfit antes del primer snapshot (CLS acumulado 0,0133–0,0149); desde 0 hasta 3 s y al activar deferred no se añade CLS. No se creó subset ni se alteró la identidad tipográfica, conforme al alcance.

## Release status

RELEASE READY: **YES**  
PRODUCTION: **UNCHANGED**  
PUSH: **NOT RUN**  
MERGE: **NOT RUN**  
DEPLOY: **NOT RUN**

VITAIROS V3.4.2 SUPERÓ EL GATE DE PERFORMANCE Y ESTÁ LISTA PARA RELEASE CONTROLADO. PRODUCCIÓN NO MODIFICADA.
