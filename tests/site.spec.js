import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";

const guides = [
  "/practice-between-driving-lessons/",
  "/driving-practice-without-a-car/",
  "/mock-driving-tests/",
  "/highway-code/",
  "/driving-simulator/",
  "/driving-puzzles/",
];

test('garage selection updates the featured car', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', {name:'Preview Blue compact',exact:true}).click();
  await expect(page.locator('#selected-car-name')).toHaveText('Blue compact');
  await expect(page.locator('#selected-car-image')).toHaveAttribute('src', '/media/cars/car-compact.png');
  await expect(page.getByRole('button', {name:'Preview Blue compact',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#journey')).toHaveCount(0);
});

test("mobile navigation, FAQs and privacy dialog work", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: /The experience/ })
    .click();
  await expect(page.locator("#mobile-nav")).toBeHidden();
  await expect(page).toHaveURL(/#experience$/);
  await page
    .locator("summary")
    .filter({ hasText: "Are the mock tests really unlimited?" })
    .click();
  await expect(page.locator("details[open]")).toContainText("free until 1 December 2026");
  await page.getByRole("button", { name: "Privacy", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.goto("/#privacy");
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("all pages have unique SEO metadata, valid local links and no horizontal overflow", async ({
  page,
  request,
}) => {
  const titles = new Set();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of ["/", ...guides]) {
    const response = await page.goto(path);
    expect(response.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    titles.add(await page.title());
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://slaydrive.com${path}`,
    );
    expect(
      (await page.locator('meta[name="description"]').getAttribute("content"))
        .length,
    ).toBeGreaterThan(90);
    for (const ld of await page
      .locator('script[type="application/ld+json"]')
      .allTextContents())
      expect(JSON.parse(ld)["@context"]).toBe("https://schema.org");
    await expect(page.locator("body")).not.toContainText(
      /coming soon|launching soon|early access/i,
    );
    const links = await page
      .locator('a[href^="/"]')
      .evaluateAll((els) => [
        ...new Set(els.map((el) => el.getAttribute("href").split("#")[0])),
      ]);
    for (const link of links)
      expect((await request.get(link || "/")).status()).toBe(200);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${path} at ${width}px`,
      ).toBe(true);
    }
  }
  expect(titles.size).toBe(guides.length + 1);
  expect(errors).toEqual([]);
});

test("homepage and guide pass automated WCAG AA checks", async ({ page }) => {
  for (const path of ["/", "/highway-code/"]) {
    await page.goto(path);
    await page.evaluate(() =>
      document
        .querySelectorAll(".reveal")
        .forEach((el) => el.classList.add("is-visible")),
    );
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  }
});

test("production CSP permits page scripts, fonts and garage selection", async ({
  page,
}) => {
  const csp = readFileSync("public/_headers", "utf8")
    .split("\n")
    .find((line) => line.includes("Content-Security-Policy:"))
    .split("Content-Security-Policy: ")[1];
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.route("**/*", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), "content-security-policy": csp },
    });
  });
  await page.goto("/");
  await page.getByRole('button', {name:'Preview Blue compact',exact:true}).click();
  await expect(page.locator('#selected-car-name')).toHaveText('Blue compact');
  await expect(page.locator('#garage-simulator canvas')).toHaveAttribute('data-car', 'compact', {timeout:15000});
  await expect(page.locator('.sim-status')).toBeHidden();
  await page.getByRole('button', {name:'Preview Police car',exact:true}).click();
  await expect(page.locator('#garage-simulator canvas')).toHaveAttribute('data-car', 'police', {timeout:15000});
  expect(errors).toEqual([]);
});

test('reduced-motion hero stays static and supports buttons and keyboard browsing', async ({ page }) => {
  await page.goto('/');
  const hero=page.getByRole('region',{name:/Desktop app previews/});
  await expect(hero.locator('video')).toHaveCount(2);
  await expect(hero.locator('video[src]')).toHaveCount(0);
  await expect(hero.getByRole('button',{name:'Play hero motion',exact:true})).toBeVisible();
  await expect(hero.locator('[data-hero-screen="chase"]')).toBeVisible();
  await hero.focus();await page.keyboard.press('ArrowRight');
  await expect(hero.locator('[data-hero-screen="cockpit"]')).toBeVisible();
  await hero.getByRole('button',{name:'My routes',exact:true}).click();
  await expect(hero.locator('[data-hero-screen="my-routes"]')).toBeVisible();
  await expect.poll(()=>hero.locator('[data-hero-screen="my-routes"] img').evaluate(img=>img.complete&&img.naturalWidth===1600)).toBe(true);
  await page.keyboard.press('Home');await expect(hero.locator('[data-hero-screen="chase"]')).toBeVisible();
  const sections=await page.locator('main > section').evaluateAll(els=>els.slice(0,3).map(el=>el.id||'hero'));
  expect(sections).toEqual(['hero','experience','perspective']);
  for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.evaluate(()=>{scrollTo(0,0);document.activeElement?.blur();});await page.mouse.move(0,0);await page.screenshot({path:`test-results/hero-${width}.png`});}
});

test('car collection scrolls one card with keyboard and supports dragging', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  const track = page.locator('.car-collection');
  await track.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => track.evaluate(el => el.scrollLeft)).toBeGreaterThan(30);
  await page.keyboard.press('Home');
  await expect.poll(() => track.evaluate(el => el.scrollLeft)).toBe(0);
  const box = await track.boundingBox();
  await page.mouse.move(box.x + 300, box.y + 100);
  await page.mouse.down();
  await page.mouse.move(box.x + 80, box.y + 100, {steps:8});
  await page.mouse.up();
  await expect.poll(() => track.evaluate(el => el.scrollLeft)).toBeGreaterThan(30);
});


test('SEO guides are in the sitemap and subscriptions open the app', async ({ page, request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const path of ['/', ...guides]) expect(sitemap).toContain(`<loc>https://slaydrive.com${path}</loc>`);
  await page.goto('/');
  await expect(page.locator('.pricing-card .button')).toHaveAttribute('href', 'https://app.slaydrive.com/');
  await expect(page.locator('.practice-options')).toContainText('cannot replace supervised on-road experience');
});

test('free offer is explicit, has no beta wording and links to the current app',async({page})=>{
 for(const url of ['/',...guides]){
  await page.goto(url);await expect(page.locator('body')).not.toContainText(/beta|experimental|£4\.99/i);
  await expect(page.locator('body')).toContainText('No card required');
  const launch=page.locator('a[href="https://app.slaydrive.com/"]');expect(await launch.count()).toBeGreaterThan(0);
 }
 await page.goto('/');const structured=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());const offer=structured['@graph'].find(n=>n['@type']==='SoftwareApplication').offers;
 expect(offer.price).toBe('0');expect(offer.priceValidUntil).toBe('2026-11-30');
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});await page.locator('#next').scrollIntoViewIfNeeded();await page.waitForTimeout(500);await page.screenshot({path:`test-results/free-offer-${width}.png`});
 }
});

