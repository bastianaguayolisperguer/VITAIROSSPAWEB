# VITAIROS-M V2.2 — Visual review

Fecha: 2026-10-14 (America/Santiago)

Estado: **FASE A COMPLETADA — PENDIENTE DE VALIDACIÓN VISUAL HUMANA**

## Base verificada

- Repositorio: `bastianaguayolisperguer/VITAIROSSPAWEB`
- Rama: `vertical-v2/vitairos-m`
- HEAD local: `e4a125775bb10b0f3ddb83364de9845e7df586e4`
- Working tree antes de la revisión: limpio.
- La revisión no modificó diseño, copy, formularios, CTA, navegación, SEO ni código productivo.
- No se realizó push, merge, despliegue ni cambio de infraestructura.

## Método

La página V2.2 se levantó exclusivamente en `http://127.0.0.1:4174/vitairos-m/` y se capturó nuevamente desde el HEAD verificado. No se reutilizaron capturas anteriores.

Se evaluó contra:

1. el pendón maestro `Continuidad en salud mental digital (1).png`;
2. la identidad VITAIROS-M aprobada: blanco, tinta azul y gradiente verde–cian–azul;
3. la homepage VITAIROS V3.2.1 como barra de calidad de composición, interacción, jerarquía y responsive, sin intentar copiar su estética oscura ni su arquitectura.

También se midieron en navegador los tamaños de texto y la posición del visual principal para distinguir observaciones verificables de preferencias personales.

## Resumen de severidad

| Clasificación | Cantidad |
| --- | ---: |
| CRITICAL | 0 |
| IMPORTANT | 2 |
| MINOR | 2 |
| NO ISSUE | 13 áreas verificadas |

## Hallazgos

### VR-01 — Continuity Loop móvil pierde la relación visual del circuito

**Clasificación: IMPORTANT**

En escritorio, el Continuity Loop conserva con claridad la ruta circular, flechas, seis nodos y marca central. En `390 px`, la trayectoria completa se oculta y los seis pasos aparecen como tarjetas independientes sin línea o conector visible. El orden semántico se preserva, pero la relación de retorno —la firma central del pendón y del producto— deja de leerse como circuito y se acerca a una lista genérica.

Evidencia:

- `06-continuity-loop.png`: circuito completo y equilibrado en desktop.
- `04-full-page-mobile-390.png`: marca central seguida por seis tarjetas desconectadas.
- Medición de navegador: `.continuity-loop__path` tiene `display: none` a `390 px`.

No se propone una solución en esta fase. La decisión visual debe ser humana antes de intervenir.

### VR-02 — Textos legales y de ayuda inmediata quedan demasiado pequeños

**Clasificación: IMPORTANT**

El texto de consentimiento, la nota de FormSubmit y la información de ayuda inmediata del footer son legibles con ampliación, pero se perciben notablemente más pequeños que el cuerpo general. Se trata de contenido de privacidad y seguridad, por lo que su jerarquía no debería depender de una lectura forzada.

Mediciones actuales en navegador:

- consentimiento: `11,52 px`;
- nota de FormSubmit: `10,56 px`;
- texto de ayuda inmediata del footer: `10,56 px`;
- los valores se mantienen tanto en `1440 px` como en `390 px`.

Evidencia:

- `12-contacto-formulario.png`;
- `15-footer.png`;
- `04-full-page-mobile-390.png`.

No se modificó tipografía ni espaciado.

### VR-03 — El visual principal del hero móvil comienza fuera del primer viewport

**Clasificación: MINOR**

En `390 × 844`, el primer viewport contiene marca, estado, titular, texto, dos CTA y nota de alcance, pero no alcanza a mostrar el orbit de Persona–Contexto–Profesional. El visual comienza aproximadamente en `y=874,6 px`, es decir, unos `30,6 px` después del primer viewport. La propuesta sigue siendo comprensible y el visual aparece inmediatamente al desplazarse, pero la experiencia inicial móvil es menos visual que la composición desktop.

Evidencia: `02-hero-mobile-390x844.png` y `04-full-page-mobile-390.png`.

### VR-04 — Las tarjetas de Ecosistema tienen baja densidad visual

**Clasificación: MINOR**

Las tres tarjetas de Ecosistema son consistentes entre sí y mantienen la identidad, pero dedican aproximadamente la mitad superior a un arco decorativo de contraste muy bajo. El contenido queda concentrado en la parte inferior, por lo que la sección se siente más genérica y menos resuelta que Continuity Loop, Persona/Profesional o la sección equivalente de la homepage usada como barra de calidad.

Altura observada:

- desktop: `270 px` por tarjeta;
- mobile: `230 px` por tarjeta.

