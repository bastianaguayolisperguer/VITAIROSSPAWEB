# Auditoría premium de la homepage VITAIROS

Fecha: 2026-10-12  
Alcance: rama preview `homepage-v2-ai-positioning`  
Producción: no modificada

## Resumen ejecutivo

La V2 ya resolvía deuda crítica de la homepage productiva: retiró el archivo HTML monolítico, eliminó claims sin respaldo, incorporó el ecosistema y reposicionó la marca hacia inteligencia artificial aplicada. Sin embargo, las iteraciones visuales posteriores dejaron capas de CSS con direcciones opuestas: superficies claras editoriales, paneles oscuros superpuestos y finalmente una corrección que volvió todo el sitio oscuro. El resultado era funcional, pero sin progresión y con cambios cromáticos poco naturales.

La iteración premium conserva los activos correctos —intro, isotipo, esfera, logos reales, rutas de proyecto, Outfit local, formulario y datos estructurados— y reorganiza el relato comercial alrededor de la brecha de implementación de IA.

## Comparación: producción original, V2 y Conecta

| Dimensión | Homepage original (`main`) | V2 previa | Conecta | Decisión premium |
|---|---|---|---|---|
| Posicionamiento | Estudio/software y servicios amplios | IA aplicada, aún explicada desde capacidades | Propósito educativo muy claro | IA aplicada + ingeniería digital desde un problema empresarial concreto |
| Hero | Mucho contenido y CTAs fragmentados | Mejor foco, pero promesa menos directa | Jerarquía y CTA nítidos | Mensaje literal: “Hacemos que la IA funcione dentro de tu organización” |
| Ritmo | Largo y denso | Alternancia primero brusca y luego oscuridad continua | Capítulos visuales distinguibles | 70/30 oscuro-claro con transiciones graduales, sin paneles flotantes |
| Motion | Variado y costoso | Intro y esfera mejoradas | Sistema consistente y sobrio | Duraciones unificadas, intro 1,45 s, repetición evitada con `sessionStorage` |
| Ecosistema | No era eje de navegación | Cuatro iniciativas visibles | Navegación y programas claros | Arquitectura de marca explícita + logos reales en esfera y tarjetas |
| Evidencia | Claims y vacantes sin control suficiente | Claims riesgosos retirados | Evidencia prudente | Actualidad alimentada por JSON y solo con `verified: true` |
| Contacto | Formularios y modales múltiples | Un formulario | Flujo simple | Nombre, empresa, email, área opcional y mensaje |
| Responsive | Desktop comprimido | Mejorado, pero hero y color dominaban | Mobile diseñado | Timeline vertical, esfera contenida, cards a una columna y CTA apilado |

## Hallazgos principales

### Conservar

- Isotipo oficial y paleta corporativa.
- Outfit como tipografía local compartida con Conecta y el brand kit.
- Esfera geométrica de canvas y proyectos anclados a vértices reales.
- Navegación accesible, progreso de lectura, `prefers-reduced-motion` y reveals.
- Rutas públicas de VITAIROS-M, Industrial AI, Agro Intelligence y Conecta.
- Separación de HTML, CSS, JavaScript, datos y assets.

### Corregir

- Narrativa que comenzaba por capacidades en lugar de la brecha organizacional.
- Falta de una sección problema → valor.
- Método de cuatro etapas sin piloto explícito.
- Misma atmósfera oscura durante todo el recorrido.
- Logos de la esfera demasiado protagonistas respecto de la red.
- Ausencia de actualidad corporativa verificable y trabajo con nosotros controlado por datos.
- Contacto con teléfono innecesario y clasificación obligatoria demasiado temprana.

### Eliminar o no migrar

- Precios empaquetados, vacantes antiguas, múltiples formularios y modales laborales.
- Métricas de clientes, entregas, países, ROI, partners o resultados sin evidencia verificable.
- Decoración que no apoye jerarquía, interacción o storytelling.
- Presentación de las verticales como empresas separadas.

## Benchmark interno: Home vs Conecta

Conecta destaca por claridad de capítulos, consistencia tipográfica, microinteracciones contenidas, navegación, responsive y sensación de producto terminado. La home corporativa adopta esos estándares sin copiar su estética educativa: usa mayor contraste, menos ilustración, una retícula más editorial y una voz B2B.

Resultado esperado de esta iteración:

- Identidad: igual o superior.
- Ritmo: igual o superior.
- Motion: igual.
- Spacing: superior para contexto corporativo.
- Claridad comercial: superior.
- Responsive: igual.
- Premium feel: superior.

## Tipografía

Se mantiene Outfit como única familia. Sora no existe en los assets actuales, mientras Outfit está autoalojada y sostiene tanto la homepage como Conecta. Introducir otra familia aumentaría peso y fragmentaría la identidad sin aportar una mejora demostrable.

## Restricciones respetadas

- Sin cambios en `main`.
- Sin merge, push, DNS, Cloudflare ni despliegue de producción.
- Sin CMS nuevo.
- Sin herramientas analíticas invasivas.
- Sin claims nuevos no verificables.
