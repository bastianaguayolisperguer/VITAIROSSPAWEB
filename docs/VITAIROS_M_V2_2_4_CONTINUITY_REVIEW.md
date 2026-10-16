# VITAIROS-M V2.2.4 — Continuity narrative review

Fecha: 2026-10-15 (America/Santiago)

## STATUS

**COMPLETADO — LISTO PARA VALIDACIÓN VISUAL HUMANA.**

Intervención limitada a la intro de primera visita, el circuito de continuidad, el bloque Orientarse / Dar contexto / Sostener continuidad, el orden y jerarquía del ecosistema, y una compactación menor de ritmo vertical. Demand MVP no fue iniciado. No hubo push, merge, deploy ni cambios en producción, Cloudflare, DNS o infraestructura.

## BASE SHA

`b7ee9481dc003687b2486ecbe12504fb67f7b9b2`

Rama verificada: `vertical-v2/vitairos-m`.

## NEW SHA

`HEAD` del commit local `Refine VITAIROS-M growth and continuity narrative`.

El SHA hexadecimal se informa en la entrega final. Un archivo incluido en un commit no puede contener de forma estable el hash del mismo commit porque ese contenido participa en el cálculo del hash.

## INTRO

- Se eliminó completamente la intro abstracta anterior y su cálculo de traslado al logo del header.
- La secuencia comienza en una “V” verde que funciona como semilla visual.
- Desde esa base crecen tallo, ramificaciones, nodos y corona circular mediante SVG y CSS nativo.
- El cierre usa el isotipo exacto recortado desde `assets/vitairos-m-logo.png`; no se inventó ni se reemplazó la marca.
- Un filtro SVG elimina únicamente el fondo blanco del PNG durante la intro, conservando los píxeles oficiales del isotipo.
- La transición final funde la escena con el hero sin desplazar layout ni ocultar el logo real del header.
- Duración total: `1,92 s`.
- Primera visita por sesión mediante `sessionStorage`; recarga y segunda navegación no repiten la intro.
- Con `prefers-reduced-motion: reduce`, la intro se omite por completo.

## LOOP DE CONTINUIDAD

- La ruta SVG permanece cerrada y ahora muestra cuatro tramos direccionales visibles más un pulso que recorre el circuito completo.
- El recorrido editorial queda explícito: Persona → Contexto → Síntesis consentida → Profesional → Ajuste del acompañamiento → Retorno a la persona.
- Se añadió la señal “Valor que vuelve” en desktop y un cierre explícito “El recorrido vuelve a la persona” en tablet/mobile.
- El wording mantiene consentimiento, criterio humano y propósito, sin presentar automatización clínica autónoma.

## ORIENTARSE / DAR CONTEXTO / SOSTENER CONTINUIDAD

- La franja incorpora una cordillera blanca de dos planos, integrada en un fondo menta/celeste de bajo contraste.
- Un ave lineal recorre la parte superior en un ciclo lento de `18 s` mediante una sola transformación CSS.
- La animación no bloquea scroll, no cubre contenido y se neutraliza con reduced motion.
- Se mantuvieron intactos los tres textos aprobados y la secuencia antes / entre / después.

## ECOSISTEMA

- “Una iniciativa de VITAIROS SpA” se movió después del contacto, inmediatamente antes del footer.
- La sección pasó a una composición compacta de apoyo corporativo.
- Las tres iniciativas conservan nombre, categoría, descripción y enlace.
- No se inventaron logos separados inexistentes; se usan lockups tipográficos sobrios.
- Altura verificada: `264–276 px` en desktop, `317–333 px` en tablet y `602 px` en mobile apilado.

## AUDITORÍA DE DENSIDAD

- El espaciado global de sección bajó de `clamp(82px, 7.5vw, 118px)` a `clamp(76px, 6.5vw, 104px)`.
- En mobile pasó de `72 px` a `68 px`.
- El ecosistema dejó de competir con el cuerpo narrativo.
- No se añadieron decoraciones sin función fuera del paisaje solicitado y las señales de retorno.

## QA

Comando: `node tests/vitairos-m-v2-2-4-continuity-qa.mjs`

Viewports verificados:

1. `1920 × 1080`
2. `1440 × 900`
3. `1366 × 768`
4. `1024 × 768`
5. `768 × 1024`
6. `430 × 932`
7. `390 × 844`
8. `360 × 800`

Resultado: **8/8 PASS, 0 fallos**.

- overflow horizontal: 0;
- clipping de contenedores: 0;
- colisiones del loop desktop: 0;
- errores de consola: 0;
- requests fallidas: 0;
- imágenes rotas: 0;
- referencias ARIA faltantes: 0;
- IDs duplicados: 0;
- controles sin etiqueta: 0;
- targets visibles menores a 44 px: 0;
- intro de primera visita: correcta;
- intro en misma sesión: no se repite;
- reduced motion: intro omitida, pulsos detenidos y contenido visible;
- transición al hero: completa;
- CLS medido durante intro: `0,00022`;
- formulario, consentimiento, SEO, canonical y H1: preservados;
- teclado: menú móvil, Escape, restauración de foco y tabs correctos.

Resultado detallado: `preview/vitairos-m-v2-2-4-continuity-review/qa-results.json`.

## LIGHTHOUSE

Ejecución local contra `http://127.0.0.1:4174/vitairos-m/` con Microsoft Edge headless. La medición incluye la intro de primera visita.

| Métrica | Resultado |
| --- | ---: |
| Performance | 93 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| LCP | 2,6 s |
| CLS | 0 |
| TBT | 0 ms |
| FCP | 2,0 s |
| Speed Index | 4,5 s |

Reporte completo: `preview/vitairos-m-v2-2-4-continuity-review/lighthouse-report.json`.

## SCREENSHOTS

Directorio: `preview/vitairos-m-v2-2-4-continuity-review/`

1. `01-intro-start-v.png`
2. `02-intro-flower-growth.png`
3. `03-intro-circle-closure.png`
4. `04-intro-hero-transition.png`
5. `05-hero-final.png`
6. `06-loop-closed.png`
7. `07-orient-context-continuity.png`
8. `08-ecosystem-closing.png`
9. `09-full-desktop-1440x900.png`
10. `10-full-mobile-390x844.png`

Total: **10 capturas exactas**.

## REMAINING ISSUES

No quedan hallazgos funcionales, de accesibilidad, responsive o visuales bloqueantes dentro del alcance. La evaluación estética final de la animación permanece como validación humana.

## CONFIRMACIÓN DE ALCANCE

Demand MVP no fue iniciado. No se modificaron producción, Cloudflare, DNS, backend, D1, infraestructura ni formularios externos. No se hizo push, merge ni deploy.
