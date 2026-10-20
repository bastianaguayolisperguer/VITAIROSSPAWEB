# VITAIROS V3.3 — Motion & Content Audit

Fecha: 2026-10-19

Base auditada: `c77ade880948c28dd2eb2ad36d4a5a657158bced`

Alcance: home corporativa (`/`) solamente. Las verticales, el formulario, privacidad, SEO técnico, footer e infraestructura quedan fuera de cualquier rediseño.

## Criterio de decisión

La auditoría separa dos clases de hallazgo:

- **Problema objetivo de comprensión:** una persona nueva necesita interpretar lenguaje abstracto o una animación no explica el contenido que acompaña.
- **Hipótesis visual a validar:** una lectura externa posible —por ejemplo, que la esfera recuerde a una partícula biológica— no justifica retirar un activo histórico. Se prueba una evolución conservando identidad.

Cada movimiento debe clasificarse como **BRAND / ATMÓSFERA** o **NARRATIVA / INFORMACIÓN**. Si no cumple una de esas funciones, se elimina.

## 1. Header y navegación

### COPY

- **Actual:** Soluciones, Cómo trabajamos, Ecosistema, En movimiento, Nosotros, Conversemos.
- **Función:** orientar y permitir acceso directo a las decisiones comerciales principales.
- **Problema:** ninguno objetivo; las etiquetas son comprensibles.
- **KEEP:** nomenclatura y CTA.
- **MODIFY:** nada.
- **REMOVE:** nada.
- **Motivo:** la navegación ya responde con claridad a qué explorar y cómo contactar.

### LAYOUT

- **KEEP:** header fijo, versión desktop y menú móvil, logo e identidad.
- **MODIFY:** solo ajustes si la nueva composición genera solapamientos.
- **REMOVE:** nada.

### MOTION

- **KEEP:** transición sobria del header y feedback inmediato del menú.
- **MODIFY:** nada salvo compatibilidad con reduced motion.
- **REMOVE:** ningún efecto funcional.
- **Clasificación:** BRAND / ATMÓSFERA y UI funcional.

## 2. Hero

### COPY

- **Actual:** “Hacemos que la IA funcione dentro de tu organización.” + explicación breve + CTA “Evaluar una oportunidad”.
- **Función:** definir promesa, posicionamiento y siguiente acción.
- **Problema:** el mensaje principal es claro; el texto secundario puede explicitar “inteligencia artificial” y “alcance acotado”. Falta en pantalla la formulación completa del posicionamiento chileno solicitada para esta iteración.
- **KEEP:** titular exacto, CTA principal, idea de integración con procesos, datos y sistemas.
- **MODIFY:** eyebrow a “Empresa chilena de inteligencia artificial aplicada e ingeniería digital.” y lead a la redacción recomendada.
- **REMOVE:** nada.
- **Motivo:** mejora objetiva de comprensión sin convertir el hero en inventario de servicios.

### LAYOUT

- **KEEP:** composición editorial de dos columnas, jerarquía y profundidad.
- **MODIFY:** ajustar el espacio de la esfera solo si la nueva red necesita mayor legibilidad.
- **REMOVE:** nada.

### MOTION

- **Actual:** esfera de malla triangular que rota y responde al puntero; nodos de iniciativas orbitan sobre vértices.
- **Función:** activo de marca y metáfora de red.
- **Problema / hipótesis:** la geometría uniforme puede admitir una lectura orgánica o biológica. Esto es una **hipótesis visual**, no un problema de comprensión demostrado.
- **KEEP:** esfera, nodos, profundidad, paleta, rotación lenta, respuesta a pointer/focus y vínculos a iniciativas.
- **MODIFY:** **EVOLUTION / TEST**. Introducir rutas internas, jerarquías de nodos, señales luminosas en circulación, arcos y agrupaciones conectadas; reducir la lectura de puntos uniformes proyectados hacia afuera.
- **REMOVE:** énfasis decorativo sin flujo semántico; **NO retirar la esfera**.
- **Motivo:** preservar memoria visual de VITAIROS y probar una lectura más operativa: señales → conexión → sistema → circulación.
- **Clasificación:** BRAND / ATMÓSFERA + NARRATIVA / INFORMACIÓN.

## 3. Brecha y cuatro tipos de problema

### COPY

- **Actual:** categorías Proceso, Información, Decisiones y Producto, con descripciones breves; el panel usa frases como “Dar estructura al contexto” e “Integrar inteligencia en la experiencia”.
- **Función:** ayudar a una organización a reconocer qué problema puede intervenir VITAIROS.
- **Problema:** “contexto”, “experiencia útil” e “intervención” exigen interpretación. Las descripciones de Información, Decisiones y Producto son demasiado generales.
- **KEEP:** cuatro categorías y principio “partimos por la fricción”.
- **MODIFY:** usar descripciones concretas acordadas y resultados explícitos para cada estado.
- **REMOVE:** “experiencia útil” y otros resultados abstractos.
- **Motivo:** problema objetivo de claridad comercial.

