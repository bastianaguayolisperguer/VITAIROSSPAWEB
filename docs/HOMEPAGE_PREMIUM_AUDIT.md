# Auditoría premium final de la homepage VITAIROS

Fecha: 2026-10-13

Rama: `homepage-v2-ai-positioning`

Alcance: preview local, sin merge ni despliegue

Producción: no modificada

## Resultado ejecutivo

La homepage pasó de una V2 funcional pero fragmentada a una narrativa corporativa de ocho capítulos con una sola promesa central: hacer que la inteligencia artificial funcione dentro de procesos reales.

La intervención no agregó contenido por volumen. Eliminó elementos secundarios del hero, redujo la metodología a cuatro etapas, integró capacidades dentro de la sección de valor, comprimió “Quiénes somos” y trasladó carreras al footer. El sistema visual conserva la identidad oficial, la esfera, los proyectos, la tipografía Outfit y las fuentes de evidencia ya verificadas.

## Diagnóstico de la V2 previa

### Problemas confirmados

- El hero competía con pills, estadísticas y mensajes secundarios.
- La esfera desaparecía al terminar el hero y no acompañaba la explicación de la brecha.
- Las transiciones claro/oscuro parecían fondos independientes pegados.
- El CSS acumulaba varias iteraciones visuales incompatibles y más de 124 KB.
- La metodología tenía cinco momentos, aunque el relato comercial pedía cuatro.
- “Quiénes somos” repetía ideas ya explicadas en valor y metodología.
- Carreras ocupaba espacio de capítulo sin vacantes abiertas.
- La noticia principal comenzaba desde el medio externo y no desde VITAIROS.

### Activos que debían conservarse

- Isotipo y logos existentes; no se reinterpretó la marca.
- Paleta Abismo, Bosque, Esmeralda, Neural, Pulso y Niebla.
- Outfit local, compartida con el brand kit de Conecta.
- Esfera de canvas con cuatro proyectos como nodos reales.
- Datos de noticias y vacantes alimentados por JSON.
- Formulario, semántica, JSON-LD, modales legales y eventos analíticos.
- Salvaguardas de accesibilidad y `prefers-reduced-motion`.

## Benchmark interno

| Dimensión | Conecta | Industrial AI | Home premium final |
|---|---|---|---|
| Primera impresión | Clara y humana | Especializada y cinematográfica | Corporativa, tecnológica y centrada en IA aplicada |
| Hero | Mensaje directo | Producto y contexto sectorial | Promesa madre, dos CTA y esfera protagonista |
| Ritmo | Capítulos luminosos | Alternancia mineral | Predominio oscuro con una única región clara editorial |
| Motion | Sobrio | Intro y visual industrial | Intro breve, esfera persistente y reveals controlados |
| Jerarquía | Programa específico | Vertical específica | Marca madre + capacidad central + ecosistema |
| Evidencia | Actividad educativa | Caso sectorial | Tres señales públicas narradas desde VITAIROS |
| Mobile | Fluido | Adaptación propia | Hero, esfera, método, proyectos y noticias reordenados |

La comparación final es cualitativa: la home no copia el lenguaje de las verticales. Toma su estándar de foco y acabado para presentarlas como expresiones de una marca madre más sólida.

## Auditoría por sección

### 01 Hero

- Aporta: posicionamiento, promesa, contexto mínimo y conversión.
- Eliminado: pills, estadísticas y proof line.
- Conservado: un eyebrow, un H1, un párrafo, dos CTA y una visual.
- Decisión: la esfera ocupa el segundo foco, no un rol decorativo.

### 02 La brecha

- Aporta: explica por qué disponibilidad no equivale a valor.
- Composición: herramientas → datos → procesos → integración → valor.
- Decisión: la esfera sigue presente durante este capítulo y desaparece gradualmente al terminarlo.

### 03 Dónde generamos valor

- Aporta: cuatro fricciones comprensibles para un decisor.
- Integración: las capacidades técnicas viven como respuesta a cada problema y en un rail editorial, no en una sección adicional.
- Decisión: filas tipográficas en lugar de tarjetas.

### 04 Cómo trabajamos

- Aporta: una entrada comercial de bajo riesgo.
- Reducción: cinco pasos se convirtieron en diagnóstico, piloto, implementación y escalamiento.
- Decisión: recorrido continuo de nodos, sin tabla ni cajas horizontales pesadas.

### 05 Ecosistema VITAIROS

- Aporta: arquitectura de marca y acceso explícito a cuatro iniciativas.
- Decisión: las únicas tarjetas de producto del relato; los mismos cuatro proyectos permanecen dentro de la esfera sin ser la navegación principal.

### 06 VITAIROS en movimiento

- Aporta: actividad real mediante tres elementos verificados.
- Decisión: fotografías solo donde documentan participación real.
- Copy: la primera noticia ahora comienza por la acción de VITAIROS; la fuente externa funciona como evidencia.

### 07 Quiénes somos

- Aporta: criterio de trabajo y convicción de marca.
- Reducción: cinco argumentos se sustituyeron por dos párrafos y una secuencia conceptual.
- Decisión: sin foto mediocre ni manifiesto largo.

### 08 CTA final

- Aporta: cierre comercial, dos rutas de acción y formulario acotado.
- Decisión: un solo panel de formulario; se eliminó el panel lateral explicativo.

### 09 Footer

- Aporta: navegación secundaria, contacto, legal y carreras.
- Decisión: el estado de vacantes se muestra de forma breve; no se inventaron posiciones.

## Claims y consistencia

- No se incorporaron métricas, clientes, ROI, países ni resultados no verificables.
- No se añadieron testimonios ni capacidades nuevas.
- Las cuatro rutas de proyecto existentes permanecen accesibles.
- La narrativa de noticias se corrigió sin alterar su fuente de respaldo.
- El HTML se mantiene por debajo de 60 KB y el CSS consolidado bajó de aproximadamente 124 KB a 47 KB.

## Conclusión

La homepage final presenta a VITAIROS como empresa de inteligencia artificial aplicada e ingeniería digital, con una promesa clara, un sistema visual propio y una arquitectura comercial más corta. La versión está lista para revisión en preview; cualquier publicación sigue pendiente de aprobación explícita.
