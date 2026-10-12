# Evolución de la homepage VITAIROS

## Criterio de diseño

Esta versión evoluciona la homepage original sin sustituir su identidad. Conserva la paleta verde y azul, la esfera geométrica, la introducción de red, la navegación y el lenguaje visual de tarjetas. Los cambios refuerzan una posición AI-first y mejoran jerarquía, interacción, accesibilidad y rendimiento.

## Cambios principales

- La introducción existente se acelera y resuelve desde la red VITAIROS hacia las cuatro identidades de proyecto.
- La esfera del hero mantiene su animación y suma cuatro marcas reales orbitando como enlaces hacia VITAIROS M, Industrial AI, Agro Intelligence y Conecta.
- La propuesta principal pasa de promesas genéricas a capacidades concretas: IA aplicada, productos digitales, automatización, datos e integración.
- Se eliminan precios, vacantes, cifras no verificables, palabras clave SEO visibles y modales que ya no aportaban a la nueva visión.
- Misión, visión, proceso, formulario, preguntas frecuentes y pie de página fueron reescritos para presentar a VITAIROS como una compañía latinoamericana de sistemas inteligentes.
- Las superficies oscuras y claras alternan de forma editorial; capacidades y proceso dejan de repetirse como una sucesión de tarjetas.
- Se retiran el tema global y el halo de cursor para reducir ruido visual y código sin uso.

## Arquitectura

- `index.html`: estructura, contenido y datos estructurados.
- `assets/homepage.css`: dirección visual, diseño responsive, superficies y animaciones.
- `assets/homepage.js`: intro, esfera, navegación, modales, progreso de lectura y revelado progresivo.
- `assets/projects/`: marcas vectoriales extraídas de VITAIROS-M e Industrial AI; Agro y Conecta reutilizan sus activos oficiales existentes.
- `assets/vitairos-open-graph-1200x630.png`: imagen social optimizada.

La fuente Outfit se sirve desde el repositorio; la homepage no depende de Google Fonts.

## Validación

El script `tests/homepage-smoke.mjs` revisa estructura y contenido. `tests/homepage-browser-qa.cjs` ejecuta pruebas visuales y funcionales en nueve tamaños de pantalla, incluido el breakpoint intermedio de tablet, valida los cuatro destinos internos y detecta errores de consola, imágenes rotas, IDs duplicados y desbordamiento horizontal.

Esta entrega se mantiene en modo preview. No modifica producción.
