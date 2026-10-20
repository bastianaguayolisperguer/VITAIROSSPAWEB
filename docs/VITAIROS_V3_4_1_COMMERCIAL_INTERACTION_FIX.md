# VITAIROS V3.4.1 — Commercial Interaction Fix

## STATUS

Desktop review gate completo y aprobado localmente. La intervención quedó limitada a Integración tecnológica y Ecosistema / iniciativas.

## BASE SHA

`5eb135c27181f3e6d8f092541975590816629a97`

Rama base: `home-v3.4-responsive-motion-rebuild`.

## NEW SHA

El SHA exacto del commit final se informa en el cierre de la tarea. Este documento versionado referencia `HEAD` de `home-v3.4.1-commercial-interaction-fix` porque un commit no puede incluir de forma autorreferente su propio hash definitivo.

## PREVIEW URL

`http://127.0.0.1:4173/?preview=v3.4.1`

Previsualización exclusivamente local. No corresponde a producción ni a un deployment remoto.

## INTEGRATION OLD

V3.4 usaba cinco nodos radiales que convergían en “Sistema integrado” y terminaban en una caja secundaria de “Operación”. La lectura era técnicamente válida, pero el resultado quedaba subordinado a la arquitectura y exigía interpretar demasiadas conexiones abstractas.

## INTEGRATION NEW

La pieza se reconstruyó como un modelo comercial de tres niveles explícitos:

1. Capacidades: IA, Software, Datos, Automatización e Integraciones.
2. Integración VITAIROS: selección y conexión de las capacidades necesarias según el problema, bajo el mensaje “Diseño + integración”.
3. Aplicación en la operación: Proceso, Información, Decisiones y Producto digital.

Las rutas están dibujadas en SVG con `viewBox`, mientras la estructura de contenido usa Grid, Flexbox y medidas fluidas.

## COMMERCIAL VALUE

La explicación ahora muestra qué se selecciona, qué hace VITAIROS y dónde se materializa el trabajo. La aplicación operativa tiene mayor peso visual y conecta directamente con Proceso, Información, Decisiones y Producto, los cuatro contextos presentados en la sección anterior.

No se afirma que todas las tecnologías se utilicen siempre. El centro del modelo declara de forma explícita que se seleccionan y conectan solo las capacidades necesarias según el problema.

## INTEGRATION INTERACTION

Cada capacidad activa únicamente su módulo, su ruta de convergencia, una aplicación operativa y un microcopy específico:

- IA → Decisiones.
- Software → Producto digital.
- Datos → Información.
- Automatización → Proceso.
- Integraciones → Producto digital.

La interacción funciona con click, hover/puntero, foco y flechas de teclado. El estado usa `role="tab"`, `aria-selected`, `tabpanel`, foco visible y una región viva para el cambio de explicación.

## ECOSYSTEM OLD

V3.4 reutilizaba una única curva abstracta, cuatro etiquetas y el isotipo como centro de todos los estados. La escena dejaba demasiado espacio sin función narrativa y Agro presentaba colisión visual entre CAMPO y DECISIÓN.

## ECOSYSTEM NEW

Se conservó el índice de iniciativas a la izquierda y se reconstruyó el panel derecho como una narrativa de transformación. Cada estado actualiza sector, nombre, headline, microcopy, secuencia y motivo visual, manteniendo una retícula común y posiciones estables.

La transformación usa transiciones de 420–520 ms, capas de profundidad, líneas de flujo, iluminación y un pulso breve. El isotipo corporativo se utiliza como firma secundaria, no como centro del diagrama.

## VITAIROS-M

Secuencia: PERSONA → CONTEXTO → PROFESIONAL → CONTINUIDAD.

Headline: “Continuidad entre la persona y la atención profesional.”

El motivo visual usa recorridos de continuidad y nodos circulares. No incorpora claims clínicos.

## INDUSTRIAL AI

Secuencia: INFORMACIÓN OPERATIVA → ESTRUCTURA → INDICADORES → PROCESO.

Headline: “Información operativa convertida en datos utilizables.”

El motivo visual usa una retícula operativa y módulos rectangulares. La propuesta se presenta como estructuración de información para indicadores y procesos, no como OCR.