### LAYOUT

- **Actual:** selector de cuatro botones + panel visual/copy común.
- **KEEP:** un solo escenario compartido y controles accesibles.
- **MODIFY:** dar al escenario una estructura visual común con carriles, fragmentos, señales y núcleo, capaz de transformarse sin cambiar de lenguaje.
- **REMOVE:** visual tipo crosshair con glifo central sin relación suficiente con el problema.

### MOTION

- **Actual:** cambios de posición/rotación del mismo diagrama abstracto.
- **Problema:** no permite explicar Proceso, Información, Decisiones y Producto sin leer el texto.
- **MODIFY:** visual semántica por estado: flujo fragmentado que se ordena; información dispersa que converge; señales que apoyan una decisión humana; componentes que se ensamblan en un producto.
- **KEEP:** transición inmediata por hover, focus y click.
- **REMOVE:** rotaciones y símbolos que no codifican significado.
- **Motivo:** problema objetivo de correspondencia entre movimiento y mensaje.
- **Clasificación:** NARRATIVA / INFORMACIÓN.

## 4. Integración tecnológica

### COPY

- **Actual:** una nota al cierre de la sección: “No vendemos herramientas aisladas. Diseñamos cómo deben trabajar juntas.” seguida por una lista de capacidades.
- **Función:** explicar el enfoque de integración.
- **Problema:** comunica intención, pero no qué se integra ni dónde debe funcionar.
- **KEEP:** IA aplicada, Software, Automatización, Datos e Integraciones.
- **MODIFY:** convertir la nota en una sección clara: “Integrar IA donde realmente aporta valor.”, explicación del propósito/controles/operación y resultado concreto.
- **REMOVE:** “Diseñamos cómo deben trabajar juntas.” como única explicación.
- **Motivo:** problema objetivo de claridad comercial.

### LAYOUT

- **Actual:** franja de texto y pills.
- **KEEP:** continuidad inmediata después de los problemas.
- **MODIFY:** bloque narrativo de dos columnas con texto y sistema visual central.
- **REMOVE:** lista estática como único soporte visual.

### MOTION

- **Actual:** sin narrativa propia.
- **MODIFY:** IA, Software, Datos, Automatización e Integraciones comienzan separados, se conectan a un núcleo y entregan una salida “Operación”.
- **REMOVE:** cualquier objeto 3D decorativo independiente.
- **Motivo:** hacer visible herramientas aisladas → conexión → sistema integrado → operación.
- **Clasificación:** NARRATIVA / INFORMACIÓN.

## 5. Método

### COPY

- **Actual:** “De oportunidad a capacidad operativa.” con Diagnóstico → Piloto → Implementación → Escalamiento.
- **Función:** explicar cómo VITAIROS reduce riesgo y avanza.
- **Problema:** el heading “capacidad operativa” es abstracto; el contenido de los pasos ya está cerca de lo requerido.
- **KEEP:** cuatro etapas, orden, manifiesto “Entrar pequeño. Probar rápido. Escalar con evidencia.”
- **MODIFY:** heading a “Del problema a una solución que funciona en tu operación.” y cuerpos según especificación.
- **REMOVE:** término abstracto del heading.
- **Motivo:** problema objetivo de comprensión.

### LAYOUT

- **KEEP:** secuencia lineal responsive y tarjetas/nodos por etapa.
- **MODIFY:** sumar una pequeña representación distinta por etapa dentro del mismo sistema, sin aumentar complejidad de lectura.
- **REMOVE:** nada estructural.

### MOTION

- **Actual:** la ruta se dibuja y activa etapas por scroll.
- **Problema:** expresa progreso, pero no diferencia explorar, acotar, conectar y ampliar.
- **MODIFY:** diagnóstico explora pocos nodos; piloto delimita una zona pequeña; implementación conecta sistemas cercanos; escalamiento extiende la red al final.
- **KEEP:** activación por scroll, sin hijacking.
- **REMOVE:** expansión indiferenciada en todas las etapas.
- **Clasificación:** NARRATIVA / INFORMACIÓN.

## 6. Capacidad central y ecosistema

### COPY

- **Actual:** “Una capacidad tecnológica. Distintos problemas reales.” y “VITAIROS aplica una misma capacidad central en diferentes contextos.”
- **Función:** conectar la oferta transversal con cuatro iniciativas.
- **Problema:** “capacidad central” no explica la base tecnológica.
- **KEEP:** cuatro iniciativas, sectores, nombres y enlaces.
- **MODIFY:** “Una misma base tecnológica. Distintos desafíos.” y subtexto explícito sobre IA aplicada, software, automatización, datos e integración. Actualizar descripciones a las formulaciones aprobadas.
- **REMOVE:** copy genérico que no enumera la capacidad.
- **Motivo:** problema objetivo de comprensión.

### LAYOUT

- **KEEP:** índice interactivo y un preview compartido; logos existentes sin rediseño.
- **MODIFY:** garantizar que cada descripción se comprenda antes de interactuar y que la ruta visual tenga cuatro estados legibles.
- **REMOVE:** nada de identidad.

