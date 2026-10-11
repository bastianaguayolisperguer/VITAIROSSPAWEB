# Auditoría SEO - VITAIROS Conecta

Fecha: 11 de octubre de 2026  
URL: `https://www.vitairos.com/conecta/`

## Resumen ejecutivo

La página tiene una base SEO sólida y es rastreable. La evaluación heurística general es **8,1/10**; no corresponde a una puntuación de Lighthouse. El contenido está servido como HTML estático, responde `200`, tiene canonical consistente, sitemap actualizado, robots permisivo, jerarquía semántica clara y datos estructurados válidos.

Las prioridades son preservar el path en la redirección del dominio sin `www`, crear una tarjeta Open Graph horizontal específica, reducir el título y corregir cinco errores de validación asociados a `aria-label` en elementos `div`.

## Evidencia comprobada

| Área | Resultado |
| --- | --- |
| Estado HTTP | `200 OK` |
| Canonical | `https://www.vitairos.com/conecta/` |
| Robots | `index, follow`; rastreadores permitidos |
| Sitemap | URL incluida con `lastmod` 2026-10-11 |
| HTML | Estático y legible sin depender de JavaScript |
| Encabezados | 1 H1, 9 H2 y 11 H3 |
| Imágenes | 3 de 3 con atributo `alt` |
| Datos estructurados | JSON-LD válido: `Organization` + `WebPage` |
| Transferencia observada | HTML 7,9 KB; CSS 11,4 KB; JS 2,45 KB comprimidos |
| Imagen principal | PNG transparente de 408 KB |
| TTFB observado | 0,47 s en una comprobación puntual; no sustituye monitoreo |

## Fortalezas

1. Título, meta description, canonical, Open Graph y Twitter Card presentes.
2. Un solo H1 y estructura de secciones coherente.
3. Contenido original y sustantivo para jóvenes, personas mayores, educadores y organizaciones.
4. Enlaces internos hacia propósito, programas, metodología, impacto y contacto.
5. Sitemap y robots.txt correctamente publicados.
6. Datos estructurados sintácticamente válidos.
7. Diseño responsive, foco visible y soporte para `prefers-reduced-motion`.
8. Página estática con HTML, CSS y JavaScript livianos.

## Prioridad alta

### 1. Corregir redirección sin `www`

`https://vitairos.com/conecta/` responde `301` hacia `https://www.vitairos.com/` y pierde el path. La regla de Cloudflare debe preservar la ruta completa, por ejemplo redirigiendo el host y manteniendo URI y query string.

Impacto: enlaces externos sin `www` terminan en la portada, diluyen relevancia y pueden comportarse como redirecciones blandas.

### 2. Crear tarjeta social horizontal

El `og:image` actual usa el isotipo cuadrado. Conviene publicar una pieza `1200 × 630`, cambiar Twitter a `summary_large_image` y añadir `og:image:width`, `og:image:height` y `twitter:image:alt`.

El kit visual incluye una propuesta Open Graph editable y exportada.

### 3. Solicitar indexación

Una consulta web por la URL o el nombre exacto no mostró todavía la página Conecta. Esto no prueba ausencia del índice, especialmente por tratarse de una publicación reciente. Verificar la URL en Google Search Console, reenviar el sitemap y solicitar indexación.

## Prioridad media

### 4. Acortar el título

El título actual tiene 79 caracteres. Es descriptivo, pero puede truncarse. Propuesta:

`VITAIROS Conecta | Educación digital e IA responsable`

La meta description tiene 155 caracteres y está bien ajustada.

### 5. Corregir validación HTML/ARIA

El validador Nu HTML del W3C reportó cinco errores por `aria-label` aplicado a `div` sin un rol compatible y una advertencia por `aria-hidden` redundante junto a `hidden`. No impiden indexación, pero conviene corregirlos para mantener semántica y accesibilidad consistentes.

### 6. Optimizar el isotipo

El isotipo transparente pesa 408 KB y se usa en tamaños pequeños. Generar variantes de 128, 256 y 512 px, conservar el PNG maestro y usar `srcset` o una variante optimizada para reducir transferencia inicial.

### 7. Medir la animación inicial

La animación aparece en cada carga por decisión de experiencia. El contenido permanece en el DOM y es rastreable, pero la capa visual puede afectar LCP percibido. Medir Core Web Vitals en Search Console y ajustar duración o estrategia si LCP supera 2,5 s.

## Crecimiento de contenido

Crear páginas específicas permitiría captar búsquedas de intención más concreta:

- `/conecta/jovenes/`
- `/conecta/personas-mayores/`
- `/conecta/educadores/`
- `/conecta/recursos/`
- `/conecta/impacto/`

Cada página debería incorporar preguntas frecuentes reales, ejemplos de actividades, público, modalidad, ubicación, CTA y datos estructurados pertinentes. Evitar crear páginas delgadas o repetir el mismo contenido.

## Datos estructurados sugeridos

Mantener `Organization` y `WebPage`. Cuando existan programas formalizados y datos verificables, considerar `Service` con `audience`, `areaServed` y `provider`. Añadir `BreadcrumbList` solo cuando existan páginas hijas reales.

## Limitaciones de la auditoría

- PageSpeed Insights respondió `429` por cuota pública agotada; no se asignó una puntuación inventada.
- No se tuvo acceso a Google Search Console ni a datos de campo de Core Web Vitals.
- Los tiempos de red informados provienen de una sola medición y son orientativos.

## Plan recomendado

1. Corregir la redirección sin `www` preservando el path.
2. Publicar la tarjeta Open Graph 1200 × 630 y completar metadatos sociales.
3. Corregir los cinco errores HTML/ARIA.
4. Optimizar tamaños del isotipo.
5. Solicitar indexación y revisar cobertura en Search Console.
6. Medir Core Web Vitals después del primer ciclo de tráfico.
7. Crear páginas por público cuando exista contenido suficiente.

