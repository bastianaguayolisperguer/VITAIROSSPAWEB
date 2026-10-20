# VITAIROS V3.4.2 — CSS Architecture Audit

Fecha: 2026-10-20  
Estado auditado: `b08aa0dfdab078e2e88db88b409299cba8e36a41`  
Archivo: `assets/homepage.css`  
Tamaño: 137.912 bytes, 626 líneas  
CSS modificado durante esta auditoría: **no**

## Objetivo

Separar el critical render path de los estilos below-the-fold sin duplicar la hoja completa, sin cambiar el diseño y preservando el estado validado con mediana Lighthouse Mobile 88.

El primer viewport contiene navegación, brand intro, hero, CTA y esfera/fallback. `#brecha` comienza después de un hero con `min-height:100svh`; Problemas, Integración, Método, Ecosistema, actualidad, Principios, formulario y footer pueden pertenecer al recurso diferido siempre que conserven geometría estable y el recurso se precargue desde el documento.

## Mapa físico actual

| Líneas | Bloque actual | Bytes aproximados | Clasificación primaria |
| --- | --- | ---: | --- |
| 1–39 | Fuente, variables, reset, base, container, secciones, botones | 3.937 | A. Global critical |
| 40–83 | Brand intro y keyframes | 5.261 | D. Intro critical |
| 84–103 | Header, nav, menú móvil | 2.718 | B. Header/nav critical |
| 104–120 | Hero | 2.954 | C/E. Hero / above-the-fold critical |
| 121–137 | Esfera, fallback, nodos orbitales | 3.735 | C/E. Hero / above-the-fold critical |
| 138–158 | Brecha y selector de problemas | 5.149 | F. Problems |
| 159–171 | Método base | 2.835 | H. Method |
| 172–184 | Ecosistema base | 4.661 | I. Ecosystem |
| 185–193 | Actualidad/evidencia | 2.385 | K. VITAIROS in motion |
| 194–199 | Principios | 1.344 | J. Principles |
| 200–213 | Diagnóstico/formulario | 6.386 | L. Form |
| 214–219 | Footer, modales y reveal | 2.282 | M/O. Footer / shared motion |
| 220–224 | `content-visibility` móvil | 264 | E. Critical containment |
| 225–243 | V3.1, overrides de escena continua | 14.555 | Mixto; requiere extracción por selector |
| 244–309 | V3.2, refinamientos y responsive | 9.712 | N/O. Responsive / animations, mixto |
| 310–353 | V3.2.1, ambient networks y firma | 7.320 | I/J/K/N/O, diferido |
| 354–440 | V3.3, visuales comerciales y motion | 23.408 | F–J/N/O, mayormente diferido |
| 441–555 | V3.4, reconstrucción responsive | 18.025 | C/F–J/N/O, mixto |
| 556–626 | V3.4.1, integración y ecosistema | 20.336 | G/I/N/O, diferido |

Los bloques históricos V3.1–V3.4.1 mezclan ownership por sección. No deben trasladarse por rango completo: se separarán regla por regla para mantener orden y cascada.

## Clasificación A–P

### A. GLOBAL CRITICAL

Debe quedar en `homepage-critical.css`:

- `@font-face`, `:root`, box sizing, `html`, `body` y fondo global.
- estados de bloqueo de scroll;
- enlaces, controles, imágenes/SVG/canvas;
- `.container`, `.section`, skip link, foco y anchor target;
- tipografía base de títulos/kickers y botones compartidos;
- geometría mínima de secciones diferidas y `content-visibility` móvil.

### B. HEADER / NAV CRITICAL

Todo el bloque Header, incluidos scroll progress, wordmark, navegación, CTA, hamburger y menú móvil. Deben incluirse sus breakpoints de 1099, 820 y 540 px para evitar reflow y un menú sin estilos.

### C. HERO CRITICAL

