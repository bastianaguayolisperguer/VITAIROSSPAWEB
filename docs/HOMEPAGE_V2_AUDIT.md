# Auditoría de homepage VITAIROS V2

Fecha de cierre: 2026-10-12
Alcance: homepage corporativa en modo preview

## Estado inicial

La revisión cubrió la homepage, Conecta, VITAIROS-M, Industrial AI, Agro Intelligence, el perfil del fundador, `data/`, `robots.txt` y `sitemap.xml`.

La rama de trabajo es `homepage-v2-ai-positioning`. El repositorio ya contenía trabajo concurrente de Conecta; se preservó y no se mezcló manualmente con la implementación de homepage. No se modificó `main`, no se hizo merge, push ni despliegue.

## 1. Qué funcionaba

- Identidad reconocible: paleta Abismo, Bosque, Esmeralda, Neural, Pulso y Niebla.
- Outfit e isotipo de nodos ya conectaban la homepage con la marca.
- El hero tenía una esfera geométrica propia, una red de entrada y una presencia tecnológica diferenciada.
- Existían proceso, misión, visión, contacto, FAQ, modo claro y navegación móvil.
- La idea de software, automatización, integraciones e IA ya estaba presente.

Estos elementos se conservaron y refinaron en vez de reemplazarlos por otra identidad.

## 2. Qué estaba desactualizado

- El badge “Estudio de Software” y el headline “Diseñamos y construimos productos digitales que escalan” situaban la IA como un servicio secundario.
- La navegación dedicaba espacio a precios y vacantes, pero no a las cuatro iniciativas públicas.
- El contenido hablaba a startups, pymes y empresas como segmentos separados, sin una tesis corporativa común.
- La homepage no enlazaba VITAIROS-M, Industrial AI, Agro Intelligence ni Conecta.
- Había siete formularios o modales y mucho contenido legal/comercial dentro del DOM principal.
- La franja de palabras clave SEO era visible y añadía ruido editorial.

## 3. Señales de “software company”

- Promesa centrada en desarrollar productos y aplicaciones.
- Enumeración de stacks y entregables técnicos.
- Precios empaquetados para un trabajo que requiere diagnóstico.
- “Software, apps y plataformas” como primera categoría.
- CTA fragmentados por servicio en lugar de una conversación sobre el proceso.

## 4. Evolución hacia Applied AI Company

La nueva narrativa parte de una capacidad central: inteligencia artificial aplicada. Software, automatización, datos, integraciones y productos digitales pasan a ser los medios para llevar esa capacidad a una operación real.

El recorrido queda expresado como:

`problema → diagnóstico → diseño → piloto/implementación → medición → evolución`

Las cuatro iniciativas se muestran como expresiones de una visión compartida y no como empresas independientes.

## 5. Claims riesgosos detectados

Se retiraron de la homepage porque no existe respaldo verificable dentro del repositorio:

- “100% entregas a tiempo”.
- “Respuesta garantizada en 24h”.
- “+10 años de experiencia”.
- Clientes o cobertura demostrada en países específicos.
- “Propuesta en 48h”.
- Soporte incluido universalmente.
- Condiciones comerciales universales 30/40/30.
- Vacantes y comisiones de referidos como contenido corporativo vigente.
- Resultados, ROI, partners, clientes o casos de éxito no documentados.

También se retiraron absolutos contractuales. La propiedad intelectual, soporte, confidencialidad y condiciones comerciales deben depender del acuerdo correspondiente.

## 6. Duplicaciones y deuda de contenido

- Logo e imágenes se repetían como data URI dentro de `index.html`.
- CSS, JavaScript, contenido y assets estaban embebidos en un único archivo.
- FAQ visible y FAQ estructurado no coincidían.
- Se repetían propuestas similares en servicios, audiencias, precios y modales.
- El sitio declaraba una imagen Open Graph y un logo estructurado que no existían en esas rutas.
- El JSON-LD contenía un teléfono de ejemplo y datos locales no verificados.

## 7. Problemas de arquitectura

- `index.html` pesaba aproximadamente 1,05 MB, en gran medida por imágenes base64 repetidas.
- No existía un sistema corporativo compartido entre las verticales.
- La homepage no funcionaba como puerta de entrada al ecosistema.
- Los modales laborales y comerciales aumentaban complejidad, mantenimiento y riesgo de privacidad.
- El cursor glow usaba un loop continuo y algunas animaciones no respetaban de forma integral `prefers-reduced-motion`.

## 8. Performance

Baseline aproximado de la homepage anterior:

- `index.html`: 1.047 KB raw; aproximadamente 679 KB gzip.
- Fuente remota de Google Fonts.
- Tres copias grandes de una imagen embebida.
- Loader bloqueante cercano a tres segundos.

Estado de la evolución:

- `index.html`: 39.266 bytes; 10.024 bytes gzip.
- `assets/homepage.css`: 65.553 bytes; 13.755 bytes gzip.
- `assets/homepage.js`: 14.340 bytes; 4.412 bytes gzip.
- Outfit local: 110.884 bytes, cacheable por separado.
- Isotipo local: 12.663 bytes, cacheable por separado.
- Sin dependencia de Google Fonts ni assets base64 repetidos.
- JavaScript y CSS cacheables, canvas pausado fuera del viewport y cursor actualizado solo cuando existe movimiento.

El asset Open Graph no forma parte de la carga inicial de la página.

## 9. SEO preservado y corregido

Se conserva la intención de búsqueda relacionada con software a medida, automatización e IA para empresas. La nueva capa incorpora inteligencia artificial aplicada, integración de IA y procesos empresariales sin mostrar una lista artificial de keywords.

Correcciones:

- Canonical unificado con slash final.
- Title y description orientados a IA aplicada.
- Imagen Open Graph real de 1200×630 y `twitter:image`.
- `Organization`, `WebSite`, `Service` y `FAQPage` sin teléfono ficticio ni precio inventado.
- FAQ visible y estructurado sincronizados.
- H1 único, landmark `main` y enlaces editoriales a las cuatro iniciativas.
- `lastmod` de homepage actualizado al cierre de la V2.

## 10. Aprendizajes de Conecta reutilizados

- Separación de HTML, CSS y JavaScript.
- Outfit autoalojada.
- Jerarquía editorial consistente.
- Navegación y menú con gestión de foco.
- Reveal progresivo y soporte de movimiento reducido.
- Isotipo oficial servido como asset.
- Componentes con menos contenido y una función clara.
- Evidencia omitida cuando todavía no está verificada.

No se copiaron la estética educativa, sus colores secundarios, blobs, tarjetas pastel ni tono comunitario. La homepage conserva una voz corporativa B2B y su visual geométrico original.

## Conclusión

La oportunidad no era sustituir el sitio por una plantilla nueva, sino hacer más legible su identidad existente. La evolución reduce deuda técnica y claims de riesgo, conecta el ecosistema y sitúa la IA aplicada como tesis corporativa defendible.
