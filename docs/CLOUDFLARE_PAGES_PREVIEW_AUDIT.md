# VITAIROS — Cloudflare preview audit

Audit date: 2026-10-13

Target branch: `homepage-v2-ai-positioning`

Approved homepage release commit: `f0482a62d7388eeb342bb46157d1c768e36e16f5`

Current branch documentation commit: `6a3dafe8dbd45b2c7f3854bad8a54fcc04ad50b8`

## Outcome

**NO-GO under the current safety boundary.** The authenticated Cloudflare dashboard proves that `VITAIROSSPAWEB` is deployed as a **Cloudflare Worker with static assets**, not as a Cloudflare Pages project. No Cloudflare Pages project connected to `bastianaguayolisperguer/VITAIROSSPAWEB` exists in the account.

Obtaining the requested `pages.dev` branch preview would require creating a new Pages project. The available alternative, Worker Previews, is a different product path and requires a one-way change to the existing Worker's preview workflow. Neither action is permitted by the current instruction, which prohibits new infrastructure or any change with possible present or future cost.

## Safety result

No change was made to Cloudflare, GitHub, `main`, production, DNS, custom domains, billing, plan, build settings, Worker settings, or the frozen homepage source. In particular:

- Worker Previews was not enabled.
- No Pages project was created.
- No deployment, retry, push, or build was triggered.
- No payment method, trial, upgrade, paid feature, route, domain, binding, namespace, container, or other infrastructure was added.
- At the time of this audit, the report was kept local and uncommitted so that documenting it did not trigger another remote build. It may be included later in an explicitly authorized production release.

## Authenticated Cloudflare inventory

The account is currently labelled `Free`. The Workers & Pages dashboard showed `5 / 3000` Workers build minutes used in the current month at inspection time.

| Application | Cloudflare product evidenced | Connected repository / URL | Relevance |
| --- | --- | --- | --- |
| `vitairosspaweb` | Worker with static assets | `bastianaguayolisperguer/VITAIROSSPAWEB`; `www.vitairos.com`; `vitairosspaweb.bastianaguayolisperguer.workers.dev` | Current VITAIROS production service |
| `abogados-puerto-varas` | Pages | `abogados-puerto-varas.pages.dev` | Unrelated project |
| `vitairosweb` | Pages | `vitairosweb.pages.dev`; repository `bastianaguayolisperguer/VITAIROSWEB` | Different, older repository |

The authenticated inventory therefore rules out an existing Pages project for `VITAIROSSPAWEB` under another name.

## Existing production service

| Field | Observed value |
| --- | --- |
| Product type | Cloudflare Worker with static assets |
| Worker name | `vitairosspaweb` |
| Git repository | `bastianaguayolisperguer/VITAIROSSPAWEB` |
| Production branch | `main` |
| Production custom domain | `www.vitairos.com` |
| Workers.dev domain | `vitairosspaweb.bastianaguayolisperguer.workers.dev` |
| Last successful production commit | `676fc3080ec549129e5ea12f90af4fb885d6fd03` |
| Successful production Version ID | `71e2990a-2709-480e-afc8-dbd2055bfe79` |
| Build command | None |
| Deploy command | `npx wrangler deploy` |
| Version command | `npx wrangler versions upload` |
| Root directory | `/` |
| Nonproduction branch builds | Enabled |
| Worker Previews | Disabled |

Cloudflare also states in the service settings that variables, bindings, Logpush, and Tail Consumers are unavailable for this Worker because it contains only static assets.

## Root cause

The preview branch is being processed by **Workers Builds**, not Cloudflare Pages. Its failed build used the configured nonproduction version command:

```text
npx wrangler versions upload
```

Wrangler then failed with:

```text
Missing entry-point to Worker script or to assets directory
```

The repository is a root-level static site and has no `wrangler.toml`, `wrangler.jsonc`, package manifest, Worker script entry point, or declared assets directory. By contrast, the successful `main` production build used `npx wrangler deploy`, where Cloudflare detected the existing Worker project.

The configured `wrangler versions upload` path is the older Version Preview workflow. Cloudflare's current branch-preview workflow is Worker Previews and uses `npx wrangler preview` plus an explicit Wrangler `previews` configuration. It does not produce a Cloudflare Pages `pages.dev` preview.

## Cost and reversibility gate

The following facts were checked against Cloudflare's official documentation:

- Workers Builds includes 3,000 build minutes per month on the Free plan; paid plans include 6,000 minutes and charge for additional minutes.
- Static asset requests are free and unlimited, while Worker script requests follow Workers pricing.
- Worker Previews is available on the Free plan with limits of 100 previews per Worker and 100 deployments per preview.
- Depending on configured bindings, previews can automatically provision isolated resources such as Durable Object namespaces or containers. This Worker currently has no bindings, but enabling previews changes the service workflow.
- For Workers connected before Worker Previews, enabling the feature is a **one-time switch that cannot be reversed**.

References:

- [Workers Builds limits and pricing](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)
- [Static Assets billing and limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)
- [Worker Previews](https://developers.cloudflare.com/workers/previews/)
- [Set up Worker Previews](https://developers.cloudflare.com/workers/previews/get-started/)
- [Compare preview workflows](https://developers.cloudflare.com/workers/previews/compare-workflows/)
- [Build branches and the one-time switch](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/)

Although the account is currently on Free and the documented preview limits include a Free tier, enabling Worker Previews would be an irreversible change to the production service's connected-build workflow. Creating a Pages project would be new infrastructure. Both are outside the approved boundary, so the audit stopped before either action.

## Technically available paths — not executed

### A. Keep Workers and adopt Worker Previews

This would require explicitly enabling Worker Previews on `vitairosspaweb`, adding a correct Wrangler configuration for static assets and previews, and changing the preview command to `npx wrangler preview`. It would produce a Worker preview URL, not a `pages.dev` URL. The switch is irreversible and was not authorized.

### B. Create an isolated Cloudflare Pages project

This would connect `bastianaguayolisperguer/VITAIROSSPAWEB` to a new Pages project, configure `main` as production and `homepage-v2-ai-positioning` as a preview branch, and leave custom domains and DNS untouched. It is the direct path to a `pages.dev` preview, but it is new infrastructure and was explicitly prohibited.

## Public endpoint evidence

| Endpoint | Result |
| --- | --- |
| `https://www.vitairos.com/` | 200 through Cloudflare |
| `https://vitairos.com/` | 301 to `https://www.vitairos.com/` |
| `https://bastianaguayolisperguer.github.io/VITAIROSSPAWEB/` | 200 from the separate GitHub Pages deployment |
| `https://vitairosspaweb.pages.dev/` | DNS name does not exist |
| `https://homepage-v2-ai-positioning.vitairosspaweb.pages.dev/` | DNS name does not exist |

## Validation status

| Check | Status |
| --- | --- |
| Production integrity | Preserved; no mutation performed |
| Branch preview deployment | Not available |
| Preview URL | Not available |
| Remote smoke test | Not executable without a preview URL |
| Brand intro test | Not executable remotely |
| Diagnostic overlay test | Not executable remotely |
| Lighthouse | Not executed against a nonexistent preview |
| Safari / iOS | Not executed against a nonexistent preview |

## Decision

**NO-GO FOR SEO FINAL.** The requested Cloudflare Pages preview cannot be validated under the current no-new-infrastructure and no-cost-ambiguity constraint. Production remains intact. A later implementation requires an explicit architectural choice and authorization after reviewing the implications: either the irreversible Worker Previews migration on the existing service, or a new isolated Pages project.
