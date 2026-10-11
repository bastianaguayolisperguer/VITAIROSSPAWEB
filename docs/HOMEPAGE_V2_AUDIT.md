# Auditoría Homepage V2 — VITAIROS SpA

Fecha: 11 de octubre de 2026  
Alcance: homepage corporativa en modo preview  
Rama: `homepage-v2-ai-positioning`

## Registro inicial

- Repositorio: `bastianaguayolisperguer/VITAIROSSPAWEB`.
- Ruta local: `C:\Dev\pc-setup\vitairos-spa-web`.
- Rama de origen: `main`.
- Commit inicial: `2275c92` (`Improve Conecta SEO and social previews`).
- Estado inicial: worktree limpio; `main` alineado con `origin/main`.
- Rama de trabajo creada antes de editar: `homepage-v2-ai-positioning`.
- No se autoriza merge, deploy, modificación de DNS ni cambios de Cloudflare Production.
- Archivos previstos antes de implementar: `index.html`, CSS/JS separados, imagen OG, documentación, smoke tests y `sitemap.xml`.

## Alcance revisado

Se revisaron la homepage y todas las rutas solicitadas:

- `/index.html`
- `/conecta/`
- `/vitairos-m/`
- `/vitairos-industrial-ai/`
- `/agro-intelligence/`
- `/bastian-lisperguer/`
- `/data/`
- `robots.txt`
- `sitemap.xml`

El repositorio es un sitio estático multipágina sin framework, `package.json`, pipeline de build, CI ni suite de pruebas. Conecta es la única sección que separa HTML, CSS, JavaScript, assets y datos.

## 1. Qué funciona actualmente

- La identidad cromática principal ya utiliza Abismo, Bosque, Esmeralda, Neural, Pulso y Niebla.
- El descriptor `Software · IA · Productos digitales` es consistente con la marca y puede conservarse.
- La homepage contiene una ruta comercial, una explicación de servicios, proceso, preguntas frecuentes y contacto.
- El title actual captura búsquedas relevantes de software a medida e IA para empresas en Chile.
- Existen canonical, Open Graph, Twitter Card y datos estructurados como base SEO.
- Las cuatro iniciativas tienen páginas públicas propias y están incluidas en el sitemap.
- Industrial AI y Agro Intelligence utilizan lenguaje prudente sobre diagnóstico, piloto y escalamiento.
- VITAIROS-M contiene disclaimers que evitan presentar el producto como diagnóstico o reemplazo profesional.
- Conecta presenta buenas prácticas de accesibilidad, responsive, reduced motion y gating de evidencia.

## 2. Qué está desactualizado

- El hero abre con `Estudio de Software` y `Diseñamos y construimos productos digitales que escalan`.
- IA aparece como un servicio entre varios, no como capacidad estratégica central.
- La navegación prioriza servicios, precios, empleos y segmentos de cliente.
- La arquitectura corporativa no muestra VITAIROS-M, Industrial AI, Agro Intelligence ni Conecta.
- La homepage incorpora precios, cargos abiertos, condiciones comerciales, stacks, numerosos modales y siete formularios; todo compite con la tesis corporativa.
- La franja visible de keywords, países y segmentos se percibe como SEO antiguo y añade claims no respaldados.
- El tema claro/oscuro, el cursor glow, el loader, el scan, el canvas y los efectos simultáneos generan ruido y coste técnico.

## 3. Qué comunica “software company”

- Badge `Estudio de Software · Chile & LATAM`.
- Headline centrado en “productos digitales que escalan”.
- Menú con `Servicios`, `¿Para quién?`, `Precios` y `Trabaja con nosotros`.
- Secciones sobre apps, SaaS, UX/UI, ingeniería 3D y stacks técnicos.
- Segmentación dominante por startups, pymes y empresas.
- Mensajes de velocidad, sprints, soporte y propiedad de código típicos de software factory.
- IA tratada como una tarjeta de servicio, sin explicar integración, datos, supervisión o trazabilidad.

## 4. Qué debe evolucionar hacia “Applied AI Company”