Evidencia: `11-ecosistema.png` y `04-full-page-mobile-390.png`.

## Áreas sin problemas observables

### Branding — NO ISSUE

La página mantiene una identidad diferenciada de la homepage corporativa y coherente con el pendón: alto espacio negativo, tinta azul, gradiente verde–cian–azul, nodos, halos, cápsulas y ondas suaves.

### Logo — NO ISSUE

El logo mantiene proporciones, nitidez, fondo y color en header, hero, Continuity Loop y footer. No se observan clipping, halo accidental, deformación ni pixelación visible al tamaño normal de interfaz.

### Colors — NO ISSUE

La paleta es estable entre desktop y mobile. El bloque oscuro de Seguridad aporta una pausa de ritmo clara sin introducir una identidad ajena.

### Typography — NO ISSUE, salvo VR-02

Titulares, cuerpos y etiquetas mantienen una jerarquía consistente y el carácter geométrico del pendón. No se observan cortes, viudas graves ni desbordes.

### Hierarchy — NO ISSUE

El recorrido Hero → Brecha → Continuidad → Perspectivas → Seguridad → Estado → Ecosistema → Contacto se entiende sin depender de numeración editorial.

### Spacing — NO ISSUE

El espacio es generoso pero consistente. No se detectaron colisiones, recortes ni vacíos que rompan la lectura, fuera de la baja densidad específica de Ecosistema registrada en VR-04.

### Visual rhythm — NO ISSUE

Las superficies blancas y azul hielo alternan con un único bloque oscuro; esto evita que las secciones se confundan y mantiene continuidad en una página extensa.

### Hero desktop — NO ISSUE

El titular, la explicación, los CTA y el orbit están equilibrados en `1440 × 900`. La marca y el estado de producto son visibles sin competir con el mensaje principal.

### La brecha — NO ISSUE

El encabezado, la secuencia Antes/Entre/Después y la cita final forman una narrativa clara y directamente vinculada al pendón.

### Persona — NO ISSUE

La perspectiva Persona combina explicación, capacidades y mockup sin parecer una interfaz ya operativa. La jerarquía y el contraste son claros.

### Profesional — NO ISSUE

La vista Profesional mantiene el mismo peso visual que Persona, diferencia responsabilidades y no sobredeclara una red consolidada.

### Safety — NO ISSUE

El bloque Seguridad comunica límites clínicos con la mayor claridad visual de la página. Las cuatro restricciones se distinguen y el sello de consentimiento tiene prioridad adecuada.

### Product state — NO ISSUE

La separación entre `Base actual / Desarrollado` y `Próxima etapa / En desarrollo` es legible, equilibrada y prudente.

### Form — NO ISSUE, salvo VR-02

La composición desktop y mobile es coherente, los controles son visibles y el CTA tiene suficiente peso. No se observan elementos cortados o un formulario desproporcionado.

### Header y navegación — NO ISSUE

El header desktop es limpio y el menú móvil conserva marca, jerarquía, cierre visible y objetivos táctiles amplios.

### Footer — NO ISSUE, salvo VR-02

Logo, mensaje, recursos oficiales y navegación legal están ordenados y sin deformaciones.

### Desktop/mobile consistency — NO ISSUE, salvo VR-01 y VR-03

El orden, identidad y contenido se preservan entre tamaños. Las diferencias observables están registradas específicamente y no existen cortes ni overflow horizontal.

## Capturas actuales

Directorio: `preview/vitairos-m-v2-2-visual-review/`

1. `01-hero-desktop-1440x900.png`
2. `02-hero-mobile-390x844.png`
3. `03-full-page-desktop-1440.png`
4. `04-full-page-mobile-390.png`
5. `05-la-brecha.png`
6. `06-continuity-loop.png`
7. `07-persona.png`
8. `08-profesional.png`
9. `09-seguridad.png`
10. `10-estado-del-producto.png`
11. `11-ecosistema.png`
12. `12-contacto-formulario.png`
13. `13-header-desktop.png`
14. `14-menu-mobile.png`
15. `15-footer.png`

Total: **15 capturas exactas**.

## Recomendación

V2.2 tiene una base visual sólida y no presenta problemas críticos. Antes de iniciar Demand MVP, la propietaria debería revisar las 15 capturas y decidir si:

1. aprueba V2.2 tal como está y autoriza continuar a Fase B; o
2. solicita primero una corrección acotada de los hallazgos VR-01 a VR-04.

No se recomienda iniciar Fase B ni mezclar captación comercial con decisiones visuales todavía pendientes. Conforme al brief, el siguiente paso requiere recibir exactamente: `APROBADO VISUAL — CONTINÚA FASE B`.
