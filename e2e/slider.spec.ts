import { expect, test, type Locator } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

function activeSlide(scope: Locator): Locator {
  return scope.locator('[data-slot="slider-item"][data-active]');
}

test.describe("Slider", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "slider");
  });

  test("renders a labelled slide show with one visible slide and indicators", async ({ page }) => {
    const demo = preview(page, "slider-demo");
    const region = demo.getByRole("region", { name: "Featured destinations" });
    await expect(region).toHaveAttribute("aria-roledescription", "carousel");
    await expect(region.locator('[data-slot="slider-item"]')).toHaveCount(4);
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "1 of 4");
    await expect(region.locator('[data-slot="slider-item"]').nth(1)).toHaveAttribute("inert", "");
    await expect(demo.getByRole("button", { name: "Go to slide 1" })).toHaveAttribute("aria-current", "true");
    await expect(activeSlide(demo).locator('[data-slot="slider-caption"]')).toHaveCSS("opacity", "1", { timeout: 3000 });
  });

  test("indicators switch slides and crossfade", async ({ page }) => {
    const demo = preview(page, "slider-demo");
    await demo.getByRole("button", { name: "Go to slide 3" }).click();
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "3 of 4");
    await expect(activeSlide(demo)).toHaveCSS("opacity", "1");
    await expect(demo.getByRole("button", { name: "Go to slide 3" })).toHaveAttribute("aria-current", "true");
    const transition = await activeSlide(demo).evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(transition).toContain("0.5s");
  });

  test("arrow keys change slides when focused", async ({ page }) => {
    const demo = preview(page, "slider-demo");
    await demo.locator('[data-slot="slider-slides"]').focus();
    await page.keyboard.press("ArrowLeft");
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "4 of 4");
    await page.keyboard.press("ArrowRight");
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "1 of 4");
  });

  test("autoplay pauses on hover and focus, and the pause button toggles", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover only on desktop");
    const demo = preview(page, "slider-demo");
    await page.clock.install();
    await page.reload();
    await expect(demo.getByRole("button", { name: "Stop automatic slide show" })).toBeVisible();
    await page.mouse.move(0, 0);
    await page.clock.runFor(6600);
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "2 of 4");

    await demo.getByRole("region").hover();
    await page.clock.runFor(13000);
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "2 of 4");
    await page.mouse.move(0, 0);

    await demo.locator('[data-slot="slider-slides"]').focus();
    await page.clock.runFor(13000);
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "2 of 4");
    await demo.locator('[data-slot="slider-slides"]').blur();

    await demo.getByRole("button", { name: "Stop automatic slide show" }).click();
    await page.mouse.move(0, 0);
    await expect(demo.getByRole("button", { name: "Start automatic slide show" })).toBeVisible();
    await page.clock.runFor(13000);
    await expect(activeSlide(demo)).toHaveAttribute("aria-label", "2 of 4");
  });

  test("reduced motion starts paused and disables transitions", async ({ page }) => {
    await reduceMotion(page);
    await page.reload();
    const demo = preview(page, "slider-demo");
    await expect(demo.getByRole("button", { name: "Start automatic slide show" })).toBeVisible();
    const property = await activeSlide(demo).evaluate((el) => getComputedStyle(el).transitionProperty);
    expect(property).toBe("none");
  });

  test("controlled slider follows external buttons", async ({ page }) => {
    const manual = preview(page, "slider-manual");
    await expect(manual.getByRole("button", { name: /automatic slide show/ })).toHaveCount(0);
    await manual.getByRole("button", { name: "Next" }).click();
    await expect(activeSlide(manual)).toHaveAttribute("aria-label", "2 of 3");
    await manual.getByRole("button", { name: "Previous" }).click();
    await manual.getByRole("button", { name: "Previous" }).click();
    await expect(activeSlide(manual)).toHaveAttribute("aria-label", "3 of 3");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
