# VITAIROS-M V2 — Brand extraction y dirección de diseño

Fecha de análisis: 2026-10-14

Rama de trabajo: `vertical-v2/vitairos-m`

Estado: análisis previo a implementación; producción no modificada.

## Attachments reviewed

- `Continuidad en salud mental digital (1).png`, 816 × 1928 px, entregado como pendón maestro.
- La carpeta de material visual no contiene un archivo de logo VITAIROS-M separado. El logo aparece dentro del pendón.
- La homepage VITAIROS V3.2.1 y sus capturas del repositorio se revisaron únicamente como barra de calidad de composición, interacción, responsive y accesibilidad.

## New logo

El logo aprobado combina:

- isotipo circular abierto con árbol/persona central;
- red de nodos en verde, turquesa y azul;
- hojas inferiores en gradiente;
- wordmark `VITAIROS-M` en azul tinta con la `M` verde;
- descriptor `SALUD MENTAL DIGITAL` con tracking amplio.

Reglas de uso:

- no usar el cerebro coral de la versión anterior;
- no redibujar, vectorizar ni reinterpretar el logo;
- no cambiar color, proporción ni espaciado;
- para la implementación local se permite únicamente un recorte determinista de los píxeles originales del pendón, sin IA ni reconstrucción;
- el recorte debe conservar isotipo, wordmark y descriptor completos. Si no resulta suficientemente nítido, debe tratarse como asset provisional y no publicarse hasta recibir el archivo oficial.

## Primary colors

Los valores se estimaron mediante muestreo de píxeles del pendón. Las pequeñas variaciones visibles corresponden a antialiasing y gradientes.

| Token | Valor | Uso | Fuente visual |
| --- | --- | --- | --- |
| `--m-bg-primary` | `#FEFEFE` | fondo principal | fondo blanco cálido del pendón |
| `--m-bg-secondary` | `#F2F8FB` | bandas y superficies suaves | cápsulas y bloque de cierre |
| `--m-surface` | `#FFFFFF` | tarjetas y paneles | superficies limpias del pendón |
| `--m-text-primary` | `#000E2E` | títulos, navegación, texto de alta jerarquía | titulares y wordmark |
| `--m-text-secondary` | `#536477` | párrafos y metadatos | texto secundario del pendón |
| `--m-accent-primary` | `#00C98E` | continuidad, estados iniciales, CTA | extremo verde del gradiente |
| `--m-accent-cyan` | `#00B9D3` | transición y conexión | centro turquesa/cian |
| `--m-accent-secondary` | `#00A5F4` | profesional, estados finales, foco | extremo azul del gradiente |

## Secondary colors

| Token | Valor | Uso | Fuente visual |
| --- | --- | --- | --- |
| `--m-mint-soft` | `#DDF6F0` | fondos de cápsulas de persona/contexto | cápsulas verdes del circuito |
| `--m-blue-soft` | `#E1F3FE` | fondos de cápsulas profesional/síntesis | cápsulas azules del circuito |
| `--m-line` | `rgba(0, 165, 244, .16)` | bordes y líneas auxiliares | red de nodos translúcida |
| `--m-line-strong` | `rgba(0, 185, 211, .34)` | conexiones activas | flechas circulares |
| `--m-glow` | `rgba(0, 201, 142, .18)` | halos suaves | círculos detrás de iconos |

## Gradients

- Principal: `linear-gradient(100deg, #00C98E 0%, #00B9D3 54%, #00A5F4 100%)`.
- Superficie: blanco a azul hielo, con contraste muy bajo.
- Onda: turquesa y azul a menos de 12% de opacidad.
- No usar gradientes oscuros coral/verde de la versión anterior.

## Typography

- El pendón utiliza una sans geométrica limpia y amable, con titulares muy pesados y cuerpo ligero.
- `Outfit` variable ya existe en el repositorio y es la aproximación disponible más coherente; evita una descarga externa.
- Titulares: 700–820, tracking levemente negativo, líneas compactas.
- Cuerpo: 380–470, tracking neutro, interlineado generoso.
- Etiquetas: mayúsculas, tracking amplio, peso 650–750.
- El wordmark no se recompone tipográficamente: siempre se muestra desde el asset oficial/provisional exacto.

