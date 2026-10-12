# Estrategia de homepage VITAIROS V2

Fecha de cierre: 2026-10-12
Estado: congelada para revisión en preview

## Posicionamiento

VITAIROS es una compañía chilena de inteligencia artificial aplicada e ingeniería digital. Ayuda a organizaciones a convertir IA, software, automatización y datos en capacidades que funcionen dentro de procesos reales.

La marca no se presenta como agencia genérica, software factory, vendedora de herramientas ni consultora de IA. El valor está en comprender el proceso, diseñar el sistema e integrarlo con criterio operativo.

## Tesis y mensaje principal

Tesis:

> La IA crea valor cuando se integra al sistema completo.

Headline implementado:

> Diseñamos sistemas inteligentes que transforman cómo operas.

Se eligió esta variante en vez de “Hacemos que la IA funcione dentro de tu organización” porque mantiene el verbo y la personalidad visual de la homepage original, introduce la idea de sistema y comunica un cambio operacional concreto. El eyebrow “Inteligencia artificial aplicada” conserva la categoría de forma explícita y evita que el titular dependa de hype.

Descriptor preservado:

> SOFTWARE · IA · PRODUCTOS DIGITALES

La frase “Ingeniería digital para empresas que buscan crecer con claridad” se conserva como principio de tono corporativo, aunque no se repite en el hero para evitar duplicar mensajes.

## Arquitectura de marca

```text
VITAIROS
└── Inteligencia artificial aplicada
    ├── VITAIROS-M · salud digital
    ├── Industrial AI · industria y minería
    ├── Agro Intelligence · agricultura
    └── VITAIROS Conecta · educación y ciudadanía digital
```

Las iniciativas comparten una visión, pero cada una conserva su página, audiencia y nivel de madurez. La homepage no les atribuye resultados clínicos, industriales, agrícolas ni educativos no verificados.

## Arquitectura de información

1. **Intro breve** — red original, isotipo y secuencia Diagnosticar · Conectar · Transformar.
2. **Hero** — posición AI-first, sistema geométrico original y proyectos orbitando como enlaces.
3. **Capacidades** — IA aplicada, software/producto, automatización, datos e integración.
4. **Ecosistema** — cuatro iniciativas bajo una sola visión.
5. **Proceso** — diagnóstico, diseño, implementación y medición/evolución.
6. **Visión** — propósito organizacional y ambición latinoamericana.
7. **Contacto** — conversación sobre un proceso o caso de uso real.
8. **FAQ** — expectativas, forma de inicio, integración y alcance.
9. **Footer** — capacidades, ecosistema, compañía y legal.

El principio “Entrar pequeño. Probar rápido. Escalar con evidencia” se expresa en el contenido de proceso y en la progresión diagnóstico → diseño → implementación → medición. No se fuerza como eslogan aislado cuando no aporta contexto.

## Tono

- Claro, sobrio, técnico y humano.
- Comercial sin promesas absolutas.
- Habla de procesos, decisiones, integración y evidencia.
- Evita “revolucionario”, “líder”, “disruptivo” y resultados no demostrados.
- Usa lenguaje comprensible para una persona ejecutiva sin rebajar la precisión técnica.

## CTA

CTA principal:

> Explorar una oportunidad de IA

CTA secundario:

> Conocer el ecosistema

CTA de navegación:

> Conversemos

Todos dirigen a acciones reales dentro de la página. No se promete agenda automática, propuesta en 48 horas ni diagnóstico garantizado.

## Sistema visual

- Paleta corporativa: Abismo, Bosque, Esmeralda, Neural, Pulso y Niebla.
- Outfit como única tipografía corporativa, autoalojada desde el brand kit.
- Isotipo oficial de nodos; no se crea un símbolo alternativo.
- Hero oscuro y tecnológico; tarjetas y secciones con variación de superficie y espacio negativo.
- Gradiente verde–turquesa–azul reservado para énfasis y CTA.
- Glassmorphism moderado, líneas finas y sombras profundas.
- La esfera geométrica y red original se conservan como activos de identidad.

La auditoría encontró Outfit en la homepage, Conecta, tokens y brand kit; Sora no forma parte del sistema real del repositorio. Mantener Outfit aporta continuidad, reduce dependencias y evita una migración estética arbitraria.

## Movimiento e interacción

- Intro breve con escape automático y sin bloqueo bajo movimiento reducido.
- Cuatro iconos de proyecto orbitan alrededor de la esfera y son enlaces accesibles.
- La órbita se pausa al hacer hover o focus para facilitar interacción.
- Reveal progresivo con fallback de visibilidad.
- Hover sutil, sin tilt 3D ni efecto gaming.
- Cursor glow actualizado por evento, no por un loop perpetuo.
- Menú móvil con Escape, `aria-expanded` y restauración de foco.

## Contenido congelado por sección

### Hero

- Categoría: Inteligencia artificial aplicada.
- Propuesta: sistemas inteligentes que transforman cómo opera la organización.
- Capacidades resumidas: IA aplicada, automatización y productos digitales.
- Principios: proceso, datos, integración y evolución.

### Capacidades

- IA aplicada al proceso.
- Software que entra en operación.
- Automatización, datos e integración.
- Mensaje: las capacidades trabajan como un sistema, no como herramientas aisladas.

### Ecosistema

- VITAIROS-M.
- Industrial AI.
- Agro Intelligence.
- VITAIROS Conecta.

Cada tarjeta incluye nombre, valor breve, señal visual y enlace propio.

### Proceso

- Diagnóstico.
- Diseño.
- Implementación.
- Medición y evolución.

El piloto está contenido en el diseño/implementación progresiva. No se promete una metodología universal de cinco etapas para todos los encargos.

### Visión

- Convertir inteligencia artificial en capacidad organizacional.
- Impulsar IA útil desde Latinoamérica.

### Contacto

El formulario clasifica la oportunidad por proceso y capacidad, pide solo los datos necesarios y no incluye opciones de empleo.

## Evidencia y claims

La homepage no muestra métricas, logos de clientes, testimonios, países, ROI, premios, alianzas ni casos de éxito porque no hay respaldo suficiente en el repositorio. La credibilidad se construye mediante claridad metodológica, arquitectura de iniciativas y estados prudentes.

## SEO

- Intención primaria: inteligencia artificial aplicada para empresas.
- Intenciones preservadas: software a medida, automatización, datos e integraciones.
- Entidades: VITAIROS y sus cuatro iniciativas.
- Datos estructurados limitados a información visible y defendible.
- FAQ visible y JSON-LD sincronizados.
- Open Graph corporativo propio.

## Criterio de aprobación

La V2 queda lista para revisión si una persona puede identificar en pocos segundos:

- qué es VITAIROS;
- qué problema aborda;
- cómo trabaja;
- cómo se organiza su ecosistema;
- cuál es el siguiente paso.

La publicación en producción requiere aprobación explícita posterior. Esta estrategia no autoriza merge, push ni deployment.