`.hero-banner`, fondos, grid, aurora, network, layout, copy, H1, lead, acciones, método y scroll. Incluye todos los overrides responsive posteriores que afecten `.hero-*`.

### D. INTRO CRITICAL

Todo `.intro-*` y los keyframes usados por la intro. La duración móvil de 720 ms, el isotipo estable y los estados de `loader-active` son críticos.

### E. ABOVE-THE-FOLD CRITICAL

Esfera/fallback inicial (`.hb-sphere-*`, `#vitairos-geo`, caption, orbit projects), CTA/button y geometría del hero. `#brecha` no forma parte del primer viewport, pero se conserva su contención y una geometría mínima defensiva.

### F. PROBLEMS

`.breach-*`, `.value-*`, `.semantic-*`, `.capability-note` y sus keyframes/estados/breakpoints. Diferido.

### G. INTEGRATION

`.integration-story`, `.integration-copy`, `.integration-model*`, `.integration-capabilit*`, `.integration-route*`, `.integration-hub`, `.integration-application*`, `.integration-detail` y motion asociado. Diferido.

### H. METHOD

`.method-*`, progreso, nodos, botones y responsive vertical. Diferido.

### I. ECOSYSTEM

`.ecosystem-*`, `.initiative-*`, firma de ecosistema y responsive. Diferido.

### J. PRINCIPLES

`.principles-*`, `.about-note`, ambient network de la sección y progreso. Diferido.

### K. VITAIROS IN MOTION

`.news-*` y estados generados dinámicamente. Diferido.

### L. FORM

`.diagnostic-*`, choices, campos, privacidad, feedback, thank-you y responsive. Diferido.

### M. FOOTER

`footer`, footer grid/identity/contact/meta y modales. Diferido; los modales solo se abren por interacción y el preload debe haber aplicado la hoja antes.

### N. RESPONSIVE

No se separa en una tercera hoja. Cada media query se divide por ownership: reglas de header/hero/esfera van al critical; reglas F–M al deferred. Así cada componente conserva sus breakpoints junto a su arquitectura.

### O. ANIMATIONS

Keyframes y reduced-motion acompañan al componente que los usa. Intro, hero y esfera quedan en critical; Problems–Footer quedan en deferred. Las reglas globales de reduced motion se dividen con el mismo criterio.

### P. LEGACY / UNUSED

La búsqueda cruzada exacta entre selectores CSS y `index.html` + `homepage.js` encontró 47 clases sin referencia. Pertenecen a visuales reemplazadas en V3.3/V3.4.1:

- antiguo diagrama: `.diagram-node*`, `.diagram-line*`;
- antiguo ecosistema orbital: `.eco-orbit*`, `.eco-node*`, `.ecosystem-core`, `.ecosystem-route`, `.ecosystem-flow-signal`, `.ecosystem-visual`;
- antigua integración SVG: `.integration-system`, `.integration-component*`, `.integration-core`, `.integration-operation`, `.integration-path*`, `.integration-pulse`;
- antiguo motion de método: `.method-motion*`;
- modificadores no presentes: `.section-intro--ink`, `.semantic-route--c`, `.semantic-route--d`, `.semantic-signal--two`.

Estas reglas están demostrablemente ausentes del HTML, del JavaScript, de los estados dinámicos y de los builders de actualidad. Se podrán retirar en un batch separado después de validar primero la división estructural; no se eliminarán simultáneamente con el primer split para mantener causalidad medible.

## Arquitectura propuesta

### `assets/homepage-critical.css`

- Fuente, tokens, reset y base.
- Intro completa.
- Header/nav completos.
- Hero completo.
- Esfera/fallback completa.
- Breakpoints y reduced-motion exclusivamente de esos componentes.
- Contención/altura mínima necesaria para que el primer viewport y el comienzo de la página no cambien de geometría.

Tamaño objetivo inicial: aproximadamente 20–30 KB sin comprimir.

### `assets/homepage-deferred.css`

