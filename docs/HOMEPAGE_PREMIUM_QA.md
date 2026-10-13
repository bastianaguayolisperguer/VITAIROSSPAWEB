# QA de homepage premium — V3

Fecha: 2026-10-13
URL validada: `http://127.0.0.1:4173/`
Entorno: servidor HTTP local + Microsoft Edge headless. No se ejecutó deploy.

## Resultado técnico

- Smoke test: aprobado.
- Browser QA: aprobado en 8 viewports.
- HTTP de home: 200 en todos los viewports.
- Rutas verificadas: `/vitairos-m/`, `/vitairos-industrial-ai/`, `/agro-intelligence/`, `/conecta/` → 200.
- Overflow horizontal: 0 px en todos los tamaños.
- Imágenes rotas: 0.
- Errores de consola/pageerror: 0.
- IDs duplicados: 0.
- Un solo `h1` y landmark `main` presente.
- Actualidad: exactamente 2 historias verificadas.
- Diagnóstico: 4 pasos, uno visible a la vez.

## Viewports validados

| Viewport | HTTP | Overflow | Altura resultante | Resultado |
|---|---:|---:|---:|---|
| 1920×1080 | 200 | 0 px | 8341 px | Aprobado |
| 1440×900 | 200 | 0 px | 7969 px | Aprobado |
| 1366×768 | 200 | 0 px | 7755 px | Aprobado |
| 1024×768 | 200 | 0 px | 7040 px | Aprobado |
| 768×1024 | 200 | 0 px | 9851 px | Aprobado |
| 430×932 | 200 | 0 px | 9800 px | Aprobado |
| 390×844 | 200 | 0 px | 9741 px | Aprobado |
| 360×800 | 200 | 0 px | 9786 px | Aprobado |

Las alturas corresponden a la pasada final con el método SVG en red.

## Interacciones verificadas

- Menú mobile abre con `aria-expanded=true`, cierra con Escape y restaura foco.
- Header permanece visible en desktop y se compacta después de 32 px de scroll.
- Foco de teclado en Valor actualiza contenido, resultado y estado `aria-pressed`.
- Tap en Ecosistema actualiza sector, nombre, cuatro conceptos y copy del preview.
- El diagnóstico avanza, vuelve y conserva radio buttons y textarea.
- `prefers-reduced-motion` omite intro y movimiento continuo.
- `sessionStorage` evita repetir la intro durante la sesión.
- El canvas se pausa cuando hero/brecha están fuera del viewport y cuando la pestaña queda oculta.

## Evidencia visual obligatoria

1. `preview/homepage-v3-01-intro.png`
2. `preview/homepage-v3-02-hero-desktop.png`
3. `preview/homepage-v3-03-hero-mobile.png`
4. `preview/homepage-v3-04-sphere-interaction.png`
5. `preview/homepage-v3-05-hero-breach.png`
6. `preview/homepage-v3-06-value.png`
7. `preview/homepage-v3-07-method.png`
8. `preview/homepage-v3-08-ecosystem.png`
9. `preview/homepage-v3-09-ecosystem-hover.png`
10. `preview/homepage-v3-10-movement.png`
11. `preview/homepage-v3-11-why.png`
12. `preview/homepage-v3-12-diagnostic-step-1.png`
13. `preview/homepage-v3-13-diagnostic-final.png`
14. `preview/homepage-v3-14-final-cta.png`
15. `preview/homepage-v3-15-desktop-full.png`
16. `preview/homepage-v3-16-mobile-full.png`

Benchmarks auxiliares: `preview/homepage-v3-benchmark-conecta.png` y `preview/homepage-v3-benchmark-industrial-ai.png`.

## Riesgos aún abiertos

- Revisión manual en Safari/iOS real, no emulada.
- Validación de entrega real de FormSubmit con un correo autorizado.
- Prueba de comprensión con compradores reales antes de producción.
- Dirección creativa humana debe aprobar la percepción visual; pasar QA técnico no equivale a aprobación de marca.
