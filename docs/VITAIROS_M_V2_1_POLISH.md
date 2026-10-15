# VITAIROS-M V2.1 — Final brand / product polish

> Informe histórico. V2.2 resolvió la autorización del logo derivado y el destinatario corporativo; el estado vigente se documenta en `VITAIROS_M_V2_2_RELEASE_READY.md`.

Fecha: 2026-10-14

Rama: `vertical-v2/vitairos-m`

Base aprobada: `ecd465c75a6bc86300ddfb1f971c029920c82529`

Estado: lista para validación visual final; producción no modificada.

## Editorial changes

- Se retiró la numeración editorial de los siete capítulos y del menú móvil.
- También se eliminó la numeración de principios, tabs, capacidades y límites, porque no expresaba una secuencia real.
- Se conservaron únicamente los números del Continuity Loop, donde sí explican un recorrido ordenado.
- El bloque “No es otro chatbot” se convirtió en una afirmación directa sobre continuidad.
- Los límites clínicos se concentran en la sección Seguridad y criterio y en los términos legales.

## Status messaging

- El status pill ahora dice `VITAIROS-M · Producto en desarrollo`.
- La nota del hero comunica consentimiento, contexto y criterio humano sin repetir un disclaimer.
- Se retiraron `MVP en validación`, `Propuesta en validación`, `En construcción` y los badges repetidos `Visión de producto` de la experiencia principal.
- El estado queda explicado cerca del hero y en una única sección de producto.

## Continuity Loop

- La estructura, nodos, orden y motion se preservaron.
- El centro ahora identifica el circuito como `Modelo de continuidad`, dejando claro que representa el modelo de producto y no seis módulos operativos ya disponibles.

## Persona / Professional

- Las dos perspectivas y su interacción accesible se preservaron.
- La sección se identifica una sola vez como `experiencia propuesta` en su texto introductorio.
- Se eliminaron los badges duplicados de cada panel.
- Se conservaron contenidos, permisos y responsabilidades diferenciadas.

## Product state

- `Ahora / Información vigente` pasó a `Base actual / Desarrollado`.
- `En construcción / Visión de producto` pasó a `Próxima etapa / En desarrollo`.
- La tarjeta Base actual enumera únicamente evidencia existente: iniciativa, identidad y modelo, landing/canal de contacto y principios de consentimiento.
- La Próxima etapa concentra la evolución de producto sin presentarla como disponible.

## Safety

Se conservaron los cuatro límites:

- No diagnostica.
- No prescribe.
- No reemplaza.
- No promete resultados.

## Form recipient

Estado histórico de V2.1: pendiente de confirmación. Resuelto en V2.2 con el destinatario corporativo `contacto@vitairos.com`.

## Logo status

El recorte derivado fue autorizado formalmente en V2.2 y pasó a llamarse `assets/vitairos-m-logo.png`.

No se vectorizó, redibujó, reconstruyó ni mejoró mediante IA.

## Legal

- `privacy_consent=yes` preservado.
- `privacy_version=2026-10` preservado.
- Checkbox obligatorio y no preseleccionado.
- Disclosure de FormSubmit preservado.
- Privacidad y Términos continúan como diálogos separados.

## QA

Se verificaron los viewports:

`1920×1080`, `1440×900`, `1366×768`, `1024×768`, `768×1024`, `430×932`, `390×844` y `360×800`.

Resultado:

- 0 overflow horizontal;
- 0 errores de consola;
- 0 requests fallidas;
- 0 imágenes rotas;
- 0 IDs duplicados;
- 0 referencias ARIA inexistentes;
- 0 controles sin etiqueta;
- 0 numeración editorial residual;
- menú móvil y cierre con Escape aprobados;
- tabs Persona/Profesional aprobados;
- diálogos legales y restauración de foco aprobados;
- reduced motion aprobado;
- consentimiento y versión de privacidad aprobados;
- endpoint del formulario confirmado sin modificación.

## Screenshots

Se regeneraron únicamente las 11 evidencias solicitadas en `preview/vitairos-m-v2/`:

1. `01-hero-desktop.png`
2. `02-hero-mobile.png`
3. `03-full-desktop.png`
4. `04-full-mobile.png`
5. `05-continuity-loop.png`
6. `06-persona.png`
7. `07-profesional.png`
8. `08-seguridad.png`
9. `09-estado.png`
10. `10-ecosistema.png`
11. `11-contacto.png`

## Production blockers

Los dos bloqueos técnicos registrados en V2.1 —activo de logo y destinatario de FormSubmit— quedaron resueltos en V2.2. Permanece la revisión humana final de marca, producto y textos legales.

No se realizó merge, deploy ni modificación de `main`, homepage u otras verticales.