test('one preview gallery loads all five real captures and fits mobile',async({page})=>{
 await page.goto('/');
 const hero=page.getByRole('region',{name:/Desktop app previews/});
 await expect(page.locator('.screen-gallery')).toHaveCount(0);
 for(const [name,id] of [['Chase view','chase'],['Driver view','cockpit'],['Courses','courses'],['Mock tests','mock-tests'],['My routes','my-routes']]){
  await hero.getByRole('button',{name,exact:true}).click();
  const panel=hero.locator(`[data-hero-screen="${id}"]`);await expect(panel).toBeVisible();
  await expect.poll(()=>panel.locator('img').evaluate(img=>img.complete&&img.naturalWidth===Number(img.getAttribute('width')))).toBe(true);
  await expect(hero.locator('figure:visible')).toHaveCount(1);
 }
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});

test('learner simulator search metadata matches visible features without invented rankings',async({page})=>{
 await page.goto('/');await expect(page).toHaveTitle('Online UK Learner Driving Simulator | Try Free | SlayDrive');
 await expect(page.locator('meta[name="description"]')).toHaveAttribute('content',/courses, mock driving tests, free drive and routes you create/);
 await expect(page.locator('body')).not.toContainText(/UK.s (?:No\.?\s?1|number one)|guaranteed pass|Open the app and subscribe/i);
 const graph=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())['@graph'];
 const software=graph.find(n=>n['@type']==='SoftwareApplication');expect(software.screenshot).toHaveLength(5);expect(software.aggregateRating).toBeUndefined();
 await page.goto('/driving-simulator/');await expect(page.getByRole('heading',{name:'How to choose the best learner driving simulator for you',exact:true})).toBeVisible();
 await expect(page.locator('article')).toContainText('Clearing browser storage');
});


