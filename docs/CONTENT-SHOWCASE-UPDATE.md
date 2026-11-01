# Current simulator showcase and search content

The marketing site now describes the current Course, Mock test, Free drive and My routes flow. Road challenges are presented as lessons within Course. New copy explains driver/chase/overhead views, compatible gamepad and touch controls, optional voice guidance, the first-use tour, account progress and feedback. Custom route storage is explicitly local to the browser; generated road detail and official-route limitations are explained beside the feature.

The existing fonts, palette, car gallery and mobile demo remain. Four new 1600 × 1000 desktop screenshots are available in an accessible tabbed gallery, with full-size links, alt text and OpenStreetMap attribution. Combined JPEG size is about 590 KB, with lazy loading and explicit dimensions. No image-generation service or retouching was used.

## Screenshot source

`public/media/current/provenance.json` records simulator commit `fbc2bc2465d43eefb260e341ec3afc86bbd08de3`, the merged production tour version. Captures use the actual application with isolated authentication/account fixtures and its bundled East Road map. They contain no real user account information. `scripts/capture-simulator.mjs` reproduces the captures against an installed simulator checkout.

## Search coverage

- Home title, description, Open Graph and Twitter metadata target UK learner driving simulator and free practice.
- The simulator guide addresses choosing the **best learner driving simulator for you**, features, controls and value for money. Its title and description match that content.
- Visible FAQs answer questions about local routes, mobile/controllers, value and starting free.
- SoftwareApplication structured data lists actual features and screenshots. No unsupported “UK’s No. 1”, awards, aggregate ratings, guaranteed-pass claims or keyword-stuffed tags were added.
- Existing guide URLs, canonical links and sitemap are preserved. Road-puzzle content now explains where to find the lessons.
- Free access still ends **1 December 2026 at 00:00 UK time**. No card required or automatic subscription. Stale “open the app and subscribe” copy is removed.

## Verification

The production build and 11 Playwright tests cover navigation, internal links, unique metadata, structured data, responsive layouts from 320–1440 px, gallery image loading and keyboard operation, the free offer, existing car/video interactions, production CSP and automated WCAG AA checks. Desktop and mobile gallery captures are in `docs/evidence/current-showcase/`.

These are local/browser checks; search indexing and ranking are not verified or promised. The production deployment safeguard remains in place and confirms the live app grants the advertised free access before publishing.
