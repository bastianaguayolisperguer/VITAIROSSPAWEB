# VITAIROS Conecta

## Objetivo

`VITAIROS Conecta` es la landing oficial de la iniciativa de impacto y educación tecnológica de VITAIROS SpA. La página presenta el propósito, los públicos, la metodología, el estado de los primeros pilotos y el enfoque de medición sin publicar cifras, aliados ni resultados que todavía no estén respaldados.

La implementación mantiene la identidad del sitio principal: tipografía Outfit, estructura de marca, isotipo oficial, navegación fija y footer de VITAIROS. La paleta se basa en los valores entregados en la guía de marca: Abismo `#061611`, Bosque `#0E3A2F`, Esmeralda `#17A673`, Neural `#1C66B1`, Pulso `#6AD7B0` y Niebla `#E8F6F1`. Los tonos violeta, teal y naranja se utilizan únicamente para diferenciar las tres líneas del programa.

Conecta conserva una identidad propia mediante el distintivo junto al wordmark, gradientes Pulso–Esmeralda–Neural, patrones de red, progreso de lectura, revelado progresivo y respuestas sutiles al puntero. La dirección visual es luminosa y educativa: superficies claras, formas orgánicas, tarjetas pastel y elementos flotantes reemplazan el antiguo tratamiento oscuro corporativo. La página utiliza un único tema claro para evitar cambios bruscos de contraste. Todas las animaciones respetan `prefers-reduced-motion`.

## Ruta

- Producción: `https://www.vitairos.com/conecta/`
- Archivo de entrada: `conecta/index.html`
- Canonical: `https://www.vitairos.com/conecta/`

La estructura de directorio con `index.html` sigue la convención ya utilizada por las rutas actuales del repositorio (`/agro-intelligence/`, `/vitairos-industrial-ai/`, `/vitairos-m/` y `/bastian-lisperguer/`). En Cloudflare Pages, la ruta canónica termina en slash; la variante sin slash debe resolverse hacia la misma página mediante el manejo automático de HTML de Pages.

### Observación sobre `vitairos.com` sin `www`

Durante la auditoría del 11 de octubre de 2026 se comprobó que `https://vitairos.com/conecta/` responde con `301` hacia `https://www.vitairos.com/`, eliminando el path. El sitio vigente utiliza `www.vitairos.com` en canonical, sitemap, Open Graph y formularios. Por eso esta landing mantiene `https://www.vitairos.com/conecta/` como canonical técnico.

La regla de redirección de dominio debe ajustarse manualmente en Cloudflare para preservar la ruta completa:

- origen esperado: `https://vitairos.com/conecta/`
- destino esperado: `https://www.vitairos.com/conecta/`

No se añadió una regla `_redirects` al repositorio porque la redirección ocurre a nivel del dominio antes de resolver los archivos de Pages.

## Archivos creados

- `conecta/index.html`: contenido semántico, SEO, Open Graph, JSON-LD y estructura de la landing.
- `conecta/styles.css`: sistema visual educativo, responsive, foco visible y reglas de movimiento reducido.
- `conecta/script.js`: menú móvil, tema, año del footer y carga segura de datos futuros.
- `conecta/assets/vitairos-isotipo-transparent.png`: recorte transparente del isotipo entregado por VITAIROS, preparado para fondos claros y oscuros.
- `data/conecta-impact.json`: fuente centralizada para métricas verificadas y aliados autorizados.
- `docs/VITAIROS_CONECTA.md`: esta documentación.

## Archivos modificados

- `sitemap.xml`: incorpora `https://www.vitairos.com/conecta/`.

## Estructura de la página

1. Header VITAIROS con navegación de la landing.
2. Hero con el lema “Tecnología que abre oportunidades”.
3. Presentación de VITAIROS Conecta.
4. Líneas para jóvenes, personas mayores y educadores.
5. Pilares de ciudadanía digital.
6. Metodología “Aprender haciendo”.
7. Estado de primeros pilotos en la Región de Valparaíso.
8. Convocatoria para organizaciones.
9. Enfoque de medición e impacto.
10. Sección de alianzas preparada, pero oculta mientras no existan datos confirmados.
11. CTA final con correo institucional.
12. Footer oficial con los canales presentes en el sitio vigente.

## Cómo actualizar contenidos

