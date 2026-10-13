# VITAIROS Home V3.2.1 — Release Candidate

Validation date: 2026-10-13

Branch: `homepage-v2-ai-positioning`

Release commit: `f0482a62d7388eeb342bb46157d1c768e36e16f5` (`f0482a6`)

Release commit message: `Finalize VITAIROS homepage V3.2.1 premium polish`

## Release state

- The release commit contains the intended V3.2/V3.2.1 source, QA scripts and approved preview artifacts only.
- The release commit was pushed only to `origin/homepage-v2-ai-positioning`.
- GitHub confirms the remote branch points to the full release SHA above.
- `main` was not modified, merged, or pushed.
- Production, DNS, domain and Cloudflare configuration were not modified.
- The connected `Workers Builds: vitairosspaweb` check completed with `failure` at `2026-10-13T22:28:30Z`.
- Cloudflare created no deployment and exposed no remote preview URL. Its dashboard also failed to load its own authenticated UI assets during read-only inspection, so no build log was available without changing or retrying infrastructure.

Preview URL: **NOT AVAILABLE — Cloudflare Workers build failed; no deployment was created.**

## Automated QA completed locally

All available suites passed against `http://127.0.0.1:4173/` after the release fixes:

- `node tests/homepage-smoke.mjs`
- `node tests/homepage-v3-2-1-qa.cjs`
- `node tests/homepage-browser-qa.cjs`
- `node tests/homepage-microfix-qa.cjs`
- `node tests/homepage-release-candidate-qa.cjs`
- `node tests/homepage-resource-budget.cjs`

The eight required viewports passed without horizontal overflow, broken images, duplicate IDs, console errors or route failures:

`1920x1080`, `1440x900`, `1366x768`, `1024x768`, `768x1024`, `430x932`, `390x844`, `360x800`.

## Brand intro

Local browser evidence confirms:

- First visit runs one intro sequence and resolves to the homepage.
- Refresh and second visit in the same session skip the intro through `sessionStorage` key `vitairos_intro_seen`.
- A new browser session runs the intro again.
- `prefers-reduced-motion: reduce` bypasses the animated intro.
- Desktop and mobile viewports resolve without persistent white screen, double logo or measured overflow.

Remote first-load, cache and layout-shift validation is **PENDING** because no remote preview exists. Safari/iOS status: **PENDING REAL DEVICE TEST**. Playwright WebKit is not installed in the validation environment and was not downloaded as a new dependency.

## Forms and lead separation

One release bug was corrected before the release commit: the form now includes and synchronizes an explicit hidden `lead_type`.

### Commercial path

Controlled browser submission was intercepted before external transmission and confirmed:

- `lead_type=commercial`
- subject `Nuevo diagnóstico de oportunidad VITAIROS`
- opportunity, context, stage, name, company, email and phone are included
- invalid step 1 remains visible and blocks progression
- `?sent=1#gracias` hides the form and shows the confirmation state

### Careers path

Controlled browser submission was intercepted before external transmission and confirmed:

- `lead_type=careers`
- subject `Interés laboral o de colaboración VITAIROS`
- the commercial stage step is skipped
- no `etapa` field is transmitted
- opportunity, context, name, company, email and phone are included

No email was sent because external form transmission was not authorized. FormSubmit resolved with HTTP 200 on a read-only GET.

### Manual FormSubmit protocol

1. Open the eventual branch preview in a new private session and keep DevTools Network open.
2. Complete the commercial path with approved QA contact data and a unique subject marker.
3. Before submitting, verify `lead_type=commercial`; submit once; verify the POST succeeds, the recipient receives the expected field set, and `_next` resolves to `/?sent=1#gracias`.
4. Start a fresh private session and complete `Trabaja con nosotros` with a second approved QA marker.
5. Verify `lead_type=careers`, the career subject, and absence of `etapa`; submit once and verify receipt/redirect.
6. Confirm no duplicate message was created by back/refresh and delete the two QA messages after evidence capture.

