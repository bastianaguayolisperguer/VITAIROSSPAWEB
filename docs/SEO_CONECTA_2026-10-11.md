# Auditoría SEO - VITAIROS Conecta

Fecha: 11 de octubre de 2026  
URL: `https://www.vitairos.com/conecta/`

## Resumen ejecutivo

La página tiene una base SEO sólida y es rastreable. Después de aplicar las mejoras técnicas de esta auditoría, la evaluación heurística general es **9,1/10**; no corresponde a una puntuación de Lighthouse. El contenido está servido como HTML estático, responde `200`, tiene canonical consistente, sitemap actualizado, robots permisivo, jerarquía semántica clara, datos estructurados válidos y metadatos sociales completos.

La optimización en código quedó aplicada. Los dos pendientes principales dependen de servicios externos al repositorio: preservar el path en la redirección del dominio sin `www` desde Cloudflare y solicitar/revisar la indexación desde Google Search Console.

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
| Imagen social | Open Graph de 1200 × 630 px y 118 KB |
| Isotipo responsive | Variantes de 128, 256 y 512 px; 12,7 KB, 33,1 KB y 93,7 KB |
| TTFB observado | 0,47 s en una comprobación puntual; no sustituye monitoreo |

## Fortalezas

1. Título, meta description, canonical, Open Graph completo y Twitter Card grande presentes.
2. Un solo H1 y estructura de secciones coherente.
3. Contenido original y sustantivo para jóvenes, personas mayores, educadores y organizaciones.
4. Enlaces internos hacia propósito, programas, metodología, impacto y contacto.
5. Sitemap y robots.txt correctamente publicados.
6. Datos estructurados sintácticamente válidos.
7. Diseño responsive, foco visible y soporte para `prefers-reduced-motion`.
8. Página estática con HTML, CSS y JavaScript livianos.

## Pendientes externos de prioridad alta

### 1. Corregir redirección sin `www`

`https://vitairos.com/conecta/` responde `301` hacia `https://www.vitairos.com/` y pierde el path. La regla de Cloudflare debe preservar la ruta completa, por ejemplo redirigiendo el host y manteniendo URI y query string.

Impacto: enlaces externos sin `www` terminan en la portada, diluyen relevancia y pueden comportarse como redirecciones blandas.

### 2. Solicitar indexación

Una consulta web por la URL o el nombre exacto no mostró todavía la página Conecta. Esto no prueba ausencia del índice, especialmente por tratarse de una publicación reciente. Verificar la URL en Google Search Console, reenviar el sitemap y solicitar indexación.

## Mejoras aplicadas en el repositorio

### Título optimizado

El título se redujo de 79 a 53 caracteres para disminuir el riesgo de truncamiento:

`VITAIROS Conecta | Educación digital e IA responsable`

La meta description tiene 155 caracteres y está bien ajustada.

### Metadatos sociales completos

Se incorporó una imagen Open Graph específica de `1200 × 630`, `summary_large_image`, dimensiones, tipo MIME y textos alternativos para Open Graph y Twitter.

### Validación HTML/ARIA corregida

Se añadieron roles compatibles a las agrupaciones etiquetadas, se definieron sus elementos de lista y se eliminó el `aria-hidden` redundante junto a `hidden`. Esto resuelve los cinco errores y la advertencia detectados en la revisión inicial.

### Isotipo optimizado

Se generaron variantes de 128, 256 y 512 px, se mantuvo el PNG maestro y se incorporaron `srcset`, tamaños explícitos, carga diferida en el footer y precarga para la animación inicial. El recurso principal de la entrada bajó de 408 KB a 33,1 KB, una reducción aproximada del 92%.

## Seguimiento recomendado

### Medir la animación inicial

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

1. Corregir en Cloudflare la redirección sin `www` preservando path y query string.
2. Solicitar indexación y revisar cobertura en Search Console.
3. Medir Core Web Vitals después del primer ciclo de tráfico.
4. Crear páginas por público cuando exista contenido suficiente.

## Estado de implementación

- [x] Título optimizado.
- [x] Tarjeta Open Graph 1200 × 630.
- [x] Twitter Card `summary_large_image` y textos alternativos.
- [x] Errores HTML/ARIA detectados corregidos.
- [x] Variantes responsive del isotipo y menor transferencia inicial.
- [ ] Redirección de host en Cloudflare con conservación de ruta.
- [ ] Inspección de URL y solicitud de indexación en Search Console.
- [ ] Datos de campo de Core Web Vitals.
