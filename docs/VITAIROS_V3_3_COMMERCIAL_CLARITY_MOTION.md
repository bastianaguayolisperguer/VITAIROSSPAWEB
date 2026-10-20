# VITAIROS V3.3 — Commercial Clarity & Meaningful Motion

Fecha de cierre: 2026-10-19

Alcance: home corporativa (`/`) en rama de preview local.

## STATUS

Implementación terminada y validada. La home conserva su identidad visual y ahora explica con mayor precisión qué hace VITAIROS, qué problemas aborda, cómo integra tecnología y cómo avanza desde diagnóstico hasta escalamiento.

## BASE SHA

`c77ade880948c28dd2eb2ad36d4a5a657158bced`

## NEW SHA

Corresponde al `HEAD` del commit local `Refine VITAIROS home clarity and meaningful motion`. El SHA exacto se registra en el handoff final, porque un commit no puede contener su propio hash.

## PREVIEW URL

`http://127.0.0.1:4173/?preview=v3.3`

## CONTENT AUDIT

La auditoría previa está en `docs/VITAIROS_V3_3_MOTION_CONTENT_AUDIT.md`. Se separaron COPY, LAYOUT y MOTION por sección; también se distinguieron problemas objetivos de comprensión de hipótesis visuales. La esfera está documentada como **EVOLUTION / TEST**, nunca como removal.

## HERO

Se mantuvo exactamente “Hacemos que la IA funcione dentro de tu organización.”, el CTA “Evaluar una oportunidad” y la estructura editorial. El posicionamiento ahora explicita que VITAIROS es una empresa chilena de inteligencia artificial aplicada e ingeniería digital. El texto secundario explica identificación de valor, prueba acotada e integración con procesos, datos y sistemas.

## SPHERE EVOLUTION

Se preservó la esfera histórica, el isotipo, los nodos, la profundidad, la paleta y la interacción. Se incorporaron rutas internas, jerarquía de nodos y señales luminosas en circulación para reforzar la lectura de red operativa. No se reemplazó el activo de marca; es una evolución visual a validar.

## PROCESS MOTION

El estado Proceso muestra pasos fragmentados, interrupciones y repetición que se ordenan dentro del mismo escenario visual. El copy identifica trabajo manual, repetitivo o difícil de escalar y el resultado es un flujo integrado.

## INFORMATION MOTION

El estado Información representa documentos, datos y señales inicialmente dispersos que convergen y se estructuran para volverse utilizables dentro de un proceso.

## DECISIONS MOTION

El estado Decisiones concentra múltiples señales en un punto de apoyo y mantiene explícitamente la decisión humana. No representa autonomía decisional de la IA.

## PRODUCT MOTION

El estado Producto ensambla IA, datos, automatización y software en una función digital concreta, sin recurrir a un mockup SaaS genérico.

## INTEGRATION MOTION

IA, software, datos, automatización e integraciones comienzan separados, se conectan a un sistema central y desembocan en “Operación”. El mensaje explica propósito definido, controles claros y conexión con la operación real.

## METHOD MOTION

Se mantuvo Diagnóstico → Piloto → Implementación → Escalamiento. Cada etapa tiene una microvisual semántica diferenciada: explorar pocos nodos, delimitar una zona, conectar sistemas y ampliar solo al final. El encabezado ahora dice “Del problema a una solución que funciona en tu operación.”

## CAPABILITY MESSAGE

“Una misma base tecnológica. Distintos desafíos.” responde directamente cuál es la capacidad de VITAIROS: combinar IA aplicada, software, automatización, datos e integración para resolver problemas concretos.

## INITIATIVES

Se mantuvieron VITAIROS-M, Industrial AI, Agro Intelligence y VITAIROS Conecta, sin alterar identidades ni verticales. Cada iniciativa declara sector, propuesta concreta y una secuencia semántica propia dentro de un mismo circuito visual.

## PRINCIPLES

Los principios se reescribieron como Problema primero, Probar en pequeño, Integrar con la operación y Escalar con evidencia. Un pulso de baja intensidad progresa con el scroll; el foco sigue siendo el contenido.

## VITAIROS IN MOTION

Se mantuvo el título “VITAIROS en movimiento.” y se eliminó “compañía en construcción”. El nuevo texto presenta proyectos, iniciativas y participaciones como evidencia de aplicación tecnológica en distintos contextos.

## CONTENT CHANGED

- Eyebrow y lead del hero.
- Descripciones y resultados de Proceso, Información, Decisiones y Producto.
- Mensaje y explicación de integración tecnológica.
- Encabezado y cuerpos del método.
- Mensaje de capacidad central y descripciones de las cuatro iniciativas.
- Principios y texto de “VITAIROS en movimiento”.

