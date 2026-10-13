# Decisiones finales de diseño — Homepage V3.1

## Norte creativo

La home es una escena continua en Abismo y Bosque. La red es el lenguaje conductor: aparece en la intro, se condensa en la esfera, persiste durante la brecha, se convierte en trayectoria de método y reaparece como instrumento del ecosistema.

## Jerarquía

Solo el hero y el mensaje de brecha utilizan escala dominante. Los capítulos restantes reducen tamaño, aumentan contraste editorial y reservan el gradiente para propuesta central, CTA y estados interactivos.

## Intro + hero

- Duración objetivo: 1,45 s.
- Secuencia: puntos → conexiones → isotipo oficial → VITAIROS → desvanecimiento sobre el hero ya renderizado.
- Se muestra una vez por sesión y se omite con movimiento reducido.
- Desktop: copy y esfera comparten el primer viewport.
- Mobile: copy, acciones, secuencia comercial y esfera aparecen consecutivamente sin capítulos intermedios.

## Esfera

Canvas 2D sin WebGL ni dependencias. La red rota con perspectiva, responde al pointer, desacelera al interactuar, intensifica conexiones cercanas al proyecto enfocado y utiliza el SVG liviano solo como fallback. Los nodos especiales son optativos; la navegación primaria sigue en el header.

## Transición a valor

No hay cambio a una página blanca. La esfera acompaña el primer tramo y se desvanece dentro de geometría, luz y nodos. Valor utiliza un selector de cuatro contextos y un escenario común: cambiar el foco modifica copy, resultado y orientación del microdiagrama.

## Método

Niebla deja de ser una superficie editorial grande y se reserva para texto, luz y estados. Los cuatro pasos viven directamente sobre Abismo/Bosque en una trayectoria irregular. La línea se revela según posición de scroll, los nodos cambian de estado sin scroll-jacking y, al completarse, la trayectoria se expande como anticipo del Ecosistema.

## Ecosistema

El patrón elegido es índice + instrumento. Cada iniciativa conserva solamente nombre, sector, una frase y CTA. El preview altera etiquetas, topología, iluminación y geometría para representar continuidad, documentos/operación/datos/trazabilidad, territorio/datos/operación/decisión o personas/aprendizaje/conexión/oportunidad, manteniendo un único ADN VITAIROS.

## Evidencia

Máximo dos historias. La primera domina; la segunda actúa como contrapunto. Se retiraron fotos de calidad insuficiente. Minería utiliza documentos, operación y traza; Talasa utiliza infraestructura, nodos de cómputo, red e IA.

## Principios

Los cuatro principios se presentan como una composición tipográfica de proporciones 7/5, no como cards. Hover y foco revelan una línea/nodo y atenúan los demás principios. La frase “Tecnología útil. IA con criterio. Valor real.” funciona como cierre de capítulo.

## Diagnóstico

Cuatro pasos: oportunidad, contexto actual, etapa y contacto. Las respuestas se conservan y son editables. La UI utiliza radios nativos ocultos visualmente, labels reales, validación del navegador, progreso con cuatro nodos y controles atrás/siguiente. El textarea muestra longitud y el CTA final dice “Enviar mi caso para revisión”. No se simula análisis automático.

## Motion y performance

- Microinteracciones: 200 ms.
- Reveals: 550 ms.
- Cambios de escena: 650–800 ms.
- Easing corporativo: `cubic-bezier(.22,1,.36,1)`.
- Scroll handlers agrupados mediante `requestAnimationFrame`.
- Canvas acotado a DPR 1.5 y detenido fuera de pantalla.
- Sin librerías nuevas, imágenes base64 ni WebGL.
