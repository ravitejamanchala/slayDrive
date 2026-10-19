# SlayDrive

An editorial-style, responsive marketing website for the SlayDrive driving simulator and learning platform. £4.99/month membership messaging covers unlimited mock tests, different location maps, Highway Code lessons and road puzzles.

## Develop

Requires Node.js 22.12+ (validated with Node 24.19) and npm.

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

In the Codex cloud workspace, use `npm ci --cache /workspace/.npm-cache` if the default npm cache is not writable. This task is already isolated; work in the existing checkout rather than creating a worktree.

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

`dist/` is the complete static production site. No application secrets or backend are required. Fonts are self-hosted. There are no analytics, cookies, payment forms or account integrations.

## Content and design

- `index.html`: homepage copy, price, contact details, inline artwork and structured data.
- `src/style.css`: responsive design, typography, motion and guide page layouts.
- `src/main.js`: accessible navigation, three educational demo questions, privacy dialog and scroll reveals.
- `scripts/generate-guides.mjs`: source content and shared template for four static guides. Run `node scripts/generate-guides.mjs` after editing it, then build. Generated HTML is checked in so development and builds do not require a generation step.
- `public/`: favicon, social image, sitemap, robots policy and Cloudflare response headers.
- `vite.config.js`: the five static page entry points.

The homepage demo is three standalone learning questions, not the actual simulator. The illustrations are original conceptual graphics, not tool screenshots or confirmed playable maps. Quiz explanations reference Highway Code rules 125, H2 and 227; recheck against the official current source when maintaining the questions.

The original manchala.co.uk reference URL was inaccessible from this environment. Copy is based on the owner's confirmed feature list, price and contact details. No pass rates, testimonials, endorsements, launch dates, cancellation policy or named playable maps are invented.

## Cloudflare Pages deployment

Published on 19 October 2026 to the **slaydrive** Cloudflare Pages project using Direct Upload. Production site: **https://slaydrive.pages.dev/**. The homepage, four guides, main JavaScript, sitemap, social image and custom 404 response were verified over HTTPS.

Production domains are `https://slaydrive.com` and `https://www.slaydrive.com`. The latter redirects to the apex domain.

### Automatic deployment from GitHub

The complete website source and content live in `ravitejamanchala/slayDrive`. Every push to `main` runs `.github/workflows/deploy.yml`: install dependencies, build and run browser tests, then deploy `dist/` to the existing Cloudflare Pages project `slaydrive`. The workflow can also be run manually in GitHub Actions.

Set these GitHub Actions secrets in the `cloudflare` environment before the first deployment:

- `CLOUDFLARE_API_TOKEN`: a Cloudflare API token with Account / Cloudflare Pages / Edit permission for the hosting account.
- `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account ID.

Never commit credentials. The existing Pages project remains a Direct Upload project; GitHub Actions performs the upload after testing. No project recreation or DNS change is needed. Failed tests stop deployment and leave the live site on its previous version.

Host the actual tool separately on the chosen subdomain. When that address is confirmed and working, add an explicit tool link to the main navigation and membership section. Current membership buttons open `info@slaydrive.com`; they do not take payments or register accounts.

After domain activation, verify the five pages, headers, redirects and contact links at the custom domain, then submit `https://slaydrive.com/sitemap.xml` to Google Search Console. The actual service still needs operator privacy details and subscription terms before taking payments. Structured data is accurate product metadata, not a guarantee of rich results or search rankings.

Cloudflare Pages serves the directory-based guides directly. `_headers` sets security headers and immutable caching only for fingerprinted assets. Pages preview deployments should retain Cloudflare's default search-engine exclusion. Do not copy a preview `noindex` policy to the live domain.

## Review

The development server and production build are independently checked. Browser validation covers mobile layouts, navigation, all three quiz answers and explanations, keyboard tabs, FAQs, the privacy dialog, guide pages and local links. The tool itself and subscription billing are outside this marketing-site repository.

Run the browser checks with `npm test` after installing a Playwright Chromium browser (`npx playwright install chromium`). In this cloud environment, Chromium is already available, so use:

```sh
SLAYDRIVE_CHROMIUM_PATH=/usr/bin/chromium npm test
```

Automated accessibility checks use axe-core against WCAG A/AA criteria; they complement manual review and do not certify full accessibility compliance. Layout checks cover widths from 320 to 1440 pixels. The test suite also applies the production Content Security Policy during a functional browser check.

## Tool demo video (preview)

`public/media/driving-demo.mp4` is a silent 12-second recording of the free controlled-stop practice lesson from `ravitejamanchala/cambridge-learner-driv`, branch `recovery/stripe-subscriptions-2026-10-15`, commit `d28a646a9a11d5c8d19e2dfa969612da60b97665`. Captured locally with automated steering/throttle inputs through the app’s existing recording hooks. No paid access or live account was used. The source tool was not modified. The video includes its on-screen OpenStreetMap attribution; captions and an adjacent description explain the demonstration. The player does not autoplay and loads the video only on demand. The marketing preview uses this branch’s blue/teal palette and Fredoka/Geist fonts.
