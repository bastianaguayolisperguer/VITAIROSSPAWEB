# VITAIROS-M V2.2.2 — Experience & motion final polish

Fecha: 2026-10-15 (America/Santiago)

## STATUS

**COMPLETADO — LISTO PARA VALIDACIÓN VISUAL HUMANA. DEMAND MVP NO INICIADO.**

Intervención limitada a experiencia, movimiento, ritmo vertical y densidad visual de V2.2.1. No se modificaron la identidad de marca, el H1, los claims, la narrativa central, el endpoint del formulario, la lógica de privacidad, SEO, Open Graph ni infraestructura. No hubo push, merge ni despliegue.

## BASE SHA

`1fe9e684957eb5423f56e8bfc0fef00c1026529f`

Rama verificada: `vertical-v2/vitairos-m`.

## NEW SHA

`HEAD` del commit local `Enhance VITAIROS-M V2 motion and visual rhythm`.

El SHA hexadecimal se informa en la entrega final. Un archivo incluido en un commit no puede contener de forma estable el hash del mismo commit porque ese contenido participa en el cálculo del hash.

## INTRO

- Se añadió una secuencia de primera visita de aproximadamente `1,3 s`: nodos → conexiones → logo oficial → hero.
- El logo utiliza `assets/vitairos-m-logo.png` sin alteración.
- La visita queda registrada en `sessionStorage`; una recarga dentro de la sesión no repite el intro.
- Con `prefers-reduced-motion: reduce`, el intro se omite y el contenido aparece completo de inmediato.
- No se introdujeron fondos negros, glitches, estética cyber ni una identidad paralela.

## NAV LOGO FIX

El header mantiene una superficie blanca continua tanto en reposo como al hacer scroll. El logo oficial ya no se percibe como una pieza montada sobre un fondo de tono diferente; el estado scrolled conserva blur suave y contraste estable.

## MOTION SYSTEM

Sistema implementado con CSS, SVG y JavaScript nativo:

- lenguaje visual de continuidad, conexión y flujo;
- `IntersectionObserver` para activar movimiento solo cuando cada módulo está visible;
- loops SVG pausados fuera de viewport;
- pulso viajero y halos secuenciales en el orbit del hero;
- red ambiental lenta y de bajo contraste;
- entrada escalonada en brecha, circuito y seguridad;
- estados finales completos bajo reduced motion;
- sin scroll-jacking, parallax agresivo ni dependencias nuevas.

## CONTENT VALUE AUDIT

### Esencial

Hero, La brecha, Continuity Loop, perspectivas Persona/Profesional, Seguridad y criterio, y Estado del producto. Son los módulos que explican propósito, diferencia, límites y madurez real del producto.

### Supporting

Ecosistema VITAIROS, Contacto y ayuda inmediata del footer. Aportan contexto corporativo, conversión y resguardo sin competir con el relato central.

### Redundante

No se eliminó contenido. Las repeticiones percibidas se resolvieron mediante compacción, jerarquía y ritmo vertical porque los textos cumplen funciones distintas dentro del recorrido.

## SECTIONS COMPACTED

- Brecha: tarjetas de `270 px` a `220 px`, menos margen previo a la cita y rail secuencial.
- Perspectivas: panel de `670 px` a `620 px`, menor padding y listas de `78 px` a `70 px`.
- Seguridad: tarjetas de `250 px` a `190 px` en desktop y de `220 px` a `170 px` en responsive; copy y sello también compactados.
- Estado: tarjetas de `450 px` a `365 px`, menos padding y menor separación entre título y lista.
- Ecosistema: tarjetas de `240 px` a `195 px` en desktop y de `215 px` a `185 px` en móvil; heading y paddings reducidos. La reducción compuesta de sección queda cercana al 25% en desktop.

## QUOTE FIX

La cita ahora tiene comillas de apertura y cierre visibles, composición simétrica y altura verificada de `230 px` en desktop y `190 px` en móvil. Conserva exactamente el texto aprobado.

## VERTICAL RHYTHM

El espacio global de sección pasó de `clamp(96px, 10vw, 160px)` a `clamp(82px, 7.5vw, 118px)`. En tablet se redujo a `clamp(72px, 8vw, 96px)` y en móvil a `72 px`. Seguridad, Estado y Ecosistema recibieron ajustes específicos para sostener el ritmo sin vacíos prolongados.

## CONTINUITY LOOP

