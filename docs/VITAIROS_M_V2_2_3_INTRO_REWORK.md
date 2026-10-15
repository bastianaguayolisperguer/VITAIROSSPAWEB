# VITAIROS-M V2.2.3 — Intro rework only

Fecha: 2026-10-15 (America/Santiago)

## STATUS

**COMPLETADO — LISTO PARA VALIDACIÓN VISUAL.**

La intervención se limitó a la intro de primera visita y al mínimo enlace visual necesario con la marca del header. No se modificaron hero, navbar, spacing, Brecha, Continuity Loop, Perspectivas, Seguridad, Estado, Ecosistema, Contacto, footer, SEO, formularios ni copy.

## BASE SHA

`51d1707c0622af4d84210f919d14b6c131149b0e`

Rama: `vertical-v2/vitairos-m`.

## NEW SHA

`HEAD` del commit local `Rework VITAIROS-M intro around continuity`.

El SHA hexadecimal se informa en la entrega final, después de crear el commit.

## OLD INTRO REMOVED

Se eliminaron completamente el DOM de nueve nodos, las rutas múltiples, los selectores de red, sus keyframes y la temporización anterior de `1,3 s`. No quedaron listeners, selectores ni animaciones muertas de esa versión.

## NEW CONCEPT

La secuencia expresa Persona → Contexto → Profesional mediante tres presencias sin etiquetas, una única trayectoria orgánica verde → cian → azul y un pulso que recorre la línea. La trayectoria converge, aparece el logo oficial completo y la misma escena se abre hacia el hero.

## TIMELINE

- `0,00–0,20 s`: primer punto y halo humano.
- `0,20–0,45 s`: segundo y tercer punto.
- `0,34–0,92 s`: trayectoria y pulso viajero.
- `0,75–1,09 s`: logo oficial, opacity + scale `0.97 → 1` + blur `4 px → 0`.
- `1,10–1,70 s`: apertura hacia el hero y traslado del logo a su posición real en el header.

Duración total: `1,7 s`.

## DESKTOP

Geometría horizontal orgánica, con tres nodos, una sola curva y desplazamiento ambiental hacia el área gráfica del hero. El logo animado calcula posición y escala final desde el logo real del header para cerrar sin salto.

## MOBILE

Geometría propia y más corta, no una escala de desktop. Usa una trayectoria diferente, logo máximo de `285–300 px`, menor desplazamiento final y la misma duración. Verificado en `430 × 932`, `390 × 844` y `360 × 800`.

## HERO TRANSITION

La superficie de la intro se retrae progresivamente para revelar el hero, mientras la trayectoria permanece brevemente como línea ambiental. Durante el traslado se oculta únicamente la imagen duplicada del header; al completar la intro, el logo animado intercambia posición con el logo real sin corte a negro ni pantalla intermedia.

## REDUCED MOTION

Con `prefers-reduced-motion: reduce`, la clase `intro-pending` no se aplica, la intro permanece oculta y el hero se muestra directamente con todo el contenido visible.

## QA

Comando: `node tests/vitairos-m-v2-2-3-intro-qa.mjs`

Resultado: **6/6 configuraciones PASS**.

- desktop `1440 × 900`;
- tablet `1024 × 768`;
- mobile `430 × 932`, `390 × 844`, `360 × 800`;
- reduced motion `390 × 844`;
- primera visita: intro visible;
- recarga: no se repite;
- segunda navegación en la misma sesión: no se repite;
- `sessionStorage`: correcto;
- scroll lock residual: 0;
- overflow horizontal: 0;
- CLS: `0` en cuatro viewports; `0,00022` en desktop proviene del swap inicial de la fuente local en `desktop-nav`, no de la intro, y es visualmente nulo y muy inferior al umbral de `0,1`;
- errores de consola: 0;
- requests fallidas: 0;
- logo oficial: `vitairos-m-logo.png`, dimensiones naturales `574 × 166`;
- geometría mobile diferente de desktop;
- video: no generado porque el binario FFmpeg de Playwright no está disponible; no se instaló software nuevo.

## SCREENSHOTS

Directorio: `preview/vitairos-m-v2-2-3-intro-review/`

1. `01-intro-start.png`
2. `02-intro-path.png`
3. `03-intro-logo.png`
4. `04-intro-transition.png`
5. `05-hero-after-intro.png`
6. `06-intro-mobile-logo.png`
7. `07-hero-mobile-after-intro.png`

## CONCEPTUAL VALIDATION

1. ¿Habla de continuidad? **Sí:** una única trayectoria y un pulso enlazan los tres estados.
2. ¿Pertenece a VITAIROS-M? **Sí:** usa su gradiente, su logo oficial y desemboca en el lenguaje del hero.
3. ¿La transición al hero es natural? **Sí:** comparten fondo, trayectoria y posición final de marca.
4. ¿Evita una intro genérica de IA? **Sí:** no hay redes, partículas, nube de nodos ni construcción artificial del isotipo.
5. ¿El logo permanece intacto? **Sí:** se usa el PNG oficial como pieza única.
6. ¿Termina antes de ser molesta? **Sí:** finaliza en `1,7 s` y no se repite dentro de la sesión.

## REMAINING ISSUES

No quedan hallazgos funcionales o visuales bloqueantes dentro del alcance. La grabación opcional es la única evidencia no producida por la ausencia local de FFmpeg.
