# VITAIROS V3.4.2 — diagnóstico de performance móvil

Fecha: 2026-10-19  
Alcance: preview local de la rama `home-v3.4.1-commercial-interaction-fix`  
URL evaluada: `http://127.0.0.1:4173/?preview=v3.4.2`  
Producción: no modificada

## Método

Se ejecutaron tres auditorías Lighthouse Mobile limpias y comparables, usando Microsoft Edge 155 en modo headless, un perfil temporal dedicado, throttling móvil estándar y la misma instancia local. Se usa la mediana como referencia y no el mejor resultado aislado.

| Corrida | Performance | Accessibility | Best Practices | SEO | FCP | LCP | Speed Index | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 72 | 100 | 100 | 100 | 1.958 s | 3.833 s | 3.082 s | 560 ms | 0 |
| 2 | 80 | 100 | 100 | 100 | 1.961 s | 3.836 s | 2.628 s | 294 ms | 0 |
| 3 | 78 | 100 | 100 | 100 | 1.954 s | 3.829 s | 2.649 s | 362 ms | 0 |
| **Mediana** | **78** | **100** | **100** | **100** | **1.958 s** | **3.833 s** | **2.649 s** | **362 ms** | **0** |

Evidencia cruda:

- `preview/home-v3.4.2-production-release/diagnosis-mobile-1.json`
- `preview/home-v3.4.2-production-release/diagnosis-mobile-2.json`
- `preview/home-v3.4.2-production-release/diagnosis-mobile-3.json`
- `preview/home-v3.4.2-production-release/diagnosis-trace-report-0.trace.json`

## TOP 5 de causas raíz medidas

### 1. Animación continua de la esfera durante la ventana crítica

El trace de la corrida mediana registra 145 ciclos de `FireAnimationFrame`, 301,70 ms acumulados en el hilo principal. La función `loop` de la esfera aparece directamente en el trace y el canvas continúa activo mientras cualquiera de las secciones `#inicio` o `#brecha` esté visible. En móvil, esto prolonga el trabajo de canvas bastante más allá de la esfera visible. Además, el DPR se limita a 1,5, pero no existe límite de FPS móvil.

Impacto: scripting, render y pintura compiten con LCP y con la estabilización inicial.

### 2. Trabajo JavaScript y de layout aplicado a contenido fuera de pantalla

Lighthouse atribuye 5,17 s simulados de trabajo del hilo principal: 2,138 s a Style & Layout, 1,685 s a Other y 929 ms a Script Evaluation. `homepage.js` concentra 3,856 s de CPU total simulada y 904 ms de evaluación. En la carga se ejecutan mediciones de layout para Método y Principios aunque están debajo del fold; además, el sistema de reveal recorre todos los elementos en scroll y vuelve a activar todos mediante un temporizador global.

Impacto: lecturas de layout, mutaciones de clases y recalculo de estilos no necesarios para el primer viewport. Lighthouse modela un long task de 412 ms atribuido a `homepage.js`.

### 3. CSS único, bloqueante y sobredimensionado para el primer viewport

La hoja `assets/homepage.css` transfiere 137.730 bytes y Lighthouse estima 56.923 bytes no utilizados durante la carga inicial (41,39 %), con un ahorro potencial de 300 ms en FCP/LCP. Es el recurso bloqueante principal y contiene estilos de todas las secciones, estados, modales y animaciones de la página.

Impacto: demora de render inicial y mayor costo de Style & Layout. En esta iteración se prioriza contener el trabajo fuera de pantalla sin reestructurar visualmente toda la hoja.

### 4. El LCP es la marca animada del brand intro

El elemento LCP medido es `.intro-mark__official`, la imagen PNG de 512 px dentro del SVG de apertura. Transfiere 93.904 bytes, se descubre temprano y termina de cargar rápidamente, pero llega con prioridad `Medium`, no tiene `fetchpriority=high` y su presentación depende de una animación con opacidad, escala y `drop-shadow`. El desglose del LCP registra 370 ms de element render delay en el trace observado.

Impacto: la señal visual más importante queda ligada a efectos de composición durante la ventana crítica. La optimización debe conservar la secuencia de marca y reducir su competencia con tareas no esenciales.

### 5. Recursos e interfaces de secciones posteriores se inicializan de inmediato

La primera navegación solicita 508.582 bytes en 11 requests. Además del recurso LCP y la fuente, carga imágenes de proyectos que están varios viewports más abajo. Los componentes de Método, Ecosistema, Principios, redes ambientales, noticias y formulario registran listeners, observers, estados y estilos durante el arranque. No hay terceros y no hay ahorro por `font-display`; por tanto, el costo es controlable dentro del código propio.

Impacto: transferencia y trabajo inicial sin beneficio para el primer viewport móvil.

## Hallazgos descartados como causa principal

- Terceros: 0 recursos y 0 ms de trabajo de terceros.
- Fuentes duplicadas: no existen; se usa una sola variable font Outfit, 111.089 bytes, con `font-display: swap` y preload.
- Layout shift: CLS 0.
- JavaScript muerto: Lighthouse no reporta ahorro relevante por unused JavaScript.
- Cantidad de requests: solo 11; el problema dominante es CPU/render, no proliferación de solicitudes.

## Hipótesis de intervención, en orden

1. Dormir la esfera fuera del hero, limitar el canvas móvil a 30 FPS y DPR 1 sin cambiar su geometría ni interacción.
2. Eliminar el fallback redundante del reveal cuando existe IntersectionObserver y activar Método/Principios solo cerca del viewport.
3. Aplicar contención de render a secciones posteriores con `content-visibility: auto` e intrinsic sizes estables.
4. Dar prioridad explícita al recurso LCP y diferir imágenes realmente inferiores al fold.
5. Solo si las mediciones lo exigen, reducir efectos móviles costosos conservando composición, contenido y lenguaje de marca.

Cada lote se valida con tres corridas Lighthouse Mobile y se conserva únicamente si mejora la mediana sin regresiones visuales o funcionales.

## Confirmación posterior del diagnóstico

Antes de optimizar el recurso se confirmó el LCP directamente con `PerformanceObserver`: el elemento era el `image` SVG de `.intro-mark__official`, servido desde `/conecta/assets/vitairos-isotipo-512.png`, con `renderTime` 672 ms, `loadTime` 281 ms y 108.900 px² renderizados. Esto confirmó que la prioridad 4 era real y justificó optimizar la misma fuente oficial a 320×320 sin recrear la marca.

El cierre completo de la recuperación, con cambios conservados y revertidos, está documentado en `docs/VITAIROS_V3_4_2_MOBILE_PERFORMANCE.md`. La mediana final fue 88; por la regla 88–91 se detuvo el trabajo sin commit ni modificación de producción.