La animación presenta primero el centro, luego traza la ruta, revela seis nodos en secuencia y finalmente activa un pulso viajero. En móvil se conserva el spine vertical V2.2.1, ahora con pulso sobre la misma ruta. No se bloquea ni se manipula el scroll.

## PERSONA / PROFESSIONAL

Los tabs mantienen roles, `aria-selected`, `aria-controls`, navegación por flechas, Home/End y foco. El cambio de panel usa opacidad y traslación vertical corta durante `380 ms`; reduced motion lo convierte en un cambio inmediato.

## SAFETY

La sección oscura conserva todos los límites clínicos y el criterio humano. Se redujeron altura, padding y separación, y los tres límites aparecen en secuencia al entrar en viewport. No se modificó ningún claim ni salvaguarda.

## PRODUCT STATE

Se mantuvo la distinción entre base actual y próxima etapa. El módulo se compactó mediante tarjetas más bajas, jerarquía tipográfica más contenida y menor separación interna, sin presentar funciones futuras como disponibles.

## ECOSYSTEM

Se preservaron las tres iniciativas y sus enlaces. La sección es más compacta y cada tarjeta mantiene el motivo de red, ahora con una microinteracción accesible por hover y `focus-visible`.

## QA

Comando: `node tests/vitairos-m-v2-2-2-experience-qa.mjs`

Viewports verificados:

1. `1920 × 1080`
2. `1440 × 900`
3. `1366 × 768`
4. `1024 × 768`
5. `768 × 1024`
6. `430 × 932`
7. `390 × 844`
8. `360 × 800`

Resultado: **8/8 PASS**.

- overflow horizontal: 0;
- clipping de contenedores: 0;
- colisiones del loop móvil: 0;
- errores de consola: 0;
- requests fallidas: 0;
- imágenes rotas: 0;
- referencias ARIA faltantes: 0;
- IDs duplicados: 0;
- controles sin etiqueta: 0;
- objetivos primarios menores a 44 px: 0;
- jerarquía de headings: sin saltos;
- menú, tabs y modal: teclado, Escape y restauración de foco correctos;
- reduced motion: intro omitido, animaciones neutralizadas y contenido completo;
- FormSubmit: endpoint y payload interceptados localmente, sin envío real;
- SEO, canonical, Open Graph, Twitter Card y JSON-LD: preservados.

Resultado detallado: `preview/vitairos-m-v2-2-2-experience-review/qa-results.json`.

## LIGHTHOUSE

Ejecución local contra `http://127.0.0.1:4174/vitairos-m/` con Edge headless.

| Métrica | V2.2.2 | Objetivo | Resultado |
| --- | ---: | ---: | --- |
| Performance | 97 | ≥ 92 | Cumple baseline |
| Accessibility | 100 | 100 preferido / ≥ 98 | Cumple |
| Best Practices | 100 | 100 | Cumple |
| SEO | 100 | 100 | Cumple |
| LCP | 2,4 s | ≤ 2,4 s | Cumple |
| CLS | 0 | 0 | Cumple |
| TBT | 0 ms | 0 ms | Cumple |

Reporte completo: `preview/vitairos-m-v2-2-2-experience-review/lighthouse-report.json`.

## SCREENSHOTS

Directorio: `preview/vitairos-m-v2-2-2-experience-review/`

1. `01-intro-nodes.png`
2. `02-intro-logo.png`
3. `03-hero-desktop.png`
4. `04-hero-mobile.png`
5. `05-brecha.png`
6. `06-cita.png`
7. `07-continuity-before.png`
8. `08-continuity-complete.png`
9. `09-persona.png`
10. `10-profesional.png`
11. `11-seguridad.png`
12. `12-estado.png`
13. `13-ecosistema.png`
14. `14-contacto.png`
15. `15-full-desktop.png`
16. `16-full-mobile.png`

Total: **16 capturas exactas**.

La grabación WebM/MP4 no se produjo: Playwright requiere un binario FFmpeg no disponible localmente. Se respetó la instrucción de no instalar software únicamente para generar el video.

## REMAINING ISSUES

No quedan hallazgos automáticos ni problemas visuales bloqueantes dentro del alcance V2.2.2. La evaluación estética final del movimiento y del ritmo permanece como validación humana. El video es la única evidencia opcional no generada por la limitación local documentada.

No se inició lista de interés, Demand MVP, backend de IA, D1, Turnstile, UTMs, despliegue ni infraestructura adicional.

## RECOMMENDATION

Presentar V2.2.2 para validación visual humana con las 16 capturas y el preview local. Mantener Demand MVP detenido hasta aprobación explícita.