## Shapes

- círculos abiertos y halos concéntricos;
- cápsulas redondeadas de baja altura;
- conectores curvos con flechas pequeñas;
- nodos circulares sólidos;
- ondas amplias y translúcidas en bordes;
- tarjetas blancas con radios generosos y sombra difusa mínima.

## Patterns

- constelaciones de nodos y líneas con baja opacidad;
- continuidad representada como un circuito orgánico, no como un pipeline rígido;
- alternancia verde → cian → azul para expresar paso de persona a profesional;
- uso amplio de espacio negativo; el patrón nunca compite con el contenido.

## Visual language

La dirección es luminosa, humana y tecnológica. La tecnología se expresa mediante conexiones y estados, no mediante cerebros digitales, robots, partículas o interfaces clínicas. El color oscuro aparece como tinta y contraste puntual, no como fondo dominante.

La firma visual será un `Continuity Loop`: una trayectoria orgánica que conecta persona, contexto, síntesis autorizada, profesional, retorno y readaptación alrededor de VITAIROS-M. En web se reinterpretará con SVG/CSS accesible, sin intentar reconstruir el isotipo.

## Motion language

- activación progresiva de nodos al entrar en viewport;
- desplazamiento lento de un pulso por la trayectoria;
- elevación mínima de tarjetas y botones;
- apariciones de 450–700 ms con desplazamiento menor a 16 px;
- sin scroll-jacking, parallax agresivo ni loops llamativos;
- con `prefers-reduced-motion`, todo el contenido aparece de inmediato y la ruta queda estática.

## Elements to preserve

- narrativa sobre la brecha entre pedir ayuda y recibir atención;
- disclaimer claro: no diagnostica ni reemplaza la atención profesional;
- distinción entre personas, profesionales e instituciones;
- estado honesto de MVP/validación;
- recursos oficiales de ayuda inmediata, verificados el 2026-10-14;
- SEO base, canonical y pertenencia a VITAIROS SpA;
- formulario de contacto, sujeto al estándar de privacidad corporativo actual.

## Elements to retire

- cerebro coral como marca VITAIROS-M;
- paleta `#081D16 / #DD7A52` aplicada a esta vertical;
- cordillera/amanecer como firma visual;
- favicon embebido inventado para VITAIROS-M;
- claims presentados como producto disponible: “chat siempre disponible”, “orientación 24/7” y agenda directa;
- intro de 3 segundos;
- tarjetas de métricas sin evidencia y barra de progreso visual que aparenta avance cuantificado;
- navegación flotante lateral en pantallas pequeñas.

## Differences vs current website

| Área | Página actual | V2 |
| --- | --- | --- |
| Identidad | verde oscuro + coral, cerebro lineal | blanco + verde/cian/azul, logo árbol-red |
| Firma | cordillera y amanecer | circuito de continuidad persona–profesional |
| Mensaje | acceso 24/7 y agenda como presentes | separación explícita entre propuesta y desarrollo |
| Tipografía | Space Grotesk + Source Serif | Outfit variable, consistente con el pendón |
| Arquitectura | HTML/CSS/JS en un archivo | responsabilidades separadas |
| Formulario | sin consentimiento de privacidad | checkbox obligatorio, no preseleccionado, versión 2026-10 |
| Favicon | SVG embebido no oficial | favicon corporativo raíz |
| Intro | hasta 3 s | omitida; no aporta frente a una entrada directa y luminosa |

## Current site audit

### KEEP

- canonical, Open Graph, Twitter Card y un único H1;
- enlace claro al ecosistema VITAIROS;
- mensaje de no sustitución profesional;
- recursos de ayuda inmediata;
- FormSubmit como mecanismo ya utilizado por el sitio;
- estado `MVP en validación`, sujeto a lenguaje más preciso.

### IMPROVE

- navegación semántica y móvil;
- foco visible, orden de teclado y restauración de foco;
- CTA alineado al estado real: conversar/explorar, no prometer acceso;
- jerarquía de persona y profesional;
- densidad de texto y ritmo vertical;
- performance al separar CSS/JS y evitar fuentes externas;
- mensajes de validación y estado del formulario.

