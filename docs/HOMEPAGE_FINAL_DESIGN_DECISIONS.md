# Decisiones finales de diseño — VITAIROS Home Premium

Fecha: 2026-10-13

Estado: lista para revisión en preview

Rama: `homepage-v2-ai-positioning`

## Principio rector

Menos elementos, más impacto. La página debía sentirse como una marca corporativa de inteligencia artificial aplicada, no como un catálogo de servicios ni una colección de landing pages.

## Qué se eliminó

- Pills de IA, software, automatización y datos en el hero.
- Banda de diagnóstico, piloto, integración y escala bajo el hero.
- Proof line adicional en el hero.
- Paso independiente de “Diseño” en la metodología.
- Cinco argumentos repetitivos dentro de “Quiénes somos”.
- Panel lateral explicativo del formulario final.
- Bloque grande de carreras dentro del recorrido principal.
- Copy de noticia centrado en el medio externo.
- Capas históricas de CSS que aplicaban direcciones visuales incompatibles.

## Qué se fusionó

- Valor y capacidades: los problemas contienen sus capacidades asociadas y comparten un rail editorial.
- Valor y metodología: ambas secciones viven dentro de una única región clara.
- Diseño y piloto: experiencia, arquitectura, control y señales de éxito se resuelven dentro del piloto.
- Quiénes somos y por qué VITAIROS: un único capítulo breve de dos párrafos.
- Carreras y footer: estado de vacantes y enlace de perfil se trasladan a navegación secundaria.

## Qué se mantuvo

- Promesa “Hacemos que la IA funcione dentro de tu organización”.
- Supporting copy estratégico.
- Intro de marca, esfera, cuatro nodos de proyectos y scroll reveals.
- Paleta VITAIROS y firma verde → turquesa → azul.
- Outfit local.
- Noticias desde JSON, vacantes desde JSON y formulario existente.
- Navegación accesible, legal, SEO, Open Graph y JSON-LD.

## Arquitectura final

1. Hero.
2. La brecha.
3. Dónde generamos valor.
4. Cómo trabajamos.
5. Ecosistema VITAIROS.
6. VITAIROS en movimiento.
7. Quiénes somos.
8. CTA final y contacto.
9. Footer.

## Decisiones visuales

### Oscuridad con progresión

La página es predominantemente oscura, pero usa variaciones de Abismo y Bosque, iluminación radial, tramas de nodos y cambios de densidad. No se alternan capítulos negros y blancos de forma repetitiva.

### Región clara única

“Dónde generamos valor” y “Cómo trabajamos” comparten una sola superficie Niebla/Papel. La entrada y salida usan curvas amplias, no un degradado vertical genérico. Esto crea un cambio editorial deliberado y evita la sensación de dos páginas pegadas.

### Composición antes que tarjetas

- La brecha usa una secuencia de sistema.
- Valor usa filas editoriales.
- Capacidades usa una lista técnica.
- Método usa un recorrido continuo.
- Solo ecosistema y evidencia conservan tarjetas porque representan entidades independientes.

### Fotografía

Solo aparecen fotografías que documentan actividades reales. No se agregaron stock ni espacios vacíos con placeholders.

## Decisiones de motion

- Intro de 1,45 s, omitida con `sessionStorage` y `prefers-reduced-motion`.
- Secuencia visual: red, nodos, isotipo y wordmark.
- Esfera fija únicamente en desktop durante hero y brecha.
- Transformación de esfera por `transform` y `opacity`: desplazamiento leve, escala de 1 a 0,88 y fade final.
- Sin scroll-jacking ni bloqueo de la rueda.
- Canvas pausado fuera del tramo narrativo y cuando la pestaña no está visible.
- Reveals de 0,75 s con retrasos máximos de 210 ms.
- Hover reservado para CTA, proyectos y evidencia.

## Decisiones de spacing

- Base de 8 px.
- Navegación: 80 px desktop, 72 px responsive.
- Separaciones de sección principales: 88, 104, 128, 152 y 170 px según función.
- Gaps editoriales: 16, 24, 32, 48, 72 y 112 px.
- Headings limitados por ancho en caracteres para evitar pantallas ocupadas por una sola frase.
- Formulario reducido a 920 px de ancho y un único panel.

## Decisiones mobile

- El hero deja de usar composición fija y se vuelve una columna propia.
- La esfera aparece después del copy y los CTA, sin sticky.
- La brecha se transforma en un recorrido vertical.
- La metodología usa una línea vertical con cuatro nodos.
- Proyectos y noticias pasan a una columna.
- El formulario pasa a campos apilados.
- El footer reorganiza marca, navegación y carreras sin ocultar contenido.
- Se validaron 430×932, 390×844 y 360×800 sin overflow ni clipping.

## Performance y accesibilidad

- Animaciones basadas en `transform` y `opacity`.
- Canvas con DPR limitado y render detenido fuera del tramo visible.
- Tipografía local, sin Google Fonts.
- CSS consolidado y reducido aproximadamente un 62%.
- Focus visible, Escape, foco restaurado y estados ARIA del menú.
- `prefers-reduced-motion` desactiva intro, sticky y animaciones.

## Límite de esta iteración

La implementación queda en preview local. No se realizó push, deploy, merge, modificación de `main`, DNS, Cloudflare Production ni rutas productivas.
