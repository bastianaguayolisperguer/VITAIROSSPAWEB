# Auditoría de claims — homepage VITAIROS

Fecha: 2026-10-12  
Regla: solo información confirmada y trazable puede publicarse automáticamente.

## Claims retirados o no migrados

| Claim | Estado | Decisión |
|---|---|---|
| 100% de entregas a tiempo | Sin evidencia en el repositorio | No publicar |
| Respuesta garantizada en 24 horas | Sin política verificable | No publicar |
| Propuesta en 48 horas | Sin proceso verificable | No publicar |
| Más de 10 años de experiencia | Sin respaldo corporativo suficiente | No publicar |
| Número de clientes o proyectos | Sin fuente auditable | No publicar |
| Presencia o clientes en países específicos | Sin fuente auditable | No publicar |
| ROI, ahorro, usuarios o resultados | Sin caso documentado | No publicar |
| Partners, alianzas o premios | Sin documento corporativo verificable | No publicar |
| Vacantes históricas | Estado vigente no confirmado | Retiradas; `/data/jobs.json` vacío |

## Información confirmada publicada

| Información | Fuente | Uso |
|---|---|---|
| VITAIROS SpA y sus rutas públicas | Repositorio y navegación existente | Organización y ecosistema |
| VITAIROS-M, Industrial AI, Agro Intelligence y Conecta | Páginas públicas dentro del repositorio | Tarjetas y nodos de esfera |
| Participación citada en encuentro CNP / Centro de Innovación UC | Portal Minero, 6 de julio de 2026 | Actualidad y `milestones.json` |
| Incorporación a Mesa Técnica del Centro Nacional Talasa | Nota de Marga Marga Online ya referenciada en el repositorio | Actualidad y `milestones.json` |
| Publicación institucional de Duoc UC vinculada a formación aplicada | Publicación de Duoc UC ya referenciada en el repositorio | Actualidad |

## Lenguaje controlado

- “Diagnosticar”, “diseñar”, “integrar” y “acompañar” describen el enfoque, no garantizan resultados.
- “Escalar con evidencia” establece una condición de decisión, no promete escala.
- Las descripciones sectoriales explican problemas abordados; no afirman clientes, pilotos ni resultados.
- “Sesión inicial · 30 min.” describe el formato propuesto y evita presentarlo como consulta gratuita.

## Regla de publicación para datos

- Noticias: `verified` debe ser exactamente `true`.
- Hitos: `verified` debe ser exactamente `true` y contener una fuente.
- Vacantes: `status` debe ser exactamente `open`.
- Si no existen noticias verificadas, la sección se oculta.
- Si no existen vacantes abiertas, se muestra un estado explícito sin cargos inventados.
