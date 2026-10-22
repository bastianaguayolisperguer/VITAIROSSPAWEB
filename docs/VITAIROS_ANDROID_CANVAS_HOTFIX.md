# VITAIROS Android Canvas Hotfix

## Estado

**HOTFIX IMPLEMENTADO — VALIDACIÓN ANDROID FÍSICO PENDIENTE.**

- Fecha de validación local: 2026-10-21
- Rama: `hotfix/android-canvas-transparency`
- Base aprobada: `e4703f6fbda4f3ceccb9fe4fc74168756fd6fbaa`
- HOTFIX_SHA: `5396630205f484fc6059a2bdb4059e8e2211e1c3`
- Producción: no modificada
- Push, merge y deploy: no realizados

## Incidencia y alcance

En Chrome sobre algunos dispositivos Android físicos, la esfera Canvas del hero podía aparecer dentro de un rectángulo negro u opaco y mostrar defectos de repintado/composición después de hacer scroll o al volver al navegador. El problema no estaba reproducido en escritorio, iPhone ni emulación de escritorio ordinaria.

La hipótesis de causa —todavía no demostrable sin el dispositivo afectado— es una interacción entre `desynchronized: true`, la superficie Canvas con alfa y el compositor/GPU de Chromium Android. El hotfix elimina únicamente esa preferencia de baja latencia y explicita un fondo CSS transparente.

## Antes y después

Contexto Canvas, `assets/homepage.js:106`:

```js
// Antes
canvas.getContext('2d', { alpha: true, desynchronized: true });

// Después
canvas.getContext('2d', { alpha: true });
```

Fondo Canvas, `assets/homepage-critical.css:138`:

```css
/* Antes */
#vitairos-geo { z-index: 2; }

/* Después */
#vitairos-geo { z-index: 2; background: transparent; }
```

No se modificaron el ciclo de dibujo, `clearRect`, `requestAnimationFrame`, DPR, límite móvil cercano a 30 FPS, pausa por visibilidad, `IntersectionObserver`, geometría, rutas, nodos, copy, formularios, SEO ni Cloudflare.

## Transición y capas

- Estado inicial móvil: `.show-fallback`, fallback con opacidad `0.74`.
- Después del primer intento de interacción/scroll: `.canvas-ready`, `.show-fallback` eliminado y fallback con opacidad `0`.
- `#vitairos-geo`: `z-index: 2`, fondo computado `rgba(0, 0, 0, 0)`.
- `.project-node-layer`: `z-index: 5`.
- Glow, fallback, caption y anillos mantienen su orden y fondo transparente.
- El píxel de esquina del Canvas quedó en `[0, 0, 0, 0]` en todas las corridas.
- No se reordenó ninguna capa.

## QA de escritorio

Microsoft Edge/Chromium pasó en:

- `1440 × 900`
- `1024 × 768`
- `390 × 844` emulado

Resultados: HTTP 200, esfera visualmente consistente, sin rectángulo opaco, transición correcta, scroll abajo/arriba, refresh e interacción correctos, sin errores de consola/red y sin overflow horizontal.

Google Chrome no tiene un ejecutable instalado utilizable en el equipo. Firefox sólo expone el alias de Microsoft Store y no existe un binario ejecutable instalado; por ello no se declararon pruebas en esos navegadores.

## Android

Emulación Pixel 7 / Android 14 (`412 × 915`, DPR `2.625`, touch y UA móvil) aprobada para:

- primera carga y fallback inicial;
- activación del Canvas después de intención del usuario;
- refresh;
- scroll abajo y arriba;
- interacción táctil;
- ciclo de background/foreground emulado con estado `frozen → active`;
- fondo transparente y contexto 2D con alfa;
- ausencia visual de rectángulo negro en capturas.

**EMULACIÓN DESKTOP NO VALIDA GPU/COMPOSITOR ANDROID REAL.**

### Gate físico pendiente

No había un dispositivo Android físico conectado/controlable durante esta ejecución. Antes de cualquier release se debe repetir en Chrome Android físico:

1. primera carga;
2. refresh;
3. scroll abajo y arriba;
4. interacción con la esfera;
5. rotación/animación;
6. navegador a segundo plano y regreso;
7. confirmar cero rectángulos negros, ghosting, flashes opacos o pérdida de transparencia.

Durante la sesión local se verificó una vista previa temporal en `http://192.168.1.84:4173/?preview=android-canvas-hotfix`. Esta URL depende del servidor local y de que el teléfono esté en la misma red Wi-Fi.

## iPhone

El viewport `390 × 844` con UA de iPhone pasó visualmente en Chromium: fallback, Canvas, transparencia, animación y layout correctos. Esto **no equivale a Safari/WebKit físico**. La regresión en iPhone Safari físico queda pendiente por falta de un dispositivo Safari controlable en esta ejecución.

## Rendimiento

Lighthouse móvil local, tres corridas:

| Corrida | Performance | Accessibility | Best Practices | SEO |
| --- | ---: | ---: | ---: | ---: |
| 1 | 91 | 100 | 100 | 100 |
| 2 | 90 | 100 | 100 | 100 |
| 3 | 92 | 100 | 100 | 100 |

- Mediana Performance: `91` (objetivo `>= 90`; baseline de producción informado: `93`).
- Mínimos: Accessibility `100`, Best Practices `100`, SEO `100`.
- CLS: `0.000` en las tres corridas.
- LCP: ~`3152–3153 ms`.
- No se detectó una regresión material atribuible al hotfix.

## Reduced motion

Con `prefers-reduced-motion: reduce`:

- `.fallback-only` activo;
- fallback visible con opacidad `0.74`;
- Canvas oculto (`display: none`);
- layout sin overflow horizontal.

## Smoke tests

Las rutas siguientes respondieron HTTP 200, conservaron un único `h1`, no tuvieron overflow horizontal y sus recursos HTTP respondieron correctamente:

- `/`
- `/vitairos-m/`
- `/vitairos-industrial-ai/`
- `/agro-intelligence/`
- `/conecta/`

Los formularios de `/` y `/vitairos-m/` se inspeccionaron estructuralmente. **No se realizó ningún envío real.**

También pasaron:

- `node --check assets/homepage.js`
- `node tests/homepage-smoke.mjs`
- `node tests/homepage-resource-budget.cjs`
- `git diff --check`

## Gate de diff y regresiones

El commit funcional modifica únicamente:

- `assets/homepage.js`: una propiedad eliminada del contexto Canvas.
- `assets/homepage-critical.css`: una declaración explícita de transparencia.

Diff funcional: `2 insertions`, `2 deletions`. No hay cambios en HTML, copy, verticales, formularios, SEO, routing, activos ni configuración Cloudflare.

Capturas y resultados automatizados locales:

- `C:\Users\basti\AppData\Local\Temp\vitairos-android-canvas-hotfix\screenshots`
- `C:\Users\basti\AppData\Local\Temp\vitairos-android-canvas-hotfix\qa-results.json`
- `C:\Users\basti\AppData\Local\Temp\vitairos-android-canvas-hotfix\lighthouse-mobile-1.json`
- `C:\Users\basti\AppData\Local\Temp\vitairos-android-canvas-hotfix\lighthouse-mobile-2.json`
- `C:\Users\basti\AppData\Local\Temp\vitairos-android-canvas-hotfix\lighthouse-mobile-3.json`

## Cierre

El cambio está implementado y validado localmente, pero no se puede declarar corregido en Android real hasta superar el gate físico. Producción continúa exactamente en la base aprobada y no se creó ni activó infraestructura cloud.
