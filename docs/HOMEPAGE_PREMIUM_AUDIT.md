# Auditoría de homepage premium — V3

Fecha: 2026-10-13
Rama: `homepage-v2-ai-positioning`
Estado: preview local; pendiente de aprobación humana.

## Qué existía

La V2 ya había resuelto navegación desktop, jerarquía comercial, esfera canvas, estructura semántica, fuentes locales y una base responsive funcional. Sin embargo, la experiencia seguía organizada como una landing corporativa convencional: transición oscuro–claro con una gran curva, cuatro filas de valor, metodología lineal, grilla de verticales, tres noticias equivalentes, bloque institucional genérico y formulario de contacto tradicional.

## Qué fallaba

- La curva clara se leía como un recurso CSS y cortaba la atmósfera.
- La esfera perdía protagonismo al terminar el primer viewport.
- Valor, método y ecosistema utilizaban patrones repetidos de lista/card.
- La metodología comunicaba el proceso, pero no se sentía propia de VITAIROS.
- El ecosistema no expresaba una capacidad central aplicada a contextos distintos.
- La evidencia ocupaba demasiado espacio y dependía de fotografías de calidad desigual.
- El formulario pedía datos antes de ayudar a estructurar la oportunidad.
- Había demasiados titulares de escala hero y demasiado contenido que corresponde a páginas secundarias.

## Qué se eliminó

- La región clara continua y sus semicírculos.
- La sección independiente de capacidades.
- Las cuatro filas estáticas de valor.
- La grilla SaaS de cuatro proyectos.
- La tercera historia de actualidad en home.
- El bloque corporativo largo y la sección prominente de Careers.
- El formulario genérico de un solo paso.
- Fotos editoriales de soporte dentro de actualidad.

## Qué se movió conceptualmente

- Historia, equipo, propósito y trayectoria quedan reservados para `/nosotros/`.
- El archivo completo de noticias queda reservado para `/actualidad/`.
- Vacantes y employer branding quedan reservados para `/trabaja-con-nosotros/`.
- La home conserva enlaces discretos o estados de “página en preparación”; no se construyeron páginas secundarias nuevas.

## Qué se transformó

- Intro y hero comparten la misma red y se perciben como una sola secuencia.
- La esfera funciona como firma digital, reacciona al pointer/foco y mantiene cuatro nodos de proyecto enlazables.
- La brecha y los cuatro contextos de valor forman una única experiencia con un escenario compartido.
- El método utiliza una superficie Niebla contenida y una trayectoria irregular de nodos que progresa con scroll.
- El ecosistema utiliza un índice editorial y un solo instrumento visual reactivo, no cuatro tarjetas.
- Actualidad queda en una composición destacada + secundaria creada con geometría VITAIROS.
- Los principios de decisión sustituyen el bloque corporativo genérico.
- El contacto se convierte en una calificación guiada de cuatro pasos.

## Conversión y credibilidad

La narrativa comercial queda organizada como problema → prueba → integración → valor. La CTA principal abre el diagnóstico; la secundaria permite explorar antes de convertir. No se incorporaron clientes, ROI, métricas, premios, partners ni resultados no verificados. El formulario no promete IA ficticia ni evaluación automática: indica explícitamente que el equipo revisará el contexto antes de responder.

## Responsive

Mobile no comprime desktop: reordena hero y esfera, transforma valor a selector vertical, método a red vertical, ecosistema a índice con preview por tap, noticias a stack y diagnóstico a un paso visible por vez.
