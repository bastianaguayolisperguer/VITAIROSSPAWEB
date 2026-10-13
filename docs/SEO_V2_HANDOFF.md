# SEO handoff — Homepage V3.2

Fecha: 2026-10-13. Esta iteración de refinamiento visual preserva fundamentos SEO; no sustituye una auditoría SEO final.

## Qué se mantuvo

- URL pública canónica `https://www.vitairos.com/`.
- `index, follow`.
- Metadata Open Graph y Twitter.
- `Organization`, `WebSite` y `Service` en JSON-LD.
- Un único `h1` y headings de capítulos jerárquicos.
- Contenido indexable en HTML; las interacciones no ocultan la tesis central.
- Enlaces internos a las cuatro iniciativas existentes.
- Fuente local con preload y sin dependencia de Google Fonts.

## Qué cambió

- No cambian title, description, canonical, robots, JSON-LD ni arquitectura de headings respecto de V3.
- Se mantienen exactamente dos historias verificadas desde `data/news.json`.
- El diagnóstico conserva cuatro pasos y suma “Trabaja con nosotros” como intención secundaria.
- Las etiquetas visibles de capítulo pierden numeración, sin cambiar la jerarquía semántica de headings.
- La imagen Open Graph se regenera desde el hero V3.1.
- Los cambios visuales de Método, Ecosistema y Evidencia no eliminan contenido indexable.

## Qué revisar después

- Definir y publicar `/nosotros/`, `/actualidad/` y `/trabaja-con-nosotros/` antes de convertir sus referencias en enlaces internos activos.
- Auditar sitemap y enlazado cuando existan esas páginas.
- Verificar imagen OG y cards sociales en producción.
- Ejecutar Lighthouse/WebPageTest contra el build servido por CDN.
- Revisar datos estructurados con Rich Results Test después del deploy aprobado.
- Medir consultas reales antes de ajustar lenguaje; no hacer keyword stuffing.
- Confirmar que la capa de analítica, si se agrega, respete consentimiento y privacidad.

## Claims

No se agregaron clientes, métricas, ROI, premios, usuarios, partners ni resultados. Las dos historias de actualidad provienen del dataset existente marcado como verificado y enlazan a su fuente.