### MOTION

- **Actual:** cuatro nodos orbitan de forma similar y cambian etiquetas.
- **Problema:** la reacción visual es atractiva, pero comunica poco sobre cada iniciativa.
- **MODIFY:** reutilizar un mismo circuito de cuatro pasos que cambia semánticamente: persona→contexto→profesional→continuidad; documento→estructura→dato→proceso; campo→datos→integración→decisión; persona→conocimiento→práctica→adopción.
- **KEEP:** respuesta a hover, focus y click.
- **REMOVE:** transformaciones arbitrarias que no corresponden a la narrativa.
- **Clasificación:** NARRATIVA / INFORMACIÓN.

## 7. VITAIROS en movimiento

### COPY

- **Actual:** “Iniciativas y participaciones que hacen visible una compañía en construcción.”
- **Función:** demostrar actividad y evidencia externa.
- **Problema:** “compañía en construcción” puede comunicar inmadurez innecesaria.
- **KEEP:** título “VITAIROS en movimiento.”, fuentes verificadas y enlaces.
- **MODIFY:** “Proyectos, iniciativas y participaciones que muestran cómo VITAIROS aplica tecnología en distintos contextos.”
- **REMOVE:** “compañía en construcción”.
- **Motivo:** problema objetivo de posicionamiento.

### LAYOUT

- **KEEP:** grilla de noticias y cards con contenido verificable.
- **MODIFY:** nada salvo consistencia responsive.
- **REMOVE:** nada.

### MOTION

- **KEEP:** red ambiental de baja energía y microinteracciones de cards.
- **MODIFY:** ninguna animación protagonista nueva.
- **REMOVE:** nada si conserva rendimiento.
- **Clasificación:** BRAND / ATMÓSFERA.

## 8. Principios

### COPY

- **Actual:** cuatro fórmulas repetidas “X antes que Y”.
- **Función:** explicar criterios de trabajo.
- **Problema:** repetición retórica y uno de los principios se concentra en control en vez de completar la secuencia comercial.
- **KEEP:** problema, prueba acotada, integración y evidencia.
- **MODIFY:** Problema primero; Probar en pequeño; Integrar con la operación; Escalar con evidencia, con las explicaciones aprobadas.
- **REMOVE:** patrón verbal repetitivo.
- **Motivo:** claridad y memorabilidad.

### LAYOUT

- **KEEP:** lista ordenada y foco textual.
- **MODIFY:** añadir una única línea de progreso compartida.
- **REMOVE:** nada.

### MOTION

- **Actual:** activación solo por hover/focus.
- **MODIFY:** pulso mínimo que avanza con el scroll y activa cada principio; conservar hover/focus.
- **REMOVE:** no crear animación compleja adicional.
- **Clasificación:** NARRATIVA / INFORMACIÓN, de baja intensidad.

## 9. Diagnóstico y formulario

### COPY

- **Actual:** “Conversemos sobre un caso real.” con cuatro pasos y mensajes de confianza.
- **Función:** convertir interés en contexto revisable por una persona.
- **Problema:** ninguno dentro del alcance V3.3.
- **KEEP:** todo el flujo, destinatario, consentimiento, privacidad y estados.
- **MODIFY:** nada.
- **REMOVE:** nada.

### LAYOUT

- **KEEP:** estructura, campos, botones y responsive.
- **MODIFY:** nada.
- **REMOVE:** nada.

### MOTION

- **KEEP:** feedback de progreso y estados de interacción.
- **MODIFY:** nada.
- **REMOVE:** nada.
- **Clasificación:** UI funcional.

## 10. Footer y legales

### COPY

- **Actual:** identidad, navegación, contacto, redes y legales.
- **Función:** cierre institucional y navegación secundaria.
- **Problema:** ninguno.
- **KEEP:** todo.
- **MODIFY:** nada.
- **REMOVE:** nada.

### LAYOUT

- **KEEP:** grilla responsive y enlaces.
- **MODIFY:** nada.
- **REMOVE:** nada.

### MOTION

- **KEEP:** microinteracciones accesibles.
- **MODIFY:** nada.
- **REMOVE:** nada.

## Decisiones previas a implementación

1. El cambio de copy responde a problemas objetivos de comprensión y posicionamiento.
2. Los estados de problema, integración, método e iniciativas se consideran motion informativo y deben ser comprensibles aun en un fotograma estático.
3. La esfera se conserva como activo histórico y se prueba como **EVOLUTION / TEST**; no se presenta como corrección definitiva ni como **REMOVAL**.
4. La red ambiental, gradientes, profundidad y microinteracciones se preservan porque sostienen identidad sin interferir con lectura.
5. Reduced motion mostrará siempre el estado final conectado y legible; ninguna información dependerá de animación.
6. No se modifican verticales, formulario, consentimiento, privacidad, infraestructura, Cloudflare ni producción.
