# QA de homepage premium — V3.2

Fecha: 2026-10-13
URL validada: `http://127.0.0.1:4173/`
Entorno: servidor HTTP local + Microsoft Edge headless. No se ejecutó deploy.

## Resultado técnico

- Smoke test V3.2: aprobado.
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
- Rama laboral: intención → contexto → contacto; asunto específico y respuestas editables.
- Navegación desktop: visible desde 1100 px exactos.
- Placeholders visibles: 0.
- Etiquetas de capítulo numeradas: 0.
- Superposición media/copy en noticias: 0 px.
- Títulos clippeados: 0.
- Lighthouse: no disponible en el entorno; no se inventaron métricas.

## Viewports validados

| Viewport | HTTP | Overflow | Altura resultante | Resultado |
|---|---:|---:|---:|---|
| 1920×1080 | 200 | 0 px | 8391 px | Aprobado |
| 1440×900 | 200 | 0 px | 8019 px | Aprobado |
| 1366×768 | 200 | 0 px | 7823 px | Aprobado |
| 1024×768 | 200 | 0 px | 7124 px | Aprobado |
| 768×1024 | 200 | 0 px | 9648 px | Aprobado |
| 430×932 | 200 | 0 px | 9736 px | Aprobado |
| 390×844 | 200 | 0 px | 9766 px | Aprobado |
| 360×800 | 200 | 0 px | 9847 px | Aprobado |

Las alturas corresponden a V3.2 con cards de Evidencia en flujo normal y sin superposición.

## Interacciones verificadas

- Menú mobile abre con `aria-expanded=true`, cierra con Escape y restaura foco.
- Header permanece visible en desktop y se compacta después de 32 px de scroll.
- El menú desktop aparece a 1100 px y el hamburger desaparece en ese mismo breakpoint.
- Foco de teclado en Valor actualiza contenido, resultado y estado `aria-pressed`.
- Tap en Ecosistema actualiza sector, nombre, cuatro conceptos y copy del preview.
- Método activa secuencialmente pasos 01–04 y expande la red al completarse.
- El diagnóstico avanza, vuelve y conserva radio buttons y textarea.
- La intención “Trabaja con nosotros” adapta contexto, omite la etapa comercial, llega a contacto y vuelve sin perder información.
- `prefers-reduced-motion` omite intro y movimiento continuo.
- `sessionStorage` evita repetir la intro durante la sesión.
- El canvas se pausa cuando hero/brecha están fuera del viewport y cuando la pestaña queda oculta.

## Evidencia visual de cierre

1. `preview/homepage-v3-2-01-placeholder-removed.png`
2. `preview/homepage-v3-2-02-diagnostic-careers.png`
3. `preview/homepage-v3-2-03-editorial-section-label.png`
4. `preview/homepage-v3-2-04-evidence-card-fixed.png`
5. `preview/homepage-v3-2-05-title-g-fixed.png`
6. `preview/homepage-v3-2-06-desktop-full.png`
7. `preview/homepage-v3-2-07-mobile-full.png`

## Riesgos aún abiertos

- Revisión manual en Safari/iOS real, no emulada.
- Validación de entrega real de FormSubmit con un correo autorizado.
- Prueba de comprensión con compradores reales antes de producción.
- Dirección creativa humana debe aprobar la percepción visual; pasar QA técnico no equivale a aprobación de marca.
