# Refinamiento creativo final — Homepage V3.1

Fecha: 2026-10-13  
Branch: `homepage-v2-ai-positioning`  
Entorno revisado: `http://127.0.0.1:4173/`  
Producción: no modificada.

## Propósito

V3.1 es una intervención quirúrgica sobre la V3 aprobada. Conserva sus ocho capítulos, tesis, copy principal, esfera, ecosistema, evidencia, principios, diagnóstico y footer. El cambio central consiste en retirar la región clara de Método que se percibía como una segunda página y convertir Brecha → Método → Ecosistema en una sola narrativa visual oscura.

## Cambios V3 → V3.1

- Método deja de ser una gran superficie Niebla y pasa a vivir directamente sobre Abismo/Bosque.
- La geometría de Brecha se ordena en una trayectoria de cuatro etapas y se libera como red antes de Ecosistema.
- El progreso de Método activa nodos de forma secuencial sin bloquear ni controlar el scroll.
- Los cuatro contextos de Brecha tienen microvisualizaciones distintas: flujo, estructura, criterio y producto.
- Los cuatro proyectos de Ecosistema modifican topología, etiquetas y movimiento, no solo el copy.
- Evidencia utiliza dos lenguajes específicos: documentos/operación/trazabilidad y cómputo/red/IA.
- Los principios responden a hover y foco como composición editorial conectada.
- El diagnóstico incorpora progreso nodal, feedback de escritura, estados seleccionados más claros y cierre “Enviar mi caso para revisión”.
- Navegación desktop visible desde `1100px` exactos.
- Se compacta el footer sin cambiar sus destinos.

## Continuidad cromática

Toda la home se mantiene en una escena oscura basada en `#061611` y `#0E3A2F`. Niebla permanece como color de texto, luminosidad y superficies pequeñas. No existe un bloque claro de media página ni un theme switch. Las transiciones usan líneas, nodos, halo controlado y profundidad, no formas decorativas gigantes.

## Método como brand moment

La trayectoria mantiene las cuatro etapas congeladas: Diagnóstico, Piloto, Implementación y Escalamiento. Al entrar al capítulo todos los nodos están atenuados; el avance natural de scroll revela línea y etapas. Al completarse, cinco nodos se separan de la trayectoria para anticipar la expansión del Ecosistema. La implementación usa SVG y CSS, con cálculo agrupado en `requestAnimationFrame` y sin scroll-jacking.

## Sistema de interacción

- Canvas 2D del hero preservado, con profundidad, respuesta a pointer/foco y pausa fuera de viewport.
- Brecha: selector por hover, foco y click con cuatro topologías diferenciadas.
- Ecosistema: índice estable y preview reactivo por hover, foco y tap.
- Principios: foco teclado equivalente a hover; el resto de ítems se atenúa para crear lectura editorial.
- Diagnóstico: radios nativos, labels reales, validación del navegador, respuestas persistentes al volver y feedback `0 / 600`.
- `prefers-reduced-motion`: elimina animación continua, revela contenido y conserva toda la información.

## Evaluación visual frente a las iniciativas

### Conecta

La home V3.1 supera a Conecta en coherencia de sistema, profundidad digital, continuidad entre capítulos y calidad de interacción. Conecta conserva una ventaja específica en calidez, diversidad cromática y tono comunitario; esa diferencia es correcta para su propósito y no debe copiarse mecánicamente a la marca corporativa.

### Industrial AI

La home V3.1 supera a Industrial en sofisticación interactiva, consistencia de navegación y continuidad de marca. Industrial conserva una ventaja en especificidad sectorial, materialidad y claridad inmediata del contexto minero-industrial. La home debe seguir siendo transversal; no conviene adoptar esa literalidad.

## Decisión crítica

La V3.1 sí alcanza una jerarquía corporativa superior a las iniciativas como sistema madre, pero no reemplaza sus personalidades. La comparación no se considera una victoria absoluta: Conecta e Industrial siguen siendo referencias más fuertes en tono emocional y precisión de dominio, respectivamente.

## Verificación

- Smoke test V3.1: aprobado.
- Browser QA: aprobado en 8 viewports.
- 20 capturas obligatorias y 2 benchmarks generados.
- 0 overflow horizontal, imágenes rotas, errores de consola o IDs duplicados.
- Breakpoint de navegación desktop verificado a `1100px`.
- Menú móvil, teclado, tap, diagnóstico editable, rutas internas y movimiento reducido verificados.
- Lighthouse no está disponible en el entorno; no se informan puntuaciones no medidas.

## Límites antes de producción

- Revisar Safari/iOS y hardware móvil real.
- Validar entrega real de FormSubmit con un correo autorizado.
- Ejecutar Lighthouse/WebPageTest en un build equivalente al CDN.
- Aprobar dirección creativa con stakeholders y probar comprensión con compradores reales.
- No hubo deploy, push, merge, cambios DNS ni cambios Cloudflare.