### REMOVE

- paleta, isotipo y hero anteriores;
- animación de intro de 3 segundos;
- claims no demostrados, métricas decorativas y progreso ficticio;
- hover con fondos recalculados por puntero;
- dependencias de Google Fonts.

### REWRITE

- hero alrededor de “La vida no ocurre solo en la sesión”;
- “cómo funciona” como visión de continuidad, no como funcionalidad productiva confirmada;
- rutas de persona/profesional con consentimiento como límite central;
- seguridad y criterio con una lista explícita de lo que VITAIROS-M no hace;
- cierre y CTA como invitación a conversar sobre la propuesta.

### VERIFY

- disponibilidad real de cada módulo antes de pasar cualquier elemento de “en construcción” a “disponible”;
- responsable y endpoint final del formulario;
- URL pública de una política de privacidad específica para VITAIROS-M;
- archivo oficial limpio del logo y eventual Open Graph propio;
- evidencia de pruebas con usuarios/profesionales antes de afirmarlo como hecho.

## Design direction

### Section map

1. Header mínimo: logo exacto, navegación corta y regreso a VITAIROS.
2. Hero: promesa de continuidad, estado “en desarrollo” y CTA realista.
3. La brecha: lo que ocurre fuera de la sesión.
4. Continuity Loop: visual central de persona → contexto → profesional → retorno.
5. Dos perspectivas: persona y profesional en una sola experiencia.
6. Experiencia propuesta: pasos y capacidades etiquetados como visión de producto.
7. Seguridad y criterio: consentimiento, control y límites clínicos.
8. Estado: qué existe y qué se está construyendo.
9. Ecosistema VITAIROS: relación con Industrial AI, Agro Intelligence y Conecta.
10. CTA/formulario: conversar o participar en validación.
11. Footer: VITAIROS SpA, privacidad y recursos oficiales.

### Visual rhythm

- hero amplio y asimétrico;
- alternancia entre secciones blancas y superficies hielo;
- una sección tinta oscura puntual para seguridad/criterio, manteniendo la identidad luminosa;
- bloques densos contenidos entre zonas de alto espacio negativo;
- transiciones mediante ondas y redes discretas, no franjas duras repetidas.

### Hero composition

- columna izquierda: estado, H1, texto breve, CTA y nota de alcance;
- columna derecha: `Continuity Loop` simplificado con persona y profesional como polos;
- logo visible en header y hero solo mediante el asset exacto;
- sin fotografía stock ni esfera corporativa.

### Main signature visual

El `Continuity Loop` usa seis nodos: Persona, Contexto, Síntesis consentida, Profesional, Retorno autorizado y Readaptación. El centro reserva espacio para el logo exacto o, si no alcanza nitidez, para el nombre textual accesible acompañado por la etiqueta “asset oficial pendiente”, nunca para un logo redibujado.

### Mobile strategy

- header compacto con menú modal de pantalla completa;
- circuito convertido en recorrido vertical sin perder orden semántico;
- pestañas de persona/profesional pasan a acordeones o tarjetas apiladas;
- CTAs al ancho disponible, objetivos de toque de 44 px o más;
- patrones decorativos recortados para evitar overflow y carga visual.

### Motion moments

- entrada del hero sin intro bloqueante;
- trazado gradual del `Continuity Loop` al aparecer;
- cambio de estado en tabs/tarjetas por foco, hover y click;
- progreso de lectura superior opcional;
- todo desactivado o reducido con `prefers-reduced-motion`.

### CTA strategy

- primario: `Conversar sobre VITAIROS-M`;
- secundario: `Explorar la propuesta`;
- formulario: interés en validación, colaboración o conversación institucional;
- no usar “comienza tu terapia”, “habla con IA” ni “obtén diagnóstico”.

## Asset risk

El único logo VITAIROS-M disponible está rasterizado dentro del pendón. La implementación puede avanzar localmente con un recorte exacto y reversible para validar diseño, pero la recomendación de salida a producción es sustituirlo por el SVG/PNG oficial de alta resolución antes de publicar.