- Abrir con una definición directa: empresa chilena de inteligencia artificial aplicada e ingeniería digital.
- Presentar software, automatización, datos, integraciones y productos como capacidades para implementar IA.
- Explicar la brecha entre probar una herramienta e integrarla en un proceso real.
- Exponer una ruta de trabajo defendible: diagnóstico → diseño → piloto → implementación → escalamiento.
- Presentar las cuatro iniciativas como expresiones de una misma capacidad central.
- Sustituir promesas genéricas por principios operacionales: supervisión humana, trazabilidad, modularidad, integración progresiva y evidencia.
- Unificar los CTA alrededor de una conversación sobre un problema o caso de uso concreto.

## 5. Auditoría de claims

### Confirmado por artefactos públicos del repositorio

- Existen cuatro iniciativas públicas bajo VITAIROS y sus rutas están activas.
- VITAIROS-M se presenta como MVP en validación y no reemplaza atención profesional.
- Industrial AI se plantea como propuesta modular orientada a pilotos.
- Agro Intelligence utiliza la secuencia diagnóstico → piloto → escalamiento.
- Conecta se encuentra desarrollando pilotos; `data/conecta-impact.json` mantiene métricas y aliados vacíos.
- El descriptor corporativo vigente es `Software · IA · Productos digitales`.

### Validable antes de publicar

Requiere contratos, CRM, documentación comercial, expedientes o fuentes externas:

- `+10 años` de experiencia.
- Clientes o proyectos en Chile, Argentina, México, Colombia, España o EE.UU.
- Cumplimiento de plazos y tiempos de respuesta.
- Política universal de sprints de dos semanas.
- Soporte incluido de 15 a 30 días.
- Condiciones comerciales 30/40/30 y medios de pago.
- Diagnóstico gratuito como política vigente.
- Cargos abiertos, comisiones y participación societaria.
- Domicilio exacto Santiago/Valparaíso.

### Hipótesis o propuesta estratégica

Puede publicarse como enfoque, no como resultado demostrado:

- Empresa de inteligencia artificial aplicada e ingeniería digital.
- Cerrar la brecha entre probar IA e integrarla.
- Entrar pequeño, probar rápido y escalar con evidencia.
- Arquitectura modular.
- Supervisión humana y trazabilidad desde el diseño.
- No vender herramientas aisladas.

### Eliminar de la homepage

- `100% entregas a tiempo`.
- `24h respuesta garantizada`.
- `Clientes en Chile, Arg, Méx, Col`.
- `Trabajamos con clientes en toda Latinoamérica, España y EE.UU.`.
- `Propuesta en 48h`.
- `Escalable desde el día 1`.
- `Arquitectura enterprise` sin alcance verificable.
- `Todos los proyectos incluyen soporte post-lanzamiento`.
- `Tu idea está protegida desde el primer contacto`.
- `Código 100% propiedad del cliente` como absoluto.
- `Agendar` cuando la acción real es enviar un formulario o correo.

## 6. Duplicaciones

- El logo se repetía como data URI grande en loader, header y footer.
- CSS, JS, imágenes y datos estructurados convivían dentro de un único documento.
- Había dos sistemas de reveal y varias capas de animación con reglas distintas.
- Los CTA usaban múltiples nombres para la misma intención: consulta, diagnóstico, agenda, solicitud y propuesta.
- La homepage repetía la misma propuesta como servicios, audiencias, precios y preguntas frecuentes.
- Cada vertical mantiene su propio sistema tipográfico y de navegación sin una base corporativa compartida.

## 7. Problemas de arquitectura

- `index.html` pesaba 1.050.176 bytes y contenía aproximadamente 65 KB de CSS, 18,5 KB de JS y assets base64.
- Los assets embebidos no podían cachearse de forma independiente.
- No existía un sistema común de tokens, componentes, header o footer.
- La homepage no enlazaba a las cuatro iniciativas; solo el sitemap las conectaba.
- Los modales de empleo, términos, privacidad y proyecto aumentaban la deuda y diluían la semántica del documento.
- No había pruebas reproducibles de anchors, SEO, JSON-LD o viewports.
- Los formularios dependían de FormSubmit; varios enviaban datos a una cuenta personal y algunos carecían de consentimiento explícito.

Decisión V2: mantener tecnología estática, separar `index.html`, `assets/homepage-v2.css` y `assets/homepage-v2.js`, reutilizar el isotipo oficial y añadir smoke tests sin incorporar un framework.

## 8. Performance

