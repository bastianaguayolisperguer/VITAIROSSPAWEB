# VITAIROS V3.4 — Visual & Motion Audit

Fecha: 2026-10-19

Base V3.4: `0be302dba43ad8fd33412763209f2050c6a91371`

Baseline visual histórico: V3.2.1 (`f0482a6`)

Alcance: home corporativa (`/`) solamente.

## Criterio

La comparación separa claridad de contenido, orden visual, valor de interacción, comportamiento responsive e identidad. Una sección puede conservar el copy de V3.3 y recuperar una estructura visual de V3.2.1. Las decisiones posibles son **KEEP V3.3**, **ROLLBACK V3.2.1**, **REBUILD** y **SIMPLIFY**.

Motion permitido:

- **BRAND MOTION:** identidad y profundidad; protagonista único: esfera VITAIROS.
- **FUNCTIONAL MOTION:** explica una transformación concreta; máximo tres sistemas principales.
- **AMBIENT MOTION:** reacción y atmósfera de baja intensidad; nunca compite con la lectura.

## Resumen ejecutivo

V3.3 mejora claramente la comprensión comercial, pero añade estructuras semánticas diferentes en Problemas, Integración, Método e Iniciativas. En desktop cada una puede leerse por separado; en tablet y mobile la acumulación reduce ritmo, jerarquía y coherencia. V3.2.1 tenía menos significado explícito, pero una gramática más consistente: rutas, órbitas, una línea principal y espacios amplios.

V3.4 debe conservar el contenido de V3.3 y reducir la cantidad de lenguajes visuales. La esfera será el único brand motion complejo. Problemas e Integración serán los dos sistemas funcionales. Método, Iniciativas y Principios usarán rutas o pulsos mínimos.

## Auditoría por sección

| Sección | Visual V3.2.1 | Visual V3.3 | Claridad | Orden | Interacción | Responsive | Identidad | Decisión |
|---|---|---|---|---|---|---|---|---|
| Brand intro | Firma breve que resuelve hacia el hero. | Misma lógica, con hero ya renderizado para evitar retraso visual. | Alta. | Alto. | No bloquea después de la primera visita. | Correcta, aunque el gesto debe seguir siendo breve. | Alta. | **KEEP V3.3** |
| Header | Navegación limpia y compacta. | Sin cambio estructural. | Alta. | Alto. | Menú, focus y CTA claros. | Funciona en desktop y mobile. | Alta. | **KEEP V3.3** |
| Hero / copy | Promesa sólida, pero eyebrow y lead menos explícitos. | Explica empresa chilena, prueba acotada e integración. | V3.3 superior. | Bueno. | CTA y scroll claros. | Copy ocupa más altura en mobile, pero sigue legible. | Alta. | **KEEP V3.3** |
| Hero / esfera | Malla equilibrada, nodos relativamente uniformes y órbitas limpias. | Añade jerarquías, rutas y señales; gana significado, pero incrementa densidad. | V3.3 comunica red operativa. | V3.2.1 es más calmada. | Pointer y links aportan valor. | V3.3 escala la misma densidad y compite en mobile. | Activo central. | **REBUILD** |
| La brecha / intro | Encabezado claro y espacioso. | Copy más concreto, misma jerarquía. | V3.3 superior. | Alto. | No requiere interacción. | Correcto. | Alta. | **KEEP V3.3** |
| Problemas | Escena abstracta, elegante pero poco explicativa. | Cuatro escenas semánticas con demasiados fragmentos, overlays y posiciones variables. | V3.3 mejora el significado. | V3.2.1 es más limpia. | V3.3 mejora estados y control accesible. | En mobile la visual queda alta y los cambios son difíciles de comparar. | Ambas usan lenguaje VITAIROS. | **REBUILD** |
| Integración | Banda estática, muy ordenada pero insuficiente para explicar integración. | Sistema de cinco entradas y núcleo; copy claro, visual sobredimensionado. | V3.3 superior. | V3.2.1 superior. | V3.3 carece de detalle útil por componente. | La composición radial pierde balance al apilarse. | Alta. | **SIMPLIFY** |
| Método | Una sola ruta ondulada conecta cuatro etapas. | Conserva la ruta y añade cuatro microdiagramas distintos. | Copy V3.3 superior. | V3.2.1 superior. | V3.3 añade movimiento sin necesidad proporcional. | Los miniuniversos aumentan altura y ruido; mobile necesita ruta vertical. | V3.2.1 es más coherente. | **ROLLBACK V3.2.1** visual + copy V3.3 |
| Capacidad central | Mensaje abstracto de capacidad única. | Mensaje y capacidades explícitas. | V3.3 superior. | Alto. | No depende de motion. | Correcto. | Alta. | **KEEP V3.3** |
| Iniciativas | Índice + órbitas concéntricas; lectura ordenada, aunque visual abstracta. | Índice + ruta de cuatro nodos con significado distinto por iniciativa. | Copy V3.3 superior. | V3.2.1 más equilibrada. | Cambio de iniciativa aporta valor. | El preview conserva demasiado espacio en mobile. | Alta. | **SIMPLIFY** |
| VITAIROS en movimiento | Cards editoriales y ambiente suave. | Mismo sistema con copy corporativo más maduro. | V3.3 superior. | Alto. | Hovers y enlaces suficientes. | Correcto. | Alta. | **KEEP V3.3** |
| Principios | Fórmulas repetitivas, visual mínimo. | Copy mejorado + pulso compartido. | V3.3 superior. | Alto. | Focus/hover/scroll discretos. | Correcto; ocultar línea auxiliar si estorba en mobile. | Alta. | **KEEP V3.3 / SIMPLIFY MOBILE** |
| Diagnóstico | Flujo de cuatro pasos estable. | Preservado. | Alta. | Alto. | Funcional y accesible. | Ya validado. | Alta. | **KEEP V3.3** |
| Footer y legales | Estructura institucional estable. | Preservado; contraste ajustado. | Alta. | Alto. | Enlaces y modales accesibles. | Correcto. | Alta. | **KEEP V3.3** |

