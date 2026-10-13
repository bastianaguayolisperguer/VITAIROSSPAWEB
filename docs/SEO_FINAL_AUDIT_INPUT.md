# VITAIROS Home V3.2.1 — SEO final audit input

Audit date: 2026-10-13

Release branch: `homepage-v2-ai-positioning`

Release commit: `f0482a62d7388eeb342bb46157d1c768e36e16f5`

## Scope and evidence

This is a technical SEO validation of the frozen V3.2.1 homepage. It does not introduce new positioning, copy, sections, keywords, or visual changes. Evidence comes from source inspection, the controlled local browser suite, the release-candidate QA script, and read-only HTTP checks of public destinations.

The Cloudflare Workers check for the release commit completed with `failure` and produced no deployment or preview URL. Remote-rendered SEO and a remote Lighthouse SEO score are therefore not available for this candidate.

## Crawl and index controls

| Check | Result | Evidence |
| --- | --- | --- |
| Document language | PASS | `<html lang="es">` |
| Robots meta | PASS | `index, follow` |
| Canonical | PASS | `https://www.vitairos.com/` |
| robots.txt | PASS | Allows general and named AI/user agents; declares the canonical sitemap |
| Sitemap | PASS WITH NOTE | Homepage and five project URLs are present; homepage `lastmod` is `2026-10-12`, one day before this RC validation |
| Preview noindex | NOT TESTED | No remote preview was created |

No source update was made to `sitemap.xml`: the release candidate is not production and design/content are frozen. The production release process should update the homepage `lastmod` to the actual publication date.

## Metadata and social sharing

| Check | Result |
| --- | --- |
| Unique title | PASS — `Inteligencia Artificial Aplicada para Empresas | VITAIROS` |
| Meta description | PASS — present and specific to diagnosis, pilot and integration |
| Open Graph title/description/type/url/image | PASS |
| Twitter card/title/description/image | PASS |
| Absolute canonical and social image URLs | PASS |
| Favicon and Apple touch icon | PASS locally |

The referenced Open Graph asset is `assets/vitairos-open-graph-1200x630.png`. Its remote response could not be checked because no RC preview exists.

## Structured data

The JSON-LD parses successfully and contains an `@graph` with:

- `Organization` for VITAIROS SpA, including canonical URL, logo, image, email, area served and social profiles.
- `WebSite` in Spanish linked to the organization.
- `Service` for applied AI, linked to the organization.

The controlled browser audit confirmed the organization node and Instagram profile. No schema changes were required.

## Content and semantics

| Check | Result |
| --- | --- |
| H1 count | PASS — exactly 1 |
| Heading hierarchy | PASS — no skipped levels detected |
| Duplicate IDs | PASS — none detected |
| Empty links | PASS — 0 |
| Placeholder links | PASS — 0 |
| Broken fragment anchors | PASS — 0 |
| Main/nav/footer landmarks | PASS |
| Unlabelled form controls | PASS — 0 |
| Evidence alt text in `data/news.json` | PASS — present for all three records |

## Link audit

| Destination | Result on 2026-10-13 | Interpretation |
| --- | --- | --- |
| `/vitairos-m/` | 200 local RC | PASS |
| `/vitairos-industrial-ai/` | 200 local RC | PASS |
| `/agro-intelligence/` | 200 local RC | PASS |
| `/conecta/` | 200 local RC | PASS |
| Portal Minero evidence | 200 after one canonical redirect | PASS |
| Marga Marga Online evidence | 403 to automated HTTP client | UNVERIFIED BY BOT; not a 404 or redirect loop |
| Duoc UC LinkedIn evidence | 200 | PASS |
| VITAIROS LinkedIn company | 999 anti-bot response | UNVERIFIED BY BOT; URL is non-empty and correctly formed |
| VITAIROS Instagram | 200 | PASS |
| FormSubmit endpoint | 200 on read-only GET | Endpoint resolves; no form was submitted |
| `mailto:contacto@vitairos.com` | Valid scheme/address syntax | PASS |

No destination returned 404, no empty or placeholder links were detected, and no redirect loop was observed. Bot-protected results must be spot-checked in a normal browser before production.

## Final SEO disposition

Technical SEO source validation: **PASS WITH CONDITIONS**. The source is internally consistent, but remote preview rendering, remote asset responses, preview indexing behavior, and Lighthouse SEO remain pending because the connected Cloudflare Workers build failed before creating a preview.