El texto visible vive en `conecta/index.html`. Mantener estas reglas al editar:

- describir a Conecta como una iniciativa de VITAIROS SpA;
- no crear un logo o isotipo alternativo;
- reutilizar `conecta/assets/vitairos-isotipo-transparent.png` como marca visual de la iniciativa;
- no agregar cifras, testimonios, instituciones, alianzas o resultados sin respaldo;
- utilizar lenguaje como “en desarrollo”, “primeros pilotos” o “procesos de validación” cuando corresponda;
- conservar un único `h1` y la jerarquía `h2`/`h3` existente;
- mantener el correo `contacto@vitairos.com` salvo que cambie el canal institucional del sitio principal.

## Cómo agregar métricas reales

Editar `data/conecta-impact.json` y agregar objetos a `metrics` solamente después de validar la fuente. El frontend ignora cualquier métrica que no tenga `verified: true` o que tenga un valor vacío.

Ejemplo:

```json
{
  "updatedAt": "2027-03-15",
  "status": "validated-pilots",
  "territory": "Región de Valparaíso",
  "metrics": [
    {
      "label": "Participantes con registro validado",
      "value": 120,
      "verified": true,
      "source": "Informe interno aprobado 2027-03"
    }
  ],
  "allies": []
}
```

El campo `source` documenta la evidencia aunque no se muestre públicamente. No usar porcentajes si la base de cálculo y el instrumento no están documentados.

## Cómo agregar aliados

La sección `#alianzas` permanece oculta cuando `allies` está vacío. Para mostrarla, agregar un objeto por aliado con autorización formal de uso de marca:

```json
{
  "name": "Nombre legal de la institución",
  "logoUrl": "/conecta/assets/aliados/institucion.webp",
  "logoAlt": "Logo de Nombre legal de la institución",
  "website": "https://institucion.example/",
  "confirmed": true
}
```

La página solo renderiza aliados con `confirmed: true`, nombre, URL de logo y texto alternativo. Guardar logos optimizados en WebP o AVIF, con dimensiones explícitas y autorización registrada fuera del repositorio.

## Cómo crear nuevas rutas del programa

La arquitectura deja libres y enlazables estas rutas futuras:

- `/conecta/jovenes/`
- `/conecta/personas-mayores/`
- `/conecta/educadores/`
- `/conecta/impacto/`
- `/conecta/recursos/`

Para crear una ruta:

1. crear el directorio correspondiente con su `index.html`;
2. reutilizar `../styles.css` y `../script.js` cuando la profundidad sea de un nivel, o usar rutas absolutas `/conecta/styles.css` y `/conecta/script.js`;
3. conservar el header, el footer, el logo oficial y el canonical propio;
4. añadir la URL final al `sitemap.xml`;
5. comprobar la navegación con teclado, 320–1920 px y movimiento reducido.

## SEO y datos estructurados

La landing incluye:

- title y meta description específicos;
- canonical con slash final;
- Open Graph y Twitter Card;
- `WebPage` y `Organization` en JSON-LD;
- idioma `es-CL`;
- entrada propia en el sitemap.

No se agregaron perfiles sociales distintos de LinkedIn, Instagram y YouTube, que ya están presentes en el footer del sitio oficial.

## Analítica

El repositorio no contiene una solución de analítica vigente. Por ese motivo no se instalaron scripts ni se emitieron eventos. Cuando exista infraestructura oficial, se pueden incorporar los eventos `conecta_cta_contact`, `conecta_view_young`, `conecta_view_seniors` y `conecta_view_educators` respetando la política de privacidad y el mecanismo de consentimiento vigente.

## Despliegue

El repositorio no contiene `wrangler.toml`, `_headers`, `_redirects`, `package.json` ni una acción de build. La estructura observada corresponde a publicación estática directa en Cloudflare, con cada ruta servida desde un directorio con `index.html`. No se añadió un framework ni una etapa de compilación.

Antes de publicar:

1. revisar `git diff`;
2. servir la raíz del repositorio con un servidor HTTP local;
3. comprobar `/conecta/` y `/data/conecta-impact.json`;
4. verificar que `/conecta` redirija una sola vez a `/conecta/` en el entorno de Cloudflare;
5. validar el HTML, los enlaces, la consola y el sitemap;
6. ejecutar Lighthouse en producción o en un preview de Cloudflare Pages.