test('Terms of Use is linked, crawlable and clear about free access and user rights',async({page,request})=>{
 await page.goto('/');await page.getByRole('link',{name:'Terms of Use',exact:true}).click();
 await expect(page).toHaveURL(/\/terms-of-use\/$/);await expect(page.locator('h1')).toHaveText('Terms of Use');
 await expect(page.locator('main')).toContainText('1 December 2026 at 00:00 UK time');
 await expect(page.locator('main')).toContainText('does not automatically cancel');
 await expect(page.locator('main')).toContainText('statutory consumer rights');
 for(const width of [320,390,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 expect(await (await request.get('/sitemap.xml')).text()).toContain('<loc>https://slaydrive.com/terms-of-use/</loc>');
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(results.violations).toEqual([]);
});

test('hero plays only the selected loop, pauses and supports swipe without opening an image',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.goto('/');const hero=page.locator('.desktop-hero');
 await hero.scrollIntoViewIfNeeded();await page.mouse.move(0,0);
 const chase=hero.locator('[data-hero-screen="chase"] video');
 await expect.poll(()=>chase.evaluate(v=>v.currentTime)).toBeGreaterThan(0.1);
 expect(await chase.evaluate(v=>[v.videoWidth,v.videoHeight])).toEqual([1920,1200]);
 await expect(hero.locator('[data-hero-screen="cockpit"] video')).not.toHaveAttribute('src');
 // The slideshow advances without user input; then manual navigation stops rotation.
 await expect(hero.locator('[data-hero-screen="cockpit"]')).toBeVisible({timeout:12000});
 expect(await chase.evaluate(v=>v.paused)).toBe(true);
 await hero.getByRole('button',{name:'Pause hero motion',exact:true}).click();
 expect(await hero.locator('video').evaluateAll(vs=>vs.every(v=>v.paused))).toBe(true);
 await hero.getByRole('button',{name:'Play hero motion',exact:true}).click();
 const cockpit=hero.locator('[data-hero-screen="cockpit"] video');
 await expect.poll(()=>cockpit.evaluate(v=>v.paused)).toBe(false);
 await expect.poll(()=>cockpit.evaluate(v=>[v.videoWidth,v.videoHeight])).toEqual([1920,1200]);
 await page.locator('#perspective').scrollIntoViewIfNeeded();
 await expect.poll(()=>cockpit.evaluate(v=>v.paused)).toBe(true);
 await page.setViewportSize({width:390,height:844});
 await hero.locator('[data-hero-screen="cockpit"] .hero-media').scrollIntoViewIfNeeded();
 const box=await hero.locator('[data-hero-screen="cockpit"] .hero-media').boundingBox();
 await page.mouse.move(box.x+box.width-30,box.y+60);await page.mouse.down();
 await page.mouse.move(box.x+30,box.y+60,{steps:8});await page.mouse.up();
 await expect(hero.locator('[data-hero-screen="courses"]')).toBeVisible();
 expect(page.context().pages()).toHaveLength(1);
 await expect(hero).toHaveAttribute('data-rotating','false');
});

test('data-saving browsers get static previews and lightweight access messaging',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true}));
 const media=[];page.on('request',r=>{if(/-loop(?:-hd)?\.(mp4|gif)/.test(r.url()))media.push(r.url());});
 await page.goto('/');await page.locator('.desktop-hero').scrollIntoViewIfNeeded();
 await expect(page.getByRole('button',{name:'Play hero motion',exact:true})).toBeVisible();
 expect(media).toEqual([]);
 await expect(page.locator('.hero-description')).toContainText('Lightweight driving practice');
 await expect(page.getByRole('heading',{name:'Built for everyday browsers.'})).toBeVisible();
});
