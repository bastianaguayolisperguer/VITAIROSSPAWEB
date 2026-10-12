# Arquitectura premium de homepage VITAIROS

Fecha: 2026-10-12  
Estado: implementación preview

| Orden | Sección | Objetivo | Mensaje / headline | Visual | Tema | Acción |
|---:|---|---|---|---|---|---|
| 1 | Intro | Firma de marca breve | Nodos → conexiones → isotipo → VITAIROS | Red animada existente | Dark | Entrada automática; se omite en repetición |
| 2 | Hero | Explicar qué, cómo y por qué en segundos | Hacemos que la IA funcione dentro de tu organización | Esfera con proyectos en nodos reales | Dark | Explorar una oportunidad de IA |
| 3 | La brecha | Definir el problema de negocio | La IA no genera valor solo por estar disponible | Herramientas → procesos → datos → integración → valor | Dark | Comprender la brecha |
| 4 | Dónde generamos valor | Hablar desde fricciones antes que tecnologías | Partimos por la fricción. Después elegimos la tecnología | Lista editorial problema/capacidad | Light | Conocer soluciones |
| 5 | Capacidades | Resumir el sistema de entrega | No vendemos herramientas aisladas | Rail de cinco capacidades | Light | Continuar al método |
| 6 | Cómo trabajamos | Reducir incertidumbre comercial | De oportunidad a capacidad operativa | Timeline de cinco etapas | Light | Entender el recorrido |
| 7 | Ecosistema | Mostrar productos y verticales bajo una arquitectura común | Una capacidad tecnológica. Distintos problemas reales | Cuatro tarjetas con marcas reales | Dark | Visitar cada iniciativa |
| 8 | Actualidad | Aportar evidencia pública | VITAIROS en movimiento | Cards desde `/data/news.json` | Light | Leer fuentes verificables |
| 9 | Nosotros | Explicar convicciones y diferenciadores | Tecnología útil. IA con criterio. Soluciones que operan | Statement + cinco razones | Dark | Comprender el enfoque |
| 10 | Trabaja con nosotros | Mantener una puerta de talento sin dominar la página | Construye tecnología con propósito | Banda compacta desde `/data/jobs.json` | Dark | Ver vacantes reales o compartir perfil |
| 11 | CTA + contacto | Convertir interés en conversación | ¿Dónde genera más valor la IA en tu organización? | CTA editorial + formulario simple | Dark premium | Conversemos |

## Arquitectura de marca

```text
VITAIROS
└── Capacidad central
    └── Inteligencia artificial aplicada + ingeniería digital
        ├── VITAIROS-M · salud digital
        ├── Industrial AI · industria y minería
        ├── Agro Intelligence · agricultura
        └── VITAIROS Conecta · educación y ciudadanía digital
```

## Sistema cromático

- Dark: Abismo y Bosque con acentos Esmeralda, Pulso y Neural.
- Light: Niebla matizada, nunca blanco puro.
- Gradiente: reservado para palabras clave, líneas de progreso y CTA.
- Transiciones: fondos graduales entre capítulos, sin tarjetas oscuras superpuestas sobre grandes lienzos blancos.

## Sistema de movimiento

- Microinteracción: 180–250 ms.
- Reveal: 450 ms con `cubic-bezier(.22,1,.36,1)`.
- Transición editorial: 650 ms.
- Intro: 1,45 s, fallback máximo 1,9 s.
- La esfera se pausa con hover/focus y deja de animarse fuera del hero.
- Todo movimiento no esencial se desactiva con `prefers-reduced-motion`.

## Datos desacoplados

- `/data/news.json`: solo se renderizan entradas `verified: true`.
- `/data/jobs.json`: solo se renderizan entradas `status: "open"`.
- `/data/milestones.json`: registro auditable de hitos verificables.

La estructura deja preparado un futuro CMS sin añadirlo ahora.
