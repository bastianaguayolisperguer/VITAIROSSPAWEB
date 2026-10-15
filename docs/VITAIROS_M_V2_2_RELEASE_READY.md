# VITAIROS-M V2.2 — Release ready

Fecha: 2026-10-14 (America/Santiago)

Decisión: **GO WITH CONDITIONS**

## BRANCH

- Rama: `vertical-v2/vitairos-m`
- Base exacta verificada antes de editar: `6e46b56d5f50646057f922d48b1a80c66abb3794`
- `main`, producción, DNS y configuración de Cloudflare no fueron modificados.

## COMMIT

- Mensaje de liberación: `Finalize VITAIROS-M V2 production assets and contact`
- Este informe forma parte del propio commit de liberación. Su SHA definitivo se obtiene con `git rev-parse HEAD` después de crear el commit, evitando una referencia hash autorreferente dentro del mismo objeto Git.

## LOGO SOURCE

- Activo web oficial: `vitairos-m/assets/vitairos-m-logo.png`
- Fuente: pendón oficial aprobado por la propietaria, `Continuidad en salud mental digital (1).png`, de `816 × 1928 px`.
- Origen del recorte determinista: `left=108`, `top=74`, `width=574`, `height=166` píxeles.
- Transformación declarada: recorte únicamente. Sin IA, redibujo, vectorización, corrección de color ni modificación geométrica.
- El archivo provisional fue renombrado sin decodificación ni recompresión destructiva. El hash SHA-256 y el tamaño de bytes se mantuvieron idénticos antes y después del renombre.
- Validación visual aprobada en header, hero, Continuity Loop, footer y móvil: sin pixelación visible, clipping, halo, fondo impropio ni alteración de proporciones.
- Se añadió `height: auto` en los usos reducidos del Continuity Loop y footer para respetar la proporción intrínseca del activo. Lighthouse confirma que ya no existen imágenes mostradas con relación de aspecto incorrecta.

## LOGO HASH

`SHA-256 436F3B5DBC817BE28C0FD5454D5A5924D7F8985A997B5BD73EA89D81951FFBEA`

## LOGO DIMENSIONS

- Dimensiones intrínsecas: `574 × 166 px`.
- Tamaño: `54.145 bytes`.
- Formato: PNG, sRGB, 8 bits, sin canal alfa.

## FORM RECIPIENT

- Endpoint final: `https://formsubmit.co/contacto@vitairos.com`
- El correo personal anterior tiene `0` ocurrencias en `vitairos-m/`, sus pruebas y la documentación VITAIROS-M.
- Responsable, canal de privacidad y destinatario del formulario quedan alineados con `contacto@vitairos.com`.
- No se realizó ningún envío real.
- FormSubmit indica que un destinatario nuevo debe activarse mediante el correo de confirmación generado por el primer envío. Al cambiar el correo del formulario, la activación debe realizarse nuevamente: <https://formsubmit.co/help>.
- Como no se emitió el primer envío real, el estado de activación de `contacto@vitairos.com` no puede comprobarse localmente. La propietaria debe realizar un primer envío controlado, abrir el correo institucional y confirmar el enlace de activación antes de aceptar tráfico público.

## FORM PAYLOAD

Se interceptó el `POST` íntegramente en Playwright y se respondió localmente, sin permitir que la solicitud llegara a FormSubmit.

Campos ocultos preservados y verificados:

- `_subject=Conversación sobre VITAIROS-M`
- `_template=table`
- `_captcha=false`
- `_next=https://www.vitairos.com/vitairos-m/?enviado=1#conversemos`
- `proyecto=VITAIROS-M`
- `origen=Landing VITAIROS-M V2.1`
- `privacy_version=2026-10`
- `_honey=` vacío

Campos funcionales verificados con datos sintéticos:

- `nombre`
- `correo`
- `perfil`
- `mensaje`
- `privacy_consent=yes`

Resultado: método `POST`, endpoint, campos y valores obligatorios aprobados; datos reales enviados: `0`.

## PRIVACY