## Lighthouse and WebPageTest

Lighthouse: **NOT RUN — remote preview unavailable.** The required thresholds (Performance ≥ 90; Accessibility, Best Practices and SEO ≥ 95) and remote LCP/CLS/INP or TBT remain unverified. Localhost results were deliberately not substituted.

WebPageTest: **NOT RUN — remote preview unavailable.** Remote CDN caching, compression, protocol, waterfall and repeat-view behavior remain unverified.

Local network inspection found no initial-load third-party request. Canvas animation is code-generated, pauses when out of view/document-hidden and is disabled for reduced motion. The news JSON is the only fetch. FormSubmit and social/evidence origins are reached only after explicit user action.

## Performance budget

Measured as decoded local response bodies after a full-page pass; these are not compressed remote transfer sizes:

| Category | Bytes | Approx. KiB |
| --- | ---: | ---: |
| HTML | 36,485 | 35.63 |
| CSS | 74,027 | 72.29 |
| JavaScript | 29,513 | 28.82 |
| Images and SVG | 152,210 | 148.64 |
| Fonts | 110,884 | 108.29 |
| JSON/fetch | 2,535 | 2.48 |
| **Total** | **405,654** | **396.15** |

Observed initial resources: 9; third-party initial requests: 0; new dependencies: 0. Remote compression and cache headers are pending WebPageTest/preview validation.

## Accessibility

Local checks passed for semantic landmarks, one H1, heading order, duplicate IDs, labels, empty/placeholder links, broken fragments, keyboard-operable controls, menu/modal focus behavior, escape/close behavior and reduced motion. The honeypot control is removed from the accessibility tree with `aria-hidden="true"` while remaining non-focusable.

Remote Lighthouse accessibility and manual VoiceOver on iOS/Safari remain pending. No claim is made for unmeasured remote contrast or screen-reader behavior.

## Links and SEO

- Internal project routes: 4/4 returned 200 locally.
- Portal Minero evidence: 200 after one canonical redirect.
- Duoc UC LinkedIn evidence: 200.
- Instagram: 200.
- Marga Marga Online returned 403 to the automated client; VITAIROS LinkedIn returned 999 anti-bot. Neither produced a 404 or redirect loop; both require normal-browser spot checks.
- No empty links, placeholder links, broken fragments or 404 responses were observed.
- Title, description, canonical, robots, Open Graph, Twitter Card and JSON-LD are present and parse successfully.
- Full SEO input: `docs/SEO_FINAL_AUDIT_INPUT.md`.

## Privacy and security

- The privacy modal discloses that FormSubmit processes the diagnostic data and provides a rights/contact address.
- Form fields and stated processing purpose are consistent.
- A repository scan found no common private-key/API-secret patterns.
- No credentials, secrets or personal test data were added.
- No external form submission was performed.

## Known issues and pending validations

1. Cloudflare Workers build failed and produced no preview URL; build log unavailable through the failing dashboard UI.
2. Remote intro/cache/layout-shift validation is pending.
3. **PENDING REAL DEVICE TEST** for Safari/iOS.
4. Controlled end-to-end FormSubmit email delivery is pending authorization.
5. Remote Lighthouse and WebPageTest are pending.
6. Marga Marga Online and VITAIROS LinkedIn require normal-browser spot checks due to bot protection.
7. Production sitemap `lastmod` should be set to the actual publication date during the eventual release.

## Decision

**NO-GO for production at this time.** The implementation passes all available local source, interaction, responsive, form-separation, accessibility-structure and resource-budget checks. Production promotion must wait for a working isolated remote preview and completion of the remote intro, Lighthouse, network, Safari/iOS and authorized FormSubmit validations.

Recommended next step: repair or provision preview-only Cloudflare infrastructure without changing production, rerun this checklist against the exact preview SHA, then issue a new GO/NO-GO decision.