## CONTENT PRESERVED

Se preservaron el titular principal, CTA, metodología de cuatro pasos, cuatro iniciativas, formulario diagnóstico, destinatarios, consentimiento, política de privacidad, metadatos SEO, canonical, favicon, structured data, sitemap, robots, footer y enlaces existentes.

## VISUAL IDENTITY PRESERVED

Se conservaron marca, isotipo oficial, tipografía, fondos oscuros, paleta Abismo/Bosque/Esmeralda/Neural/Pulso, esfera, nodos, líneas, gradientes, profundidad y lenguaje tecnológico premium. No se añadieron librerías ni dependencias visuales pesadas.

## RESPONSIVE

Validado en 1920×1080, 1440×900, 1366×768, 1024×768, 768×1024, 430×932, 390×844 y 360×800. En todos los tamaños: 0 overflow horizontal, secciones presentes, un solo `h1`, 0 IDs duplicados, 0 errores de consola del sitio, 0 requests fallidas y 0 respuestas HTTP defectuosas.

## REDUCED MOTION

`prefers-reduced-motion` mantiene lectura completa: esfera con fallback, integración conectada, fragmentos semánticos visibles, textos visibles y estados finales claros. Ninguna información depende de que una animación se ejecute.

## QA

- `tests/home-v3-3-qa.cjs`: 8 breakpoints, interacciones, estados semánticos, reduced motion y 17 capturas; `failures: []`.
- `tests/homepage-release-candidate-qa.cjs`: formulario comercial y laboral, consentimiento, privacidad, focus trap, estados inválido/éxito, SEO y rutas; `failures: []`. Los envíos se interceptaron y no se enviaron datos reales.
- `node --check`: JavaScript de home y scripts QA válido.
- Peso transferido de la home local: 443.191 bytes en total, sin nuevas dependencias externas.

### Test de comprensión

- **¿Qué es VITAIROS?** Hero: empresa chilena de IA aplicada e ingeniería digital.
- **¿Qué hace?** Hero e Integración: identifica oportunidades, prueba e integra IA, software, automatización y datos en la operación.
- **¿Qué problemas interviene?** Proceso / Información / Decisiones / Producto.
- **¿Con qué capacidades?** Integración y Capacidad central.
- **¿Cómo trabaja?** Método de cuatro etapas.
- **¿Dónde lo aplica?** Ecosistema de cuatro iniciativas.
- **¿Qué debe hacer el visitante?** CTA “Evaluar una oportunidad” y diagnóstico guiado.

## LIGHTHOUSE

Medición local final en desktop:

- Performance: **100** (objetivo ≥ 92).
- Accessibility: **100** (objetivo ≥ 98).
- Best Practices: **96** (objetivo ≥ 95).
- SEO: **100** (objetivo ≥ 95).
- FCP: **1,1 s**; LCP: **1,4 s**; TBT: **0 ms**; CLS: **0**.

El único aviso de consola registrado por Lighthouse proviene de una extensión administrada de Edge y no del código ni de los recursos del sitio.

## SCREENSHOTS

Las 17 capturas obligatorias están en `preview/home-v3.3-commercial-clarity-motion/screenshots/`, numeradas `01` a `17`. Los comparativos de esfera, problema, integración, método y ecosistema están en `before/` y `after/` dentro de la misma carpeta de evidencia.

## MOTION EVIDENCE

La infraestructura local se utilizó sin agregar dependencias pesadas. Se generaron secuencias de frames en `preview/home-v3.3-commercial-clarity-motion/motion-evidence/`: 3 frames de esfera, 4 estados de problema, 3 frames de integración y 4 frames de método.

## RISKS

- La lectura de la esfera como red operativa es una hipótesis visual que debe contrastarse con personas nuevas; por eso se mantiene como **EVOLUTION / TEST**.
- Canvas depende de capacidad gráfica del navegador, pero existe fallback y reduced motion conserva el estado comprensible.
- La claridad comercial se validó heurísticamente y requiere una breve validación cualitativa externa antes de considerar un release.

## RECOMMENDATION

Validar primero el preview local con usuarios que no conozcan VITAIROS, usando el test de comprensión y comparando la lectura de la esfera. Si la claridad y la percepción de marca son aprobadas, preparar una revisión separada de release; no desplegar desde esta rama de prueba.

## PRODUCTION STATUS

Producción intacta. No hubo push, merge, deploy, cambios en Cloudflare, DNS, Pages, Workers, planes, servicios, infraestructura, backend ni verticales.
