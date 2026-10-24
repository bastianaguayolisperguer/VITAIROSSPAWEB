# VITAIROS Agro Intelligence — Website V2 Changelog

Fecha: 24 de octubre de 2026

Ruta preservada: `https://www.vitairos.com/agro-intelligence/`

Branch: `agro-intelligence-v2`

| SECCIÓN | ANTES | DESPUÉS | MOTIVO |
|---|---|---|---|
| Hero | Abría con “IA aplicada” y un dashboard demostrativo. | Abre con control de riego, datos existentes y una fotografía editorial de operación agrícola real. | Vender primero el beneficio operacional y comunicar el wedge hídrico en menos de cinco segundos. |
| Problema | Cuatro tarjetas genéricas de fragmentación, tiempo, rezago y automatización. | Flujo visual: fuentes existentes → fragmentación → consolidación manual → baja visibilidad. | Hacer visible la causa operacional antes de presentar la solución. |
| Riego | Era un módulo dentro de una oferta amplia. | Sección propia “Empezamos por el agua”, con riego, registros, contexto y decisión. | Explicar por qué la gestión hídrica es el primer caso de uso. |
| Cómo funciona | Arquitectura mezclada con tecnología y fuentes futuras. | Diagrama responsive “Tus datos → Agro Intelligence → Tu operación”. | Comprensión en cinco segundos y separación clara entre inputs, procesamiento y outputs. |
| Integración | Se mencionaban APIs e IoT dentro de una narrativa técnica. | Dos modalidades: Plataforma VITAIROS o capa integrada, bajo el principio “Nos integramos antes de pedir reemplazar”. | Reducir fricción comercial y proteger inversiones existentes. |
| Sustentabilidad | Asociada de forma amplia a eficiencia hídrica. | Vinculada explícitamente a datos → visibilidad → decisiones → medición → oportunidades de eficiencia. | Evitar greenwashing y mantener una tesis verificable. |
| Fuentes futuras | Sensores, clima, satélite, drones y 5G aparecían junto a capacidades actuales. | Tablero “Hoy / Siguiente etapa” con roadmap sujeto a caso de uso y factibilidad. | No presentar integraciones futuras como productivas hoy. |
| Método | Diagnóstico, piloto y escalamiento en tres pasos. | Levantamiento → baseline → piloto → medición → implementación → recurrencia. | Transmitir una entrada de bajo riesgo y evidencia antes de escalar. |
| Validación | No existía una evidencia de terreno específica. | “Primera validación en terreno junto a Duoc UC Quillota”, marcada como “En preparación”. | Incorporar validación real sin convertirla en cliente, caso de éxito o resultado demostrado. |
| Cross-industry | Solo comparaba Agro e Industrial AI. | Salud, Minería y Agro convergen en una disciplina común de software, datos, integraciones, automatización, IA aplicada y medición. | Comunicar experiencia transversal sin afirmar que VITAIROS “hace de todo”. |
| Equipo | No existía una sección de equipo. | Roles confirmados de Bastián Lisperguer, Ingrid Astrid Melo Pardo, Melany Cruzat y equipo tecnológico VITAIROS. | Mostrar capacidad interdisciplinaria sin inventar dedicación ni cargos. |
| CTA principal | Formulario genérico para varios casos de uso. | Diagnóstico de gestión hídrica con campos comerciales mínimos y backend FormSubmit preservado. | Alinear la conversión con el problema de entrada. |
| CTA partners | No existía. | CTA secundario para fabricantes, IoT, datos, telecomunicaciones y otras tecnologías agrícolas. | Abrir conversaciones de integración sin afirmar alianzas existentes. |
| SEO | Title y metadatos priorizaban IA, automatización y una oferta amplia. | Title, description, OG, Twitter y JSON-LD orientados a inteligencia operacional agrícola y gestión hídrica. | Mejorar relevancia semántica sin keyword stuffing. |
| Responsive | Landing responsive, con un dashboard complejo como principal visual. | Todos los diagramas cambian a flujo vertical; menú, CTA, cards y formulario fueron verificados en 1440, 1024, 768, 390 y 320 px. | Asegurar lectura, interacción y jerarquía sin depender de desktop. |
| Performance | HTML monolítico de 1,4 MB con cinco copias embebidas de la misma imagen. | HTML, CSS y JS separados; hero WebP responsive de 57/147/314 KB; carga principal aproximada de 221 KB antes de compresión HTTP. | Reducir transferencia, parsing y duplicación de assets. |
| Accesibilidad | Estructura básica correcta. | Landmarks semánticos, un único H1, skip link, labels explícitos, foco visible, controles nativos, objetivos táctiles y `prefers-reduced-motion`. | Mejorar navegación por teclado y tecnologías de asistencia. |
| Analytics | Sin eventos específicos visibles para la nueva narrativa. | Eventos no invasivos sobre `dataLayer` existente: `hero_cta`, `diagnostic_cta`, `integration_cta`, `contact_submit`, `email` y `scroll_depth`. | Preservar la infraestructura y añadir medición solo cuando `dataLayer` ya existe. |

## Matriz de decisión aplicada

| ACCIÓN | CONTENIDO |
|---|---|
| Mantener | Ruta, canonical, FormSubmit, privacidad, términos, correo, identidad cromática, logos y enlaces del ecosistema VITAIROS. |
| Mejorar | Hero, navegación, responsive, estructura semántica, formulario, SEO, performance y accesibilidad. |
| Eliminar | Hero centrado en IA, dashboard genérico, claims amplios de eficiencia/productividad y duplicación de data URIs. |
| Mover | Sensores, IoT, clima, imágenes, satélite, drones y 5G a una sección explícita de expansión. |
| Reescribir | Problema, riego, valor operacional, integración, sustentabilidad, método, validación, experiencia, equipo y CTAs. |

## FINAL PREPRODUCTION QA

| PROBLEMA DETECTADO | CORRECCIÓN | MOTIVO |
|---|---|---|
| El CTA del hero decía “Solicitar diagnóstico”, una formulación correcta pero genérica frente al wedge aprobado. | Se cambió a “Solicitar diagnóstico de gestión hídrica” y se verificó el scroll a `#diagnostico` en los cinco viewports. | Alinear la acción principal con la propuesta de entrada sin alterar jerarquía ni layout. |
| La imagen social original comunicaba agricultura y riego, pero no identificaba a VITAIROS ni Agro Intelligence. | Se compuso un OG JPEG 1200 × 630 con branding, tesis hídrica y fotografía operacional; se acortaron los títulos sociales y se añadieron alt de OG y Twitter/X. | Mejorar comprensión y atribución en previews de LinkedIn, WhatsApp y X. |
| La evidencia visual preliminar cubría solo 1440, 768 y 390 px. | Se regeneraron capturas full-page en 1440, 1024, 768, 390 y 320 px y una contact sheet; se retiraron capturas preliminares duplicadas. | Completar el gate responsive y dejar un set final único, reproducible y auditable. |
