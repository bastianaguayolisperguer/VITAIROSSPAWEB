# QA premium final de la homepage VITAIROS

Fecha: 2026-10-13

Rama: `homepage-v2-ai-positioning`

Entorno: servidor local de preview

Producción: no modificada

## Resultado

`PASS` — la prueba estática y la prueba de navegador finalizaron correctamente.

## Pruebas ejecutadas

### Smoke test

Comando:

```text
node tests/homepage-smoke.mjs
```

Resultado:

```text
Homepage smoke test: OK (34435 bytes, 34 IDs, 3 noticias verificadas).
```

Controles cubiertos:

- un único H1 y landmark `main`;
- IDs no duplicados;
- cuatro nodos y cuatro tarjetas de proyecto;
- metodología de exactamente cuatro etapas;
- hero sin pills ni estadísticas;
- rutas internas presentes;
- noticias, vacantes e hitos con esquema válido;
- JSON-LD válido;
- Outfit local, esfera y sistema premium enlazados;
- HTML menor a 60 KB.

### QA de navegador

Comando:

```text
node tests/homepage-browser-qa.cjs
```

| Viewport | HTTP | Overflow | Imágenes rotas | Consola | Resultado |
|---|---:|---:|---:|---:|---|
| 1920×1080 | 200 | 0 px | 0 | 0 | PASS |
| 1440×900 | 200 | 0 px | 0 | 0 | PASS |
| 1366×768 | 200 | 0 px | 0 | 0 | PASS |
| 1024×768 | 200 | 0 px | 0 | 0 | PASS |
| 900×900 | 200 | 0 px | 0 | 0 | PASS auxiliar |
| 768×1024 | 200 | 0 px | 0 | 0 | PASS |
| 430×932 | 200 | 0 px | 0 | 0 | PASS |
| 390×844 | 200 | 0 px | 0 | 0 | PASS |
| 360×800 | 200 | 0 px | 0 | 0 | PASS |

## Controles funcionales

- Menú móvil abre, actualiza `aria-expanded` y bloquea el fondo.
- Escape cierra el menú y restaura el foco al botón.
- `prefers-reduced-motion` omite la intro y elimina animación de la órbita.
- `sessionStorage` impide repetir la intro durante la misma sesión.
- Las rutas `/vitairos-m/`, `/vitairos-industrial-ai/`, `/agro-intelligence/` y `/conecta/` responden 200.
- Tres noticias verificadas se cargan desde `data/news.json`.
- El estado sin vacantes se carga correctamente desde `data/jobs.json`.
- No hay IDs duplicados ni errores de JavaScript en consola.
- El formulario conserva campos, honeypot, mensajes de privacidad y evento semántico.

## QA visual

### Hero y esfera

- La esfera comparte protagonismo con la promesa sin tapar el texto.
- Los cuatro proyectos siguen siendo nodos interactivos reales.
- En desktop la esfera permanece fija durante hero y brecha, reduce escala y desaparece antes de la región clara.
- En móvil la esfera vuelve al flujo y aparece después del copy y los CTA.

### Transiciones

- Hero y brecha forman una continuidad oscura.
- Valor y metodología comparten una única región clara.
- La entrada y salida de esa región se resuelven con curvas orgánicas y luminancia progresiva.
- Ecosistema, evidencia, compañía y CTA continúan en variaciones de Bosque/Abismo sin saltos blancos adicionales.

### Tipografía y spacing

- Headings contenidos por `clamp()` y ancho máximo en caracteres.
- Sistema de separación basado en 8 px: 16, 24, 32, 40/48, 56/64, 72, 88/96, 104/128/152.
- Cuerpo con contraste y largo de línea controlados.
- En 360 px no hay clipping ni overflow horizontal.

### Imágenes

- Solo se muestran tres fotografías de actividad real.
- No se añadieron fotos de stock ni placeholders.
- Todas las imágenes cargan y conservan `alt`.

## Evidencia generada

1. `preview/homepage-premium-desktop-full.png`
2. `preview/homepage-premium-mobile-full.png`
3. `preview/homepage-premium-intro.png`
4. `preview/homepage-premium-hero.png`
5. `preview/homepage-premium-hero-transition.png`
6. `preview/homepage-premium-value.png`
7. `preview/homepage-premium-method.png`
8. `preview/homepage-premium-ecosystem.png`
9. `preview/homepage-premium-news.png`
10. `preview/homepage-premium-final-cta.png`

También se regeneraron `preview/homepage-premium-mobile-hero.png` y `assets/vitairos-open-graph-1200x630.png`.

## Riesgos y pendientes

- No se ejecutó una medición Lighthouse de red/CPU reales; la validación de performance en esta iteración se limita a arquitectura, peso, transforms/opacity y ausencia de errores.
- El formulario depende de FormSubmit y requiere validación end-to-end únicamente cuando se autorice un entorno externo.
- La percepción comparativa con Conecta e Industrial AI requiere aprobación humana final; no existe una métrica automatizada para “premium feel”.
- No se realizó deploy, merge, push ni modificación de producción.
