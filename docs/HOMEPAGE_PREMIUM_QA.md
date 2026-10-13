# QA de homepage premium — V3.1

Fecha: 2026-10-13
URL validada: `http://127.0.0.1:4173/`
Entorno: servidor HTTP local + Microsoft Edge headless. No se ejecutó deploy.

## Resultado técnico

- Smoke test V3.1: aprobado.
- Browser QA: aprobado en 8 viewports.
- HTTP de home: 200 en todos los viewports.
- Rutas verificadas: `/vitairos-m/`, `/vitairos-industrial-ai/`, `/agro-intelligence/`, `/conecta/` → 200.
- Overflow horizontal: 0 px en todos los tamaños.
- Imágenes rotas: 0.
- Errores de consola/pageerror: 0.
- IDs duplicados: 0.
- Un solo `h1` y landmark `main` presente.
- Actualidad: exactamente 2 historias verificadas.
- Diagnóstico: 4 pasos, uno visible a la vez, progreso nodal y feedback de textarea.
- Navegación desktop: visible desde 1100 px exactos.
- Lighthouse: no disponible en el entorno; no se inventaron métricas.

## Viewports validados

| Viewport | HTTP | Overflow | Altura resultante | Resultado |
|---|---:|---:|---:|---|
| 1920×1080 | 200 | 0 px | 8246 px | Aprobado |
| 1440×900 | 200 | 0 px | 7874 px | Aprobado |
| 1366×768 | 200 | 0 px | 7661 px | Aprobado |
| 1024×768 | 200 | 0 px | 6995 px | Aprobado |
| 768×1024 | 200 | 0 px | 9448 px | Aprobado |
| 430×932 | 200 | 0 px | 9508 px | Aprobado |
| 390×844 | 200 | 0 px | 9492 px | Aprobado |
| 360×800 | 200 | 0 px | 9577 px | Aprobado |

Las alturas corresponden a la pasada final V3.1 con Método integrado en la escena oscura.

## Interacciones verificadas

- Menú mobile abre con `aria-expanded=true`, cierra con Escape y restaura foco.
- Header permanece visible en desktop y se compacta después de 32 px de scroll.
- El menú desktop aparece a 1100 px y el hamburger desaparece en ese mismo breakpoint.
- Foco de teclado en Valor actualiza contenido, resultado y estado `aria-pressed`.
- Tap en Ecosistema actualiza sector, nombre, cuatro conceptos y copy del preview.
- Método activa secuencialmente pasos 01–04 y expande la red al completarse.
- El diagnóstico avanza, vuelve y conserva radio buttons y textarea.
- `prefers-reduced-motion` omite intro y movimiento continuo.
- `sessionStorage` evita repetir la intro durante la sesión.
- El canvas se pausa cuando hero/brecha están fuera del viewport y cuando la pestaña queda oculta.

## Evidencia visual obligatoria

1. `preview/homepage-v3-1-01-hero-desktop.png`
2. `preview/homepage-v3-1-02-hero-mobile.png`
3. `preview/homepage-v3-1-03-header-initial.png`
4. `preview/homepage-v3-1-04-header-scrolled.png`
5. `preview/homepage-v3-1-05-breach.png`
6. `preview/homepage-v3-1-06-breach-interaction.png`
7. `preview/homepage-v3-1-07-breach-method-transition.png`
8. `preview/homepage-v3-1-08-method-active-step-01.png`
9. `preview/homepage-v3-1-09-method-active-step-03.png`
10. `preview/homepage-v3-1-10-method-ecosystem-transition.png`
11. `preview/homepage-v3-1-11-ecosystem.png`
12. `preview/homepage-v3-1-12-ecosystem-hover.png`
13. `preview/homepage-v3-1-13-evidence.png`
14. `preview/homepage-v3-1-14-why.png`
15. `preview/homepage-v3-1-15-diagnostic-step-1.png`
16. `preview/homepage-v3-1-16-diagnostic-step-3.png`
17. `preview/homepage-v3-1-17-diagnostic-step-4.png`
18. `preview/homepage-v3-1-18-footer.png`
19. `preview/homepage-v3-1-19-desktop-full.png`
20. `preview/homepage-v3-1-20-mobile-full.png`

Benchmarks auxiliares: `preview/homepage-v3-1-benchmark-conecta.png` y `preview/homepage-v3-1-benchmark-industrial-ai.png`.

## Riesgos aún abiertos

- Revisión manual en Safari/iOS real, no emulada.
- Validación de entrega real de FormSubmit con un correo autorizado.
- Prueba de comprensión con compradores reales antes de producción.
- Dirección creativa humana debe aprobar la percepción visual; pasar QA técnico no equivale a aprobación de marca.
