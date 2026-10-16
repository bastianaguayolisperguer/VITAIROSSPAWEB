# VITAIROS-M V2.2.1 — Visual polish before approval

Fecha: 2026-10-15 (America/Santiago)

## STATUS

**COMPLETADO — LISTO PARA VALIDACIÓN VISUAL HUMANA. DEMAND MVP NO INICIADO.**

La intervención se limitó a los cuatro hallazgos de la revisión V2.2. No se modificaron identidad, narrativa, copy, H1, Continuity Loop desktop, perspectivas Persona/Profesional, Seguridad, Estado del producto, CTA, estructura o destino del formulario, lógica de privacidad, footer, SEO ni Open Graph. No se realizó push, merge, despliegue ni cambio de infraestructura.

## BASE SHA

`e4a125775bb10b0f3ddb83364de9845e7df586e4`

Rama verificada: `vertical-v2/vitairos-m`.

## NEW SHA

`HEAD` del commit local `Polish VITAIROS-M V2 mobile continuity and readability`.

El SHA hexadecimal se informa en la entrega final, después de crear el commit. Un archivo incluido en un commit no puede contener de forma estable el hash del mismo commit porque ese contenido participa en el cálculo del hash.

## FILES MODIFIED

- `vitairos-m/styles.css`: cirugía visual acotada para los cuatro hallazgos.
- `tests/vitairos-m-v2-2-1-visual-qa.mjs`: QA reproducible en ocho viewports, pruebas de interacción y generación exacta de evidencias.
- `docs/VITAIROS_M_V2_2_1_VISUAL_POLISH.md`: este informe.
- `preview/vitairos-m-v2-2-1-visual-review/`: 12 capturas, resultado QA y reporte Lighthouse.

Artefactos previos preservados sin sobreescritura:

- `docs/VITAIROS_M_V2_2_VISUAL_REVIEW.md`.
- `preview/vitairos-m-v2-2-visual-review/` con sus 15 capturas originales.

## CONTINUITY LOOP MOBILE

### Antes

En `430 × 932`, `390 × 844` y `360 × 800`, el SVG del circuito desktop se ocultaba y los seis estados quedaban como tarjetas independientes. El orden semántico permanecía, pero se perdía la relación visual de continuidad.

### Cambio

Se añadió exclusivamente bajo `760 px` un spine lateral continuo de `4 px`, con gradiente verde → cian → azul, halo suave, conectores horizontales y nodos cromáticos para cada uno de los seis estados. Se conservan exactamente el orden, iconos, copy y semántica existentes. El circuito desktop no cambió.

### Después

Los seis estados forman un recorrido vertical conectado desde Persona hasta Readaptación. En los tres viewports manuales la ruta mide `801 px`, mantiene continuidad visible y conserva `18 px` de separación entre tarjetas.

### Resultado

**RESUELTO.** Sin overflow, colisiones, clipping ni pérdida semántica en `430 × 932`, `390 × 844` y `360 × 800`.

## READABILITY

### Antes

- Consentimiento de privacidad: `11,52 px`.
- Divulgación FormSubmit: `10,56 px`.
- Etiqueta y ayuda inmediata del footer: entre `10,56 px` y `12,48 px` efectivos.

### Cambio

Se elevaron tamaños, interlineado, contraste, ancho de lectura y espaciado sin alterar ningún texto ni vínculo:

- consentimiento: `14 px`, line-height `1.62`;
- FormSubmit: `13 px`, line-height `1.62`, ancho máximo `62ch`;
- etiqueta de ayuda: `13 px`, line-height `1.45`;
- recursos de ayuda: `14 px`, line-height `1.65`, ancho máximo `68ch`.

### Después

Los valores calculados son idénticos en los ocho viewports y ninguno de los cuatro textos queda bajo `13 px`.

### Resultado

**RESUELTO.** La información de privacidad, procesamiento y ayuda inmediata tiene lectura cómoda y contraste consistente en desktop y móvil.

## HERO MOBILE

### Antes

En `390 × 844`, el orbit comenzaba aproximadamente en `y = 874,6 px`, unos `30,6 px` por debajo del primer viewport.

