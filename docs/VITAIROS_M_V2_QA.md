# VITAIROS-M V2 — Informe de implementación y QA

> Informe histórico de la entrega V2. La evidencia y el estado vigentes están documentados en `VITAIROS_M_V2_1_POLISH.md`.

Fecha: 2026-10-14

Rama: `vertical-v2/vitairos-m`

Base: `5e1feca` (`main`)

Estado: lista para validación; producción no modificada.

## Alcance implementado

- Rediseño completo de `/vitairos-m/` en HTML, CSS y JavaScript nativos separados.
- Identidad derivada del pendón maestro: blanco, azul tinta y gradiente verde–cian–azul.
- Logo tomado mediante recorte determinista del pendón, sin IA, redibujo ni reinterpretación.
- Narrativa centrada en continuidad antes, entre y después de la atención profesional.
- Separación visible entre información vigente y visión de producto en construcción.
- Rutas diferenciadas para persona y profesional mediante pestañas accesibles.
- Sección explícita de seguridad, consentimiento y límites clínicos.
- Formulario de contacto con consentimiento obligatorio, no preseleccionado, y versión de privacidad `2026-10`.
- Política de privacidad y términos en diálogos con foco contenido, cierre con `Escape` y restauración de foco.
- Recursos oficiales de ayuda inmediata en el footer.
- SEO técnico: canonical, Open Graph, Twitter Card y JSON-LD.

## Evidencia visual

Las capturas están en `preview/vitairos-m-v2/`:

1. `01-hero-desktop.png`
2. `02-hero-mobile.png`
3. `03-full-desktop.png`
4. `04-full-mobile.png`
5. `05-problema-continuidad.png`
6. `05b-continuidad.png`
7. `06-experiencia-persona.png`
8. `07-experiencia-profesional.png`
9. `08-seguridad-limites.png`
10. `09-ecosistema-cierre.png`
11. `10-cta.png`
12. `11-navigation.png`
13. `12-reduced-motion.png`

## Viewports validados

| Viewport | Resultado |
| --- | --- |
| 1920 × 1080 | Sin overflow horizontal, errores de consola ni requests fallidas |
| 1440 × 900 | Sin overflow horizontal, errores de consola ni requests fallidas |
| 1366 × 768 | Sin overflow horizontal, errores de consola ni requests fallidas |
| 1024 × 768 | Sin overflow horizontal, errores de consola ni requests fallidas |
| 768 × 1024 | Sin overflow horizontal, errores de consola ni requests fallidas |
| 430 × 932 | Sin overflow horizontal, errores de consola ni requests fallidas |
| 390 × 844 | Sin overflow horizontal, errores de consola ni requests fallidas |
| 360 × 800 | Sin overflow horizontal, errores de consola ni requests fallidas |

La prueba automatizada vive en `tests/vitairos-m-v2-qa.mjs` y también verifica:

- respuesta HTTP 200;
- un único `h1`;
- landmarks `header`, `main`, `footer` y navegación;
- campos de formulario con etiqueta;
- ausencia de enlaces sin `href` y botones sin `type`;
- respeto del atributo `hidden`;
- activación del tab Profesional;
- apertura y cierre del menú móvil con `Escape`;
- apertura y cierre del diálogo de privacidad con `Escape`;
- contenido visible con `prefers-reduced-motion: reduce`.

Resultado final: 8/8 viewports aprobados, cero fallos registrados.

## Accesibilidad y contraste

- Orden semántico y navegación por teclado conservados.
- Foco visible de 3 px y objetivos principales de interacción de al menos 44 px.
- Menú móvil de pantalla completa con bloqueo de scroll y foco inicial.
- Controles de formulario asociados a sus etiquetas.
- El consentimiento de privacidad es requerido y parte desmarcado.
- Las animaciones se eliminan o reducen con `prefers-reduced-motion`.
- Se añadió `--m-accent-text: #007F9E` para texto pequeño sobre blanco (contraste 4,64:1).
- El gradiente de texto sobre fondo claro usa `#008E70 → #007F9E → #006FB8`; los acentos luminosos originales se reservan para fondos oscuros, iconos y decoración.

## Presupuesto de carga inicial

| Recurso crítico | Peso | Gzip aproximado |
| --- | ---: | ---: |
| HTML | 29,6 KB | 7,8 KB |
| CSS | 52,3 KB | 10,6 KB |
| JavaScript | 8,3 KB | 2,3 KB |
| Fuente local Outfit | 110,9 KB | 57,0 KB |
| Logo PNG | 54,1 KB | 54,2 KB |

Total inicial aproximado: 255 KB sin comprimir y 132 KB transferidos con gzip, sin librerías de ejecución, trackers ni fuentes remotas. La imagen Open Graph (355,7 KB) no forma parte de la carga de la página.

## Comparación con el pendón

Se conserva:

- el logo árbol–red y su descriptor;
- la paleta luminosa verde–cian–azul;
- la tipografía geométrica, la tinta azul oscuro y el espacio negativo;
- la frase central sobre que la vida no ocurre solo en la sesión;
- el circuito persona–contexto–síntesis–profesional–retorno–readaptación;
- las cápsulas, nodos, líneas y ondas translúcidas.

La adaptación web introduce una jerarquía editorial más extensa, interacción accesible, estados de producto honestos y una sección oscura puntual para explicar seguridad y límites. No reutiliza la identidad coral/verde ni el cerebro de la versión anterior.

## Riesgos y decisiones pendientes

- Nota histórica: V2.2 autorizó formalmente el recorte exacto del pendón como activo web oficial; dejó de ser un bloqueo de producción.
- FormSubmit mantiene el endpoint existente. Antes de publicar se debe confirmar responsable, correo receptor y texto legal definitivo.
- Las capacidades señaladas como `Visión de producto` no deben promocionarse como disponibles hasta su validación funcional, clínica y legal.
- No se ejecutó despliegue, merge a `main` ni cambio de producción.