## Diagnóstico responsive

### Desktop ≥ 1200 px

- La esfera puede conservar profundidad completa, pero necesita menos rutas activas simultáneas.
- Problemas e Integración deben compartir proporciones y bordes más calmados.
- Método debe volver a una sola ruta, sin miniobjetos.
- Solo un foco funcional fuerte por viewport.

### Tablet 768–1199 px

- Hero necesita una esfera de densidad reducida y un ancho controlado, no la versión desktop escalada.
- Problemas debe abandonar dos columnas rígidas: selector compacto arriba, texto y visual central debajo.
- Integración necesita una ruta SVG más horizontal/compacta o una disposición vertical explícita.
- Método debe conservar jerarquía sin comprimir sus cuatro etapas.

### Mobile ≤ 767 px

- Hero: copy y CTA primero; esfera más pequeña, con menos nodos y rutas.
- Problemas: tabs horizontales accesibles, descripción inmediata y visual debajo.
- Integración: componentes táctiles de al menos 44 px y lectura estática completa.
- Método: ruta vertical, texto siempre visible, pulso descendente.
- Iniciativas: valor y CTA antes del visual; reducir altura del preview.

## Decisiones previas a implementación

1. **Conservar todo el copy comercial V3.3** salvo correcciones estrictamente necesarias para composición.
2. **Esfera: REBUILD.** Mantener Canvas y marca, reducir densidad por breakpoint y limitar rutas activas.
3. **Problemas: REBUILD.** Crear un único SVG estable con 5–7 elementos; solo 20–40% cambia por estado.
4. **Integración: SIMPLIFY.** Crear SVG legible estático con cinco componentes, un flujo común y salida Operación; interacción inmediata con microcopy.
5. **Método: ROLLBACK visual V3.2.1.** Recuperar una ruta única y eliminar cuatro miniuniversos; en mobile convertirla en vertical.
6. **Iniciativas: SIMPLIFY.** Preservar interacción y copy, recuperar equilibrio y reducir el visual a una transición ambiental breve.
7. **Principios: KEEP V3.3.** Mantener el pulso compartido y retirar cualquier elemento auxiliar que aumente ruido en mobile.
8. **News, diagnóstico, formulario, privacidad, SEO y footer: KEEP V3.3.** No modificar lógica ni contenido.

## Hipótesis a validar

- La esfera con 45–60% de densidad en mobile conservará identidad sin competir con el titular.
- Una estructura fija en Problemas permitirá reconocer en menos de tres segundos qué cambia entre categorías.
- La ruta común de Integración será comprensible aun sin animación.
- Recuperar una única línea del Método mejorará orden y lectura responsive sin hacer la página estática.

## Criterio de salida

V3.4 solo podrá considerarse lista si las capturas humanas muestran balance y legibilidad en desktop, tablet y mobile; los tests técnicos y Lighthouse serán necesarios, pero no suficientes.