- Consentimiento obligatorio y no preseleccionado.
- `privacy_consent=yes` presente solo después de marcar el checkbox.
- `privacy_version=2026-10` preservado.
- Política de Privacidad y Términos siguen separados.
- Contacto para acceso, rectificación o eliminación: `contacto@vitairos.com`.
- Disclosure de FormSubmit preservado.

## SEO

- Title verificado: `VITAIROS-M | Continuidad en salud mental digital`.
- Meta description presente y sin reescritura.
- Canonical verificado: `https://www.vitairos.com/vitairos-m/`.
- Open Graph completo y sin cambios; la imagen existente utiliza el recorte aprobado y permanece en `1200 × 630 px`.
- Hash SHA-256 de la imagen Open Graph sin cambios: `B47EBAD4E590A929DA27F2725C14946D0CDE1F06A009F0C8C18AD5A87D0C729F`.
- Twitter Card completa y sin cambios.
- JSON-LD válido.
- Un único `h1` y cero saltos en la jerarquía de encabezados.
- Favicon corporativo raíz preservado.

## LIGHTHOUSE

Auditoría local sobre `http://127.0.0.1:4174/vitairos-m/` con Lighthouse `13.5.0` y Microsoft Edge headless:

| Categoría | Resultado | Objetivo | Estado |
| --- | ---: | ---: | --- |
| Performance | 97 | ≥ 90 | PASS |
| Accessibility | 100 | ≥ 95 | PASS |
| Best Practices | 100 | ≥ 95 | PASS |
| SEO | 100 | ≥ 95 | PASS |

Métricas registradas:

- LCP: `2,4 s` (`2404 ms`).
- CLS: `0`.
- TBT: `0 ms`.

Son resultados de laboratorio local, no datos de campo ni garantía del rendimiento en producción.

## ACCESSIBILITY

- Navegación por teclado y foco visible aprobados.
- Tabs Persona/Profesional aprobados con click y flechas del teclado.
- Menú móvil abre, cierra con `Escape` y restaura el foco al botón disparador.
- Diálogo de privacidad abre, cierra con `Escape`, contiene el foco y lo restaura al disparador.
- Formulario etiquetado; consentimiento requerido y no preseleccionado.
- Objetivos interactivos principales visibles de al menos `44 × 44 px` en los ocho viewports.
- `prefers-reduced-motion: reduce` deja todo el contenido visible y sin motion obligatorio.
- Lighthouse Accessibility: `100`.

## QA

Prueba automatizada: `tests/vitairos-m-v2-qa.mjs`.

Viewports aprobados: `1920×1080`, `1440×900`, `1366×768`, `1024×768`, `768×1024`, `430×932`, `390×844` y `360×800`.

Resultado final:

- `8/8` viewports aprobados;
- `0` overflow horizontal;
- `0` errores de consola;
- `0` requests fallidas;
- `0` imágenes rotas;
- `0` IDs duplicados;
- `0` referencias ARIA inexistentes;
- `0` controles sin etiqueta;
- `0` saltos de jerarquía de encabezados;
- `0` referencias al nombre provisional del logo;
- `0` ocurrencias del correo personal anterior;
- payload de FormSubmit interceptado y aprobado;
- 11 capturas de evidencia regeneradas en `preview/vitairos-m-v2/`.

## PRODUCTION READINESS

**GO WITH CONDITIONS**

La implementación V2.2 cumple el alcance técnico, visual, SEO, accesible y de contacto solicitado. El logo derivado ya es el activo web oficial autorizado, el destinatario corporativo está aplicado, las métricas superan los objetivos y la regresión automatizada no registra fallos.

La condición de salida es operativa: la propietaria debe aprobar esta versión y completar/verificar la activación inicial de FormSubmit para `contacto@vitairos.com` mediante un primer envío controlado. Esta preparación no autoriza merge ni despliegue automático.

## REMAINING ISSUES

1. Activación de FormSubmit: estado no verificable sin un envío real. Acción de la propietaria: realizar el primer envío controlado, revisar `contacto@vitairos.com` —incluido spam— y confirmar el enlace de activación.
2. Aprobación humana final de marca, producto y textos legales.
3. Merge a `main` y despliegue permanecen explícitamente fuera de alcance.

Producción actual no modificada.
