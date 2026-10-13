const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const failures = [];
const expect = (condition, message) => { if (!condition) failures.push(message); };
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const pages = [
  {
    file: 'index.html',
    title: 'Inteligencia Artificial para Empresas en Chile | VITAIROS',
    canonical: 'https://www.vitairos.com/',
    home: true,
  },
  {
    file: 'vitairos-m/index.html',
    title: 'Salud Mental Digital y Continuidad de Atención | VITAIROS-M',
    canonical: 'https://www.vitairos.com/vitairos-m/',
  },
  {
    file: 'vitairos-industrial-ai/index.html',
    title: 'IA para Minería y Operaciones Industriales | VITAIROS',
    canonical: 'https://www.vitairos.com/vitairos-industrial-ai/',
  },
  {
    file: 'agro-intelligence/index.html',
    title: 'VITAIROS Agro Intelligence | IA, automatización y datos para el agro',
    canonical: 'https://www.vitairos.com/agro-intelligence/',
  },
  {
    file: 'conecta/index.html',
    title: 'VITAIROS Conecta | Educación digital e IA responsable',
    canonical: 'https://www.vitairos.com/conecta/',
  },
];

function tags(html, tagName) {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'gi'))].map((match) => match[0]);
}

function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1] || '';
}

function meta(html, selectorName, selectorValue) {
  const tag = tags(html, 'meta').find((candidate) => attr(candidate, selectorName) === selectorValue);
  return tag ? attr(tag, 'content') : '';
}

function link(html, rel) {
  const tag = tags(html, 'link').find((candidate) => attr(candidate, 'rel').split(/\s+/).includes(rel));
  return tag ? attr(tag, 'href') : '';
}

