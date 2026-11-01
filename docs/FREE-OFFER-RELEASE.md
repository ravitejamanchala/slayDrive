# Free access until December

The offer ends as December begins: **1 December 2026, 00:00 UK time**. Home-page navigation, hero, offer card, FAQs, guide pages and structured metadata now advertise free access with no card required. There is no beta or experimental wording on the marketing site. App links now point to https://app.slaydrive.com/.

The existing page layout, colors, fonts and assets are retained. Structured offer metadata expires on 30 November. Signing up does not start a paid subscription. When the campaign ends, remove or replace this offer before another production publish; the live-offer check deliberately rejects an expired offer.

Publish only after the simulator API grants the matching free access and the simulator release is ready. The production workflow checks the live app's public configuration and API offer before publishing; it never reads or emits private keys. The separate PR workflow deploys only a `pr-N.slaydrive.pages.dev` preview.

Local validation: production Vite build and nine Playwright tests passed. Checks include navigation, responsive layouts from 320 to 1440px, WCAG AA scans, current app links, offer metadata, and absence of beta/paid-price copy. Screenshots are in `docs/evidence/free-offer/`. No production deployment was performed as part of implementation.