### Baseline

| Recurso | Peso raw aproximado | Observación |
|---|---:|---|
| Homepage original | 1,05 MB | Data URI, CSS y JS inline |
| Agro Intelligence | 1,41 MB | Imágenes embebidas y HTML minificado |
| VITAIROS-M | 77,8 KB | CSS/JS inline |
| Industrial AI | 50,1 KB | CSS/JS inline |
| Conecta HTML+CSS+JS | 104 KB | Arquitectura separada y cacheable |

Riesgos del baseline:

- loader visual de aproximadamente tres segundos;
- cursor glow con `requestAnimationFrame` permanente;
- animaciones no cubiertas por `prefers-reduced-motion`;
- fuente remota bloqueante;
- PNG grande repetido dentro del HTML;
- imagen OG declarada pero inexistente.

Objetivos V2:

- HTML menor a 50 KB;
- CSS y JS cacheables;
- fuente Outfit autoalojada;
- sin loader bloqueante, librerías externas ni canvas permanente;
- JavaScript progresivo y pequeño;
- dimensiones explícitas en imágenes;
- motion desactivable;
- OG corporativo real de 1200×630.

## 9. SEO que debe conservarse

### Baseline extraído

- Title: `Desarrollo de Software a Medida e IA para Empresas en Chile | VITAIROS SpA`.
- Description: software a medida, apps, automatización, integraciones e IA para Chile y LATAM.
- Canonical: `https://www.vitairos.com`.
- OG: title, description, type, URL e imagen inexistente `/og-preview.png`.
- Twitter: card, title y description; faltaba `twitter:image`.
- JSON-LD: Organization, WebSite, ProfessionalService y FAQPage.
- H1: `Diseñamos y construimos productos digitales que escalan`.
- Enlaces internos: solo anchors de homepage; ninguna iniciativa pública.

Problemas a corregir:

- teléfono ficticio `+56 9 0000 0000`;
- logo estructurado inexistente;
- canonical y OG URL sin slash;
- FAQ estructurado distinto del FAQ visible;
- geolocalización específica no verificada;
- descripción de Organization centrada en software;
- falta de `og:locale`, dimensiones/alt de OG y `twitter:image`;
- title/description demasiado largos;
- franja visible de keywords y países no defendibles.

La V2 conserva de forma natural las intenciones `software a medida Chile`, `IA para empresas Chile`, `automatización`, `software empresarial`, e incorpora `inteligencia artificial aplicada`, `implementación de IA`, `automatización con IA` e `integración de IA en procesos`.

`robots.txt` raíz es correcto y se conserva. `sitemap.xml` mantiene las seis rutas principales; el `lastmod` de la homepage solo debe llegar a producción junto con una publicación aprobada.

## 10. Elementos de Conecta reutilizables

- Paleta y roles cromáticos.
- Outfit como tipografía corporativa autoalojada.
- Separación HTML/CSS/JS/assets.
- Scroll progress sutil.
- Reveal con un solo `IntersectionObserver`.
- Parallax condicionado a puntero fino y reduced motion.
- Header fijo, navegación móvil accesible y cierre con Escape.
- Skip link, `<main>`, landmarks, focus visible y forced colors.
- Breakpoints por componente y reflujo móvil real.
- Gating de métricas `verified: true` y aliados `confirmed: true`.
- Jerarquía kicker → headline → lead → composición → CTA.

No reutilizar literalmente:

- colores de audiencia, blobs y radios educativos;
- splash de dos segundos;
- estética pastel;
- densidad de tarjetas de programa;
- duplicaciones y overrides acumulados en su CSS.

## Decisión tipográfica

Se adopta Outfit como única familia corporativa para homepage: marca, titulares, body e interfaz. Es la única opción respaldada por homepage, Conecta, tokens y brand kit; Sora no aparece en el repositorio. La variable font se autoaloja con `font-display: swap`.

## Riesgos remanentes

- La imagen OG debe verificarse visualmente tras su generación.
- Las páginas verticales mantienen arquitecturas y voces distintas; armonizarlas queda fuera del alcance de esta V2.
- La dirección legal, programas, hitos y cualquier evidencia corporativa requieren validación documental antes de publicarse.
- El preview no debe indexarse ni desplegarse como producción sin aprobación explícita.

