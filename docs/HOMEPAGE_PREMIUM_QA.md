# QA final — homepage premium VITAIROS

Fecha: 2026-10-12  
URL local validada: `http://127.0.0.1:4176/`  
Rama: `homepage-v2-ai-positioning`

## Resultado

PASS para revisión en preview.

## Viewports validados

- 1920 × 1080
- 1440 × 900
- 1366 × 768
- 1024 × 768
- 900 × 900 (control intermedio adicional)
- 768 × 1024
- 430 × 932
- 390 × 844
- 360 × 800

En todos los tamaños:

- HTTP 200.
- Sin overflow horizontal.
- Un solo `h1` y landmark `main` presente.
- Cuatro nodos de proyecto en la esfera.
- Tres noticias verificadas renderizadas.
- Estado de vacantes sin aperturas renderizado.
- Sin imágenes rotas.
- Sin IDs duplicados.
- Sin errores de consola.
- Todos los reveals visibles después del recorrido.

## Interacciones y accesibilidad

- Menú móvil abre con `aria-expanded="true"`.
- Escape cierra el menú y restaura foco al botón.
- `prefers-reduced-motion` elimina animación orbital y loader bloqueante.
- La intro se omite en la segunda visita de la misma sesión mediante `sessionStorage`.
- Focus visible global.
- Skip link, labels, landmarks y alt text presentes.
- Targets táctiles principales de al menos 44 px.

## Rutas internas

Todas respondieron HTTP 200:

- `/vitairos-m/`
- `/vitairos-industrial-ai/`
- `/agro-intelligence/`
- `/conecta/`

## Evidencia visual generada

- `preview/homepage-premium-desktop-full.png`
- `preview/homepage-premium-mobile-full.png`
- `preview/homepage-premium-hero.png`
- `preview/homepage-premium-ecosystem.png`
- `preview/homepage-premium-news.png`
- `preview/homepage-premium-careers.png`
- `preview/homepage-premium-intro.png`
- `assets/vitairos-open-graph-1200x630.png`

## Peso de archivos

| Archivo | Raw | Gzip aproximado |
|---|---:|---:|
| `index.html` | 37.206 B | 9.511 B |
| `assets/homepage.css` | 124.680 B | 24.993 B |
| `assets/homepage.js` | 19.934 B | 5.855 B |
| `data/news.json` | 2.584 B | 1.016 B |

La fuente local y las imágenes editoriales son cacheables. Las fotografías usan carga diferida y dimensiones declaradas; la animación canvas se pausa fuera del hero.

## Lighthouse

Lighthouse 13.5.0 se instaló temporalmente y se intentó ejecutar contra la preview local. El host no permitió que Edge expusiera el puerto de depuración dinámica requerido por Lighthouse (`waiting for dynamic debugging port`), por lo que no se generó un puntaje confiable y no se inventan cifras.

Como controles equivalentes disponibles se ejecutaron el smoke test estático, nueve recorridos Playwright, validación responsive, navegación, rutas, consola, imágenes, movimiento reducido y prueba de repetición de intro. Lighthouse debe repetirse desde Chrome/Edge DevTools en un entorno que permita CDP antes de producción.

## QA comercial

- Qué es VITAIROS: explícito en hero y descriptor.
- Qué problema resuelve: explícito en “La brecha”.
- Por qué la IA es central: explícito desde el primer viewport.
- Productos propios: esfera + cuatro tarjetas con rutas públicas.
- Cómo trabaja: timeline de cinco etapas.
- Evidencia: sección de actualidad solo con fuentes verificadas.
- Próximo paso: CTA y formulario simplificado.
- Percepción premium: ritmo 70/30, spacing editorial, motion consistente y gradiente reservado.

## Issue restante

- Ejecutar Lighthouse desde un host con puerto CDP disponible y registrar los cuatro puntajes antes de autorizar producción.
