import { expect, test, type Locator, type Page } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

function activeSlide(scope: Locator): Locator {
  return scope.locator('[data-slot="carousel-item"][data-active]');
}

/** Drag horizontally with the mouse across the carousel viewport. */
async function mouseDrag(page: Page, viewport: Locator, dx: number): Promise<void> {
  await viewport.scrollIntoViewIfNeeded();
  const box = await viewport.boundingBox();
  if (!box) throw new Error("no bounding box");
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x + (dx * i) / 10, y + i, { steps: 2 });
  await page.mouse.up();
}

/** Real touch gesture through Chromium's input pipeline (respects touch-action and scrolls the page). */
async function touchSwipe(page: Page, target: Locator, xDistance: number, yDistance: number): Promise<void> {
  const box = await target.boundingBox();
  if (!box) throw new Error("no bounding box");
  const x = Math.round(box.x + box.width / 2);
  const y = Math.round(box.y + Math.min(box.height / 2, 100));
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let i = 1; i <= 10; i++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x + (xDistance * i) / 10, y: y + (yDistance * i) / 10 }],
    });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

test.describe("Carousel", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "carousel");
  });

  test("renders an accessible carousel region with labelled slides", async ({ page }) => {
    const demo = preview(page, "carousel-demo");
    const region = demo.getByRole("region", { name: "Landscapes" });
    await expect(region).toHaveAttribute("aria-roledescription", "carousel");
    const slides = region.locator('[data-slot="carousel-item"]');
    await expect(slides).toHaveCount(6);
    await expect(slides.first()).toHaveAttribute("aria-roledescription", "slide");
    await expect(slides.first()).toHaveAttribute("aria-label", "1 of 6");
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "1 of 6");
    await expect(region.locator('[data-slot="carousel-viewport"]')).toHaveAttribute("aria-live", "polite");
  });

  test("previous and next buttons move between slides and wrap around", async ({ page }) => {
    const demo = preview(page, "carousel-demo");
    await demo.getByRole("button", { name: "Next slide" }).click();
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "2 of 6");
    await demo.getByRole("button", { name: "Previous slide" }).click();
    await demo.getByRole("button", { name: "Previous slide" }).click();
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "6 of 6");
  });

  test("arrow keys, Home and End work when the carousel is focused", async ({ page }) => {
    const demo = preview(page, "carousel-demo");
    const viewport = demo.locator('[data-slot="carousel-viewport"]');
    await viewport.focus();
    await page.keyboard.press("ArrowRight");
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "2 of 6");
    await page.keyboard.press("End");
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "6 of 6");
    await page.keyboard.press("Home");
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "1 of 6");
    await page.keyboard.press("ArrowLeft");
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "6 of 6");
  });

  test("clicking a side item brings it to the center without following its link", async ({ page }) => {
    const demo = preview(page, "carousel-demo");
    const url = page.url();
    await demo.getByRole("link", { name: "forest landscape" }).click();
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "2 of 6");
    expect(page.url()).toBe(url);
    // The centered item's link works.
    await demo.getByRole("link", { name: "forest landscape" }).click();
    await expect(page).toHaveURL(/#forest$/);
  });

  test("mouse drag changes slides and does not activate links", async ({ page, isMobile }) => {
    test.skip(isMobile, "mouse only");
    const full = preview(page, "carousel-full-width");
    const viewport = full.locator('[data-slot="carousel-viewport"]');
    const url = page.url();
    await mouseDrag(page, viewport, -300);
    await expect(activeSlide(full)).toHaveAttribute("aria-label", "2 of 4");
    expect(page.url()).toBe(url);
    await mouseDrag(page, viewport, 300);
    await expect(activeSlide(full)).toHaveAttribute("aria-label", "1 of 4");
  });

  test("links inside slides are clickable", async ({ page }) => {
    const full = preview(page, "carousel-full-width");
    await activeSlide(full).getByRole("link", { name: "Read more" }).click();
    await expect(page).toHaveURL(/#first-panel$/);
    await expect(full.getByRole("button", { name: "Get started" })).toBeVisible();
  });

  test("indicators jump to a slide and mark the current one", async ({ page }) => {
    const full = preview(page, "carousel-full-width");
    await full.getByRole("button", { name: "Go to slide 3" }).click();
    await expect(activeSlide(full)).toHaveAttribute("aria-label", "3 of 4");
    await expect(full.getByRole("button", { name: "Go to slide 3" })).toHaveAttribute("aria-current", "true");
    // Off-screen slides are inert in full-width mode.
    await expect(full.getByRole("group", { name: "1 of 4" })).toHaveAttribute("inert", "");
  });

  test("controlled index and imperative handle", async ({ page }) => {
    const controlled = preview(page, "carousel-controlled");
    await controlled.getByRole("button", { name: "Next", exact: true }).click();
    await expect(controlled.getByText("Slide 2 of 5")).toBeVisible();
    await controlled.getByRole("button", { name: "Next", exact: true }).click();
    await expect(activeSlide(controlled)).toHaveAttribute("aria-label", "3 of 5");
    await controlled.getByRole("button", { name: "First" }).click();
    await expect(activeSlide(controlled)).toHaveAttribute("aria-label", "1 of 5");
    // noWrap: prev at the first slide stays put.
    await controlled.getByRole("button", { name: "Prev" }).click();
    await expect(controlled.getByText("Slide 1 of 5")).toBeVisible();
  });

  test("autoplay advances, pauses on hover and focus, and has a pause button", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover only on desktop");
    const auto = preview(page, "carousel-autoplay");
    const region = auto.getByRole("region", { name: "Destinations" });
    await region.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await expect(activeSlide(auto)).toHaveAttribute("aria-label", "2 of 5", { timeout: 6000 });
    await expect(region.locator('[data-slot="carousel-viewport"]')).toHaveAttribute("aria-live", "off");

    // Hover pauses.
    await region.hover();
    const hovered = await activeSlide(auto).getAttribute("aria-label");
    await page.waitForTimeout(3600);
    await expect(activeSlide(auto)).toHaveAttribute("aria-label", hovered ?? "");
    await page.mouse.move(0, 0);

    // Keyboard focus pauses.
    await region.locator('[data-slot="carousel-viewport"]').focus();
    const focused = await activeSlide(auto).getAttribute("aria-label");
    await page.waitForTimeout(3600);
    await expect(activeSlide(auto)).toHaveAttribute("aria-label", focused ?? "");
    await expect(region.locator('[data-slot="carousel-viewport"]')).toHaveAttribute("aria-live", "polite");

    // Pause button stops rotation.
    await auto.getByRole("button", { name: "Stop automatic slide show" }).click();
    await expect(auto.getByRole("button", { name: "Start automatic slide show" })).toBeVisible();
  });

  test("autoplay starts paused under reduced motion", async ({ page }) => {
    await reduceMotion(page);
    await page.reload();
    const auto = preview(page, "carousel-autoplay");
    await expect(auto.getByRole("button", { name: "Start automatic slide show" })).toBeVisible();
    await page.waitForTimeout(3500);
    await expect(activeSlide(auto)).toHaveAttribute("aria-label", "1 of 5");
  });

  test("uses touch-action: pan-y so vertical page scrolling is never blocked", async ({ page }) => {
    const viewport = preview(page, "carousel-full-width").locator('[data-slot="carousel-viewport"]');
    expect(await viewport.evaluate((el) => getComputedStyle(el).touchAction)).toBe("pan-y");
  });

  test("touch: vertical swipe scrolls the page, horizontal swipe changes the slide", async ({ page, isMobile }) => {
    test.skip(!isMobile, "touch only");
    const full = preview(page, "carousel-full-width");
    const viewport = full.locator('[data-slot="carousel-viewport"]');
    await viewport.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.scrollY);
    await touchSwipe(page, viewport, 0, -250);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before + 100);
    await expect(activeSlide(full)).toHaveAttribute("aria-label", "1 of 4");

    await viewport.scrollIntoViewIfNeeded();
    await touchSwipe(page, viewport, -220, 0);
    await expect(activeSlide(full)).toHaveAttribute("aria-label", "2 of 4");
  });

  test("touch: tapping a link inside a slide follows it", async ({ page, isMobile }) => {
    test.skip(!isMobile, "touch only");
    const full = preview(page, "carousel-full-width");
    await activeSlide(full).getByRole("link", { name: "Read more" }).tap();
    await expect(page).toHaveURL(/#first-panel$/);
  });

  test("the height lives on the root, so a consumer height sizes the whole carousel", async ({ page }) => {
    const root = preview(page, "carousel-demo").locator('[data-slot="carousel"]');
    const heights = () =>
      root.evaluate((el) => [el, el.querySelector('[data-slot="carousel-viewport"]')!].map((n) => n.getBoundingClientRect().height));
    expect(await heights()).toEqual([400, 400]);
    await root.evaluate((el) => (el.style.height = "250px"));
    expect(await heights()).toEqual([250, 250]);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