### Cambio

Solo bajo `480 px` se redujo de forma sutil el espacio superior del hero y el margen previo al orbit. No se alteraron el H1, sus tamaños, el copy, los CTA ni la escala del visual.

### Después

En `390 × 844`, el orbit comienza en `y = 820,56 px` y asoman `23,44 px` dentro del primer viewport.

### Resultado

**RESUELTO.** El primer viewport sugiere la continuidad visual siguiente sin comprimir el titular ni romper los CTA.

## ECOSYSTEM

### Antes

Las tarjetas medían `270 px` en desktop y `230 px` en móvil, con la mayor parte de su mitad superior ocupada por un arco de bajo contraste y poca densidad visual.

### Cambio

Se ajustaron proporciones, padding, jerarquía tipográfica y contraste de superficie. Se agregó un pequeño motivo de tres nodos conectados construido en CSS con los colores de marca; no se añadió contenido, imagen, claim ni enlace.

### Después

Las tarjetas miden `240 px` en desktop y `215 px` en móvil. El motivo de red ocupa el área superior, el bloque de texto aprovecha mejor la superficie y los tres cards mantienen la composición original.

### Resultado

**RESUELTO.** La sección se percibe más deliberada y menos vacía sin competir con el Continuity Loop ni introducir narrativa nueva.

## QA

Comando:

`node tests/vitairos-m-v2-2-1-visual-qa.mjs`

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
- menú móvil: apertura, Escape y restauración de foco correctos;
- tabs Persona/Profesional: mouse y teclado correctos;
- modal de privacidad: apertura, Escape y restauración de foco correctos;
- reduced motion: sin contenido oculto;
- FormSubmit: endpoint y payload interceptados localmente, sin envío real;
- SEO, canonical, Open Graph, Twitter Card y JSON-LD: preservados.

Resultado detallado: `preview/vitairos-m-v2-2-1-visual-review/qa-results.json`.

## LIGHTHOUSE

Ejecución local contra `http://127.0.0.1:4174/vitairos-m/` con Edge headless.

| Métrica | Baseline V2.2 | V2.2.1 | Resultado |
| --- | ---: | ---: | --- |
| Performance | 97 | 97 | Sin regresión |
| Accessibility | 100 | 100 | Sin regresión |
| Best Practices | 100 | 100 | Sin regresión |
| SEO | 100 | 100 | Sin regresión |
| LCP | 2,4 s | 2,4 s | Sin regresión |
| CLS | 0 | 0 | Sin regresión |
| TBT | 0 ms | 0 ms | Sin regresión |

Reporte completo: `preview/vitairos-m-v2-2-1-visual-review/lighthouse-report.json`.

## SCREENSHOTS

Directorio: `preview/vitairos-m-v2-2-1-visual-review/`

1. `01-hero-desktop-1440x900.png`
2. `02-hero-mobile-390x844.png`
3. `03-continuity-loop-desktop.png`
4. `04-continuity-loop-mobile-430x932.png`
5. `05-continuity-loop-mobile-390x844.png`
6. `06-continuity-loop-mobile-360x800.png`
7. `07-consentimiento-mobile.png`
8. `08-ayuda-inmediata-mobile.png`
9. `09-ecosistema-desktop.png`
10. `10-ecosistema-mobile.png`
11. `11-full-page-desktop-1440.png`
12. `12-full-page-mobile-390.png`

Total: **12 capturas exactas**.

## REMAINING VISUAL ISSUES

No quedan hallazgos automáticos ni problemas visuales bloqueantes dentro del alcance V2.2.1. La aprobación estética final continúa siendo una decisión humana basada en las 12 capturas nuevas.

No se inició implementación de lista de interés, Demand MVP, backend de IA, D1, Turnstile, UTMs ni infraestructura adicional.

## RECOMMENDATION

Presentar V2.2.1 para validación visual humana. Mantener Demand MVP detenido hasta recibir aprobación explícita. No desplegar ni mezclar estos cambios con trabajo de captación antes de esa decisión.
