# VITAIROS-M V2.2.5 — Final visual release review

Fecha: 2026-10-16 (America/Santiago)

## STATUS

**COMPLETADO — LISTO PARA VALIDACIÓN VISUAL HUMANA.**

Intervención limitada a los tres hallazgos priorizados: intro, escena Orientarse / Dar contexto / Sostener continuidad y cierre con formulario. No se inició Demand MVP. No hubo push, merge, deploy ni cambios en producción, Cloudflare, DNS, backend o infraestructura.

## BASE SHA

`1571dcd63ef4723ff239e36099bec15caa4be9e9`

Rama verificada: `vertical-v2/vitairos-m`.

## NEW SHA

`HEAD` del commit local `Polish VITAIROS-M intro motion and contact journey`.

El SHA hexadecimal se informa en la entrega final. Un archivo incluido en un commit no puede contener de forma estable el hash del mismo commit porque ese contenido participa en el cálculo del hash.

## RESUMEN EXACTO

### 1. Intro reconstruida

- La secuencia ya no se limita a dibujar el logo: nace desde la V, crece como una red orgánica, forma la flor y abre un recorrido cerrado de cinco hitos.
- El circuito representa Persona → Contexto → Profesional → Ajuste del acompañamiento → Retorno a la persona mediante cinco señales visuales sin texto.
- Un pulso recorre la ruta completa y vuelve al origen antes de la transición al hero.
- El isotipo final proviene del recorte oficial de `assets/vitairos-m-logo.png`; se añadió una versión transparente derivada de ese mismo activo, sin redibujar ni inventar la geometría de marca.
- Duración total: `2,36 s`, dentro del rango solicitado de `1,8–2,4 s`.
- La intro aparece una vez por sesión y se omite por completo con `prefers-reduced-motion: reduce`.

### 2. Escena ambiental y continuidad temporal

- La cordillera pasó de dos planos simples a tres capas blancas más una línea de cresta, con aparición escalonada y bajo contraste.
- El ave se reconstruyó como una silueta de vuelo amplio con cuerpo, cola, alas y trazos de plumas, en lugar de dos curvas genéricas.
- El vuelo sigue una trayectoria lenta con variación de altura, escala y ángulo; las alas incorporan una microvariación independiente.
- La línea antes / entre / después se dibuja con un pulso viajero y la aparición de los tres contenidos ocurre de forma escalonada.
- La animación solo corre cuando el bloque entra en vista y se neutraliza con movimiento reducido.

### 3. Cierre y formulario orientados a conversación

- El cierre se convirtió en una composición de alto contraste, cálida y editorial, con una invitación explícita a escuchar antes de definir la siguiente etapa.
- Personas, profesionales e instituciones reciben una propuesta de valor diferenciada y prudente.
- El formulario ganó encabezado, jerarquía, contraste, campos más legibles, CTA `Quiero conversar` y una explicación clara del paso siguiente.
- Se conservaron FormSubmit, consentimiento obligatorio, Política de Privacidad, revisión humana y ausencia de promesas clínicas o comerciales no sustentadas.
- El ecosistema permanece como bloque secundario después del contacto.

## QA

Comando: `node tests/vitairos-m-v2-2-5-release-qa.mjs`

Viewports verificados:

1. `1920 × 1080`
2. `1440 × 900`
3. `1366 × 768`
4. `1024 × 768`
5. `768 × 1024`
6. `430 × 932`
7. `390 × 844`
8. `360 × 800`

Resultado: **8/8 PASS, 0 fallos**.

- overflow horizontal: 0;
- imágenes rotas: 0;
- errores de consola: 0;
- requests fallidas: 0;
- referencias ARIA faltantes: 0;
- IDs duplicados: 0;
- controles sin etiqueta: 0;
- targets visibles menores a 44 px: 0;
- intro de primera visita: correcta;
- intro en la misma sesión: no se repite;
- ruta de intro: cerrada, cinco hitos presentes;
- CLS medido durante intro: `0,00022`;
- reduced motion: intro omitida, vuelo y pulso detenidos, contenido visible;
- formulario: endpoint y consentimiento preservados;
- responsive del cierre: dos columnas en desktop, una columna en tablet/mobile;
- teclado: menú móvil, Escape, restauración de foco, tabs y modal de privacidad correctos;
- SEO: title, canonical y H1 preservados.

Resultado detallado: `preview/vitairos-m-v2-2-5-release-review/qa-results.json`.

## LIGHTHOUSE

Ejecución local contra `http://127.0.0.1:4174/vitairos-m/` con Microsoft Edge headless. La medición incluye la intro de primera visita.

| Métrica | Resultado |
| --- | ---: |
| Performance | 96 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| LCP | 2,6 s |
| CLS | 0 |
| TBT | 0 ms |
| FCP | 1,8 s |
| Speed Index | 2,8 s |

Reporte completo: `preview/vitairos-m-v2-2-5-release-review/lighthouse-report.json`.

## SCREENSHOTS

Directorio: `preview/vitairos-m-v2-2-5-release-review/`

1. `01-intro-start.png`
2. `02-intro-growth-from-v.png`
3. `03-intro-flower-formation.png`
4. `04-intro-circuit-closure.png`
5. `05-final-hero.png`
6. `06-atmospheric-section.png`
7. `07-new-form-desktop.png`
8. `08-new-form-mobile.png`
9. `09-full-desktop-1440x900.png`
10. `10-full-mobile-390x844.png`

Total: **10 capturas exactas**.

## REMAINING ISSUES

No quedan hallazgos funcionales, de accesibilidad, responsive, rendimiento o presentación bloqueantes dentro del alcance V2.2.5. La aprobación estética final corresponde a la validación humana solicitada.

## CONFIRMACIÓN DE ALCANCE

Demand MVP no fue iniciado. No se modificaron producción, Cloudflare, DNS, backend, D1, infraestructura ni formularios externos. No se hizo push, merge ni deploy.
