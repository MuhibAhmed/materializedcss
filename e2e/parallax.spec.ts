import { expect, test, type Locator, type Page } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

async function imageOffset(image: Locator): Promise<number> {
  return image.evaluate((img) => {
    const container = img.parentElement;
    if (!container) return 0;
    return img.getBoundingClientRect().top - container.getBoundingClientRect().top;
  });
}

async function scrollTo(page: Page, y: number): Promise<void> {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(150);
}

/** Image offset inside its container at two scroll positions around the container. */
async function offsetsWhileScrolling(page: Page, container: Locator): Promise<[number, number]> {
  const image = container.locator('[data-slot="parallax-image"]');
  const top = await container.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  await scrollTo(page, top - 600);
  const a = await imageOffset(image);
  await scrollTo(page, top - 100);
  const b = await imageOffset(image);
  return [a, b];
}

test.describe("Parallax", () => {
  test("uses a scroll-driven animation and moves the image while scrolling", async ({ page }) => {
    await gotoComponent(page, "parallax");
    const container = preview(page, "parallax-content").locator('[data-slot="parallax"]');
    await expect(container).toHaveAttribute("data-mode", "scroll-timeline");
    const [a, b] = await offsetsWhileScrolling(page, container);
    // Scrolling down moves the image down inside the container (slower than the page).
    expect(b - a).toBeGreaterThan(20);
  });

  test("falls back to a scroll handler without scroll timelines", async ({ page }) => {
    await page.addInitScript(() => {
      // Simulate a browser without CSS scroll-driven animations.
      delete (window as unknown as { ViewTimeline?: unknown }).ViewTimeline;
    });
    await gotoComponent(page, "parallax");
    const container = preview(page, "parallax-content").locator('[data-slot="parallax"]');
    await expect(container).toHaveAttribute("data-mode", "fallback");
    const [a, b] = await offsetsWhileScrolling(page, container);
    expect(b - a).toBeGreaterThan(20);
  });

  test("is disabled under reduced motion", async ({ page }) => {
    await reduceMotion(page);
    await gotoComponent(page, "parallax");
    const container = preview(page, "parallax-content").locator('[data-slot="parallax"]');
    await expect(container).toHaveAttribute("data-mode", "static");
    const [a, b] = await offsetsWhileScrolling(page, container);
    expect(Math.abs(b - a)).toBeLessThan(1);
  });

  test("renders children over the image", async ({ page }) => {
    await gotoComponent(page, "parallax");
    const content = preview(page, "parallax-content");
    await expect(content.getByRole("heading", { name: "Explore the night sky" })).toBeVisible();
    await content.getByRole("button", { name: "Book a tour" }).click();
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await gotoComponent(page, "parallax");
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