- Problems, Integration, Method, Ecosystem, Evidence, Principles, Diagnostic, Footer y modales.
- Breakpoints, estados, keyframes y reduced-motion de esos componentes.
- Sin copia del critical.

Tamaño esperado inicial: resto de la hoja, aproximadamente 100–115 KB antes de limpiar legacy.

### Carga

1. `homepage-critical.css` como stylesheet bloqueante.
2. `homepage-deferred.css` como `rel="preload" as="style"` y promoción a stylesheet en `onload`.
3. `<noscript><link rel="stylesheet" ...></noscript>` para contenido legible sin JavaScript.
4. `content-visibility` conservado para secciones inferiores.

No se inyectará CSS inline y no se cargará la hoja monolítica junto a las dos nuevas hojas. Esto evita repetir el intento que produjo CLS 0.061 y reduce trabajo real del primer render.

## Riesgos y controles

| Riesgo | Control |
| --- | --- |
| FOUC al hacer scroll temprano | Preload inmediato desde `<head>` y QA con red/CPU simulada |
| CLS por reglas geométricas tardías | Hero completo bloqueante; geometría global y contención en critical |
| Cambios de cascada | Mantener orden relativo dentro de cada hoja y evitar selectores duplicados |
| Breakpoint perdido | Dividir reglas dentro de cada media query por ownership |
| Interacción sin estilos | Deferred solicitado desde parse del head y test antes de viewport |
| JS deshabilitado | Fallback `<noscript>` |
| Regresión de esfera/intro | No modificar JS, DPR, FPS, densidad, inicio ni asset |

## Primer batch recomendado

Solo separación estructural critical/deferred, sin eliminar legacy y sin alterar declaraciones. Medir Lighthouse Mobile clean x3 y QA 390×844 / 360×800. La limpieza legacy se evaluará únicamente como segundo batch si el split es estable y medible.

## Resultado implementado

La propuesta inicial de separar componentes completos produjo una hoja crítica demasiado pequeña y estilos inferiores incompletos durante la ventana de Lighthouse. Se probó y revirtió. También se probó la eliminación aislada de las 47 clases legacy demostrablemente no referenciadas; aunque era correcta desde cobertura estática, el batch empeoró la ejecución medida y no se retuvo para evitar mezclar causas.

La arquitectura final divide por **propiedad**, preservando el orden de cascada:

- `assets/homepage-critical.css`: 96.865 bytes. Contiene toda la geometría, tipografía, color, accesibilidad y estados de estructura necesarios para mantener layout estable, incluido el esqueleto de las secciones inferiores.
- `assets/homepage-deferred.css`: 52.608 bytes. Contiene decoración, sombras, transforms, transiciones y motion secundario que no participa en el layout inicial.
- El monolito `assets/homepage.css` fue retirado; no se carga ni queda una tercera fuente CSS duplicada.
- Las 4.041 declaraciones originales quedaron asignadas exactamente una vez durante la generación del split; el aumento de bytes combinado corresponde a repetir selectores y delimitadores cuando una regla se divide por propiedad, no a duplicar declaraciones.

La carga final usa `homepage-critical.css` como único stylesheet bloqueante. `homepage-deferred.css` se solicita con `media="print"` y se activa de forma síncrona en el primer intento de scroll/touch/pointer/teclado, al abrir con hash o al intersectar `#brecha`. El primer intento de navegación activa la hoja antes de que una sección diferida pueda entrar en viewport. `<noscript>` aplica la hoja completa, y `html.no-js` mantiene visibles los contenidos `reveal` si la ejecución de scripts falla.

La estrategia propuesta `preload → stylesheet` se descartó tras medición: promover la hoja completa inmediatamente mantuvo demasiado trabajo de estilo en el critical render path. La solución final mantiene el recurso disponible sin aplicarlo al primer viewport y fue validada con red móvil y CPU 4× simuladas, sin FOUC, overflow ni CLS adicional durante 0–3 segundos o al activar la hoja.