function visibleText(fragment) {
  return fragment
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const seenTitles = new Set();
const seenCanonicals = new Set();

for (const page of pages) {
  const html = read(page.file);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim() || '';
  const description = meta(html, 'name', 'description');
  const canonical = link(html, 'canonical');
  const robots = meta(html, 'name', 'robots').toLowerCase();
  const headings = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((match) => ({
    level: Number(match[1]),
    text: visibleText(match[2]),
  }));
  const images = tags(html, 'img');

  expect(title === page.title, `${page.file}: title inesperado: ${title}`);
  expect(!seenTitles.has(title), `${page.file}: title duplicado`);
  seenTitles.add(title);
  expect(description.length >= 70 && description.length <= 170, `${page.file}: description fuera de 70–170 caracteres (${description.length})`);
  expect(canonical === page.canonical, `${page.file}: canonical inesperado: ${canonical}`);
  expect(!seenCanonicals.has(canonical), `${page.file}: canonical duplicado`);
  seenCanonicals.add(canonical);
  expect(robots.includes('index') && robots.includes('follow') && !robots.includes('noindex'), `${page.file}: robots no indexable: ${robots}`);
  expect(headings.filter((heading) => heading.level === 1).length === 1, `${page.file}: debe tener exactamente un H1`);
  expect(!headings.some((heading, index) => index > 0 && heading.level - headings[index - 1].level > 1), `${page.file}: salto perjudicial en jerarquía de headings`);
  expect(images.every((image) => /\balt\s*=/.test(image)), `${page.file}: existe una imagen sin atributo alt`);
  expect(!html.includes('?viewAsMember=true'), `${page.file}: LinkedIn conserva parámetro no canónico`);

  for (const property of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image']) {
    const value = meta(html, 'property', property);
    expect(Boolean(value), `${page.file}: falta ${property}`);
    if (['og:url', 'og:image'].includes(property)) expect(/^https:\/\//.test(value), `${page.file}: ${property} no es absoluto`);
  }
  for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    const value = meta(html, 'name', name);
    expect(Boolean(value), `${page.file}: falta ${name}`);
    if (name === 'twitter:image') expect(/^https:\/\//.test(value), `${page.file}: ${name} no es absoluto`);
  }

  const jsonLdBlocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of jsonLdBlocks) {
    try { JSON.parse(block[1]); }
    catch (error) { failures.push(`${page.file}: JSON-LD inválido: ${error.message}`); }
  }

  if (!page.home) {
    expect(/href=["'](?:\/|https:\/\/www\.vitairos\.com\/?)["']/i.test(html), `${page.file}: falta enlace de retorno a VITAIROS`);
  }
}

const homepage = read('index.html');
expect(homepage.includes('<h1 id="heroTitle">Hacemos que la IA funcione <span>dentro de tu organización.</span></h1>'), 'Homepage: el H1 aprobado cambió');
expect(!homepage.includes('>Conocer iniciativa</a>'), 'Homepage: persiste anchor genérico “Conocer iniciativa”');
for (const expected of [
  ['/vitairos-m/', 'Conocer VITAIROS-M'],
  ['/vitairos-industrial-ai/', 'Conocer Industrial AI'],
  ['/agro-intelligence/', 'Conocer Agro Intelligence'],
  ['/conecta/', 'Conocer VITAIROS Conecta'],
]) {
  expect(homepage.includes(`href="${expected[0]}"`) && homepage.includes(`>${expected[1]}</a>`), `Homepage: falta enlace descriptivo ${expected[1]}`);
}

const homepageSchema = JSON.parse(homepage.match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i)?.[1] || '{}');
const graph = homepageSchema['@graph'] || [];
const organization = graph.find((item) => item['@type'] === 'Organization');
const website = graph.find((item) => item['@type'] === 'WebSite');
const service = graph.find((item) => item['@type'] === 'Service');
expect(organization?.['@id'] === 'https://www.vitairos.com/#organization', 'Homepage: Organization @id incorrecto');
expect(organization?.sameAs?.includes('https://www.linkedin.com/company/vitairos/'), 'Homepage: LinkedIn canónico ausente de sameAs');
expect(organization?.sameAs?.includes('https://www.instagram.com/vitairos_com'), 'Homepage: Instagram canónico ausente de sameAs');
expect(website?.['@id'] === 'https://www.vitairos.com/#website', 'Homepage: WebSite @id incorrecto');
expect(service?.provider?.['@id'] === organization?.['@id'], 'Homepage: Service provider no enlaza a Organization');
expect(Array.isArray(service?.areaServed) && service.areaServed.includes('Chile'), 'Homepage: Service areaServed no incluye Chile');
expect(Array.isArray(service?.serviceType) && service.serviceType.length >= 3, 'Homepage: Service serviceType incompleto');

const sitemap = read('sitemap.xml');
const requiredLocations = [
  'https://www.vitairos.com/',
  'https://www.vitairos.com/vitairos-m/',
  'https://www.vitairos.com/vitairos-industrial-ai/',
  'https://www.vitairos.com/agro-intelligence/',
  'https://www.vitairos.com/conecta/',
  'https://www.vitairos.com/bastian-lisperguer/',
];
for (const location of requiredLocations) expect(sitemap.includes(`<loc>${location}</loc>`), `Sitemap: falta ${location}`);
expect(/<loc>https:\/\/www\.vitairos\.com\/<\/loc>\s*<lastmod>2026-10-13<\/lastmod>/.test(sitemap), 'Sitemap: lastmod de homepage no es 2026-10-13');
expect((sitemap.match(/<url>/g) || []).length === (sitemap.match(/<\/url>/g) || []).length, 'Sitemap: bloques url desbalanceados');
expect((sitemap.match(/<loc>/g) || []).length === new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])).size, 'Sitemap: URLs duplicadas');

const robots = read('robots.txt');
expect(/User-agent:\s*\*\s*Allow:\s*\//i.test(robots), 'robots.txt: no permite indexación pública');
expect(robots.includes('Sitemap: https://www.vitairos.com/sitemap.xml'), 'robots.txt: falta sitemap canónico');
expect(!/Disallow:\s*\/(?:\s|$)/i.test(robots), 'robots.txt: bloquea el sitio completo');

const ogImage = fs.readFileSync(path.join(root, 'assets', 'vitairos-open-graph-1200x630.png'));
expect(ogImage.subarray(1, 4).toString('ascii') === 'PNG', 'Open Graph: el asset no es PNG');
expect(ogImage.readUInt32BE(16) === 1200 && ogImage.readUInt32BE(20) === 630, 'Open Graph: dimensiones distintas de 1200×630');

if (failures.length) {
  console.error('Production SEO QA failures:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Production SEO QA: OK (${pages.length} páginas, ${requiredLocations.length} URLs en sitemap, OG 1200×630).`);