## AGRO INTELLIGENCE

Secuencia: CAMPO → DATOS → INFORMACIÓN → DECISIÓN.

Headline: “Datos del campo convertidos en información para decidir.”

Microcopy: “IA y datos aplicados donde existe una decisión productiva concreta.”

El motivo usa líneas de terreno y capas suaves sin afirmar sensores, satélites ni predicción.

## VITAIROS CONECTA

Secuencia: PERSONA → APRENDIZAJE → PRÁCTICA → ADOPCIÓN.

Headline: “Conocimiento convertido en adopción digital responsable.”

El motivo usa anillos de aprendizaje y progresión, manteniendo el lenguaje corporativo VITAIROS.

## OVERLAP FIXES

La secuencia del panel derecho usa cuatro columnas independientes con etiquetas contenidas y líneas detrás del contenido. La detección geométrica automatizada revisó todos los pares de etapas en las cuatro iniciativas y en los tres tamaños desktop.

Resultado: 0 overlap, 0 elementos fuera de límites y 0 etiquetas recortadas. La colisión CAMPO / DECISIÓN quedó eliminada.

## DESKTOP QA

Validado con Edge/Chromium mediante `tests/home-v3-4-1-qa.cjs`:

| Viewport | Overflow horizontal | Overlap | Clipping | Fuente mínima de labels | Consola/red |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1920×1080 | 0 px | 0 | 0 | 9 px | 0 errores |
| 1440×900 | 0 px | 0 | 0 | 9 px | 0 errores |
| 1366×768 | 0 px | 0 | 0 | 9 px | 0 errores |

También se verificaron los cinco estados de Integración, los cuatro estados de Ecosistema, navegación con flechas, foco visible de 2 px, activación por puntero, IDs duplicados, requests fallidas y respuestas HTTP de error.

Resultado automatizado: `failures: []`.

## SCREENSHOTS

- `preview/home-v3.4.1-commercial-interaction-fix/screenshots/A-integration-1920x1080.png`
- `preview/home-v3.4.1-commercial-interaction-fix/screenshots/B-integration-1440x900.png`
- `preview/home-v3.4.1-commercial-interaction-fix/screenshots/C-integration-1366x768.png`
- `preview/home-v3.4.1-commercial-interaction-fix/screenshots/D-ecosystem-agro-intelligence-1440x900.png`
- `preview/home-v3.4.1-commercial-interaction-fix/screenshots/E-ecosystem-industrial-ai-1440x900.png`
- `preview/home-v3.4.1-commercial-interaction-fix/screenshots/F-ecosystem-vitairos-m-1440x900.png`
- `preview/home-v3.4.1-commercial-interaction-fix/screenshots/G-ecosystem-vitairos-conecta-1440x900.png`

Comparaciones V3.4 / V3.4.1 disponibles en `preview/home-v3.4.1-commercial-interaction-fix/before-after/`.

## MOTION EVIDENCE

- Ruta de integración: `preview/home-v3.4.1-commercial-interaction-fix/motion-evidence/integration-automation-route/`.
- Transición de iniciativa: `preview/home-v3.4.1-commercial-interaction-fix/motion-evidence/ecosystem-conecta-transition/`.

Las secuencias muestran activación contenida, sin desmontar ni desplazar caóticamente la escena.

## RESPONSIVE READINESS

La composición usa SVG con `viewBox`, Grid/Flex y tamaños fluidos. Incluye una preparación estructural para tablet y móvil, además de `prefers-reduced-motion`; esta etapa solo cierra y evidencia el gate desktop solicitado.

## KNOWN ISSUES

No hay bloqueos conocidos en desktop. Tablet y móvil no forman parte de la revisión visual de esta etapa y deben validarse en una iteración posterior antes de cualquier eventual publicación.

## PRODUCTION STATUS

Producción permanece intacta. No se hizo push a `main`, merge, deploy, cambio de Cloudflare, activación de recursos ni acción con posibilidad de cobro.

VITAIROS V3.4.1 LISTA PARA REVISIÓN COMERCIAL DESKTOP. PRODUCCIÓN NO MODIFICADA.
