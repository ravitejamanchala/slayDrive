import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";

const guides = [
  "/mock-driving-tests/",
  "/highway-code/",
  "/driving-simulator/",
  "/driving-puzzles/",
];

test("practice demo teaches the answer, resets between topics, and supports keyboard navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('[data-answer="0"]').click();
  await expect(page.locator("#quiz-feedback")).toContainText("Not quite");
  await expect(page.locator("#quiz-feedback")).toContainText("rule 125");
  await page.locator('[data-answer="1"]').click();
  await expect(page.locator("#quiz-feedback")).toContainText("That’s right");
  await page.getByRole("tab", { name: /Highway Code/ }).click();
  await expect(page.locator("#quiz-feedback")).toBeEmpty();
  await page.locator('[data-answer="0"]').click();
  await expect(page.locator("#quiz-feedback")).toContainText("rule H2");
  await page.getByRole("tab", { name: /Highway Code/ }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("tab", { name: /Road puzzles/ })).toBeFocused();
  await expect(page.getByRole("tab", { name: /Road puzzles/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.locator('[data-answer="1"]').click();
  await expect(page.locator("#quiz-feedback")).toContainText("rule 227");
  await expect(page.locator("#quiz-source")).toHaveAttribute(
    "href",
    /driving-in-adverse-weather/,
  );
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
    .getByRole("link", { name: /How it works/ })
    .click();
  await expect(page.locator("#mobile-nav")).toBeHidden();
  await expect(page).toHaveURL(/#journey$/);
  await page
    .locator("summary")
    .filter({ hasText: "Are the mock tests really unlimited?" })
    .click();
  await expect(page.locator("details[open]")).toContainText("£4.99/month");
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
  expect(titles.size).toBe(5);
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

test("production CSP permits page scripts, fonts and quiz interaction", async ({
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
  await page.locator('[data-answer="1"]').click();
  await expect(page.locator("#quiz-feedback")).toContainText("That’s right");
  expect(errors).toEqual([]);
});

test('hero carousel supports keyboard browsing and respects reduced motion', async ({ page }) => {
  await page.goto('/');
  const carousel = page.getByRole('region', { name: /App previews/ });
  const video = carousel.locator('video');
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  await carousel.focus();
  await page.keyboard.press('ArrowRight');
  await expect(carousel.locator('.hero-feedback')).toHaveAttribute('data-slot', 'center');
  await expect(carousel.locator('.hero-feedback img')).toHaveAttribute('src', '/media/police-garage.png');
  await expect.poll(() => video.evaluate(v => v.paused)).toBe(true);
  await page.keyboard.press('ArrowLeft');
  await expect(carousel.locator('.app-preview')).toHaveAttribute('data-slot', 'center');
  await expect(video.locator('source')).toHaveAttribute('src', '/media/compact-demo.mp4');
  await expect(page.locator('.collection-car')).toHaveCount(8);
});


test('car collection scrolls one card with keyboard and supports dragging', async ({ page }) => {
  await page.goto('/');
  const track = page.locator('.car-collection');
  await track.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => track.evaluate(el => el.scrollLeft)).toBeGreaterThan(100);
  await page.keyboard.press('Home');
  await expect.poll(() => track.evaluate(el => el.scrollLeft)).toBe(0);
  const box = await track.boundingBox();
  await page.mouse.move(box.x + 300, box.y + 100);
  await page.mouse.down();
  await page.mouse.move(box.x + 80, box.y + 100, {steps:8});
  await page.mouse.up();
  await expect.poll(() => track.evaluate(el => el.scrollLeft)).toBeGreaterThan(100);
});
