import { expect, test, type Page } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

async function open(page: Page): Promise<void> {
  const scope = preview(page, "tap-target-demo");
  await scope.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await scope.getByRole("button", { name: "Open tap target" }).click();
  await expect(page.getByRole("dialog", { name: "Add new items" })).toBeVisible();
  await page.waitForTimeout(400);
}

test.describe("Tap Target", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "tap-target");
  });

  test("opens a labelled dialog around the target and moves focus into it", async ({ page }) => {
    await open(page);
    const dialog = page.getByRole("dialog", { name: "Add new items" });
    await expect(dialog).toHaveAttribute("aria-describedby", /.+/);
    await expect(dialog).toBeFocused();
    const anchor = preview(page, "tap-target-demo").getByRole("button", { name: "Add item" });
    const [a, circle] = await Promise.all([
      anchor.boundingBox(),
      page.locator("[data-slot=tap-target-circle]").boundingBox(),
    ]);
    if (!a || !circle) throw new Error("no box");
    expect(Math.round(circle.width)).toBe(800);
    expect(Math.abs(circle.x + circle.width / 2 - (a.x + a.width / 2))).toBeLessThan(2);
    expect(Math.abs(circle.y + circle.height / 2 - (a.y + a.height / 2))).toBeLessThan(2);
    // The pulse runs while open.
    await expect(page.locator("[data-slot=tap-target] .animate-md-pulse")).toHaveCount(1);
  });

  test("Escape closes it and focus returns", async ({ page }) => {
    await open(page);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(preview(page, "tap-target-demo").getByRole("button", { name: "Open tap target" })).toBeFocused();
  });

  test("a click outside the circle closes it, a click inside does not", async ({ page }) => {
    await open(page);
    const title = page.getByRole("heading", { name: "Add new items" });
    await title.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("clicking the highlighted target closes it", async ({ page }) => {
    await open(page);
    await page.locator("[data-slot=tap-target-origin]").click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("places the text toward the screen center and inside the viewport", async ({ page }) => {
    await open(page);
    const viewport = page.viewportSize();
    const [anchor, text] = await Promise.all([
      preview(page, "tap-target-demo").getByRole("button", { name: "Add item" }).boundingBox(),
      page.locator("[data-slot=tap-target-content]").boundingBox(),
    ]);
    if (!viewport || !anchor || !text) throw new Error("no box");
    const cx = anchor.x + anchor.width / 2;
    if (cx > viewport.width * 0.75) expect(text.x + text.width).toBeLessThanOrEqual(cx + anchor.width + 1);
    if (cx < viewport.width * 0.25) expect(text.x).toBeGreaterThanOrEqual(cx - anchor.width - 1);
    expect(text.x).toBeGreaterThanOrEqual(15);
    expect(text.x + text.width).toBeLessThanOrEqual(viewport.width - 15);
    expect(text.y).toBeGreaterThanOrEqual(15);
    expect(text.y + text.height).toBeLessThanOrEqual(viewport.height - 15);
  });

  test("keeps the text inside a small viewport", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await open(page);
    const title = await page.getByRole("heading", { name: "Add new items" }).boundingBox();
    const description = await page.locator("[data-slot=tap-target-description]").boundingBox();
    if (!title || !description) throw new Error("no box");
    for (const box of [title, description]) {
      expect(box.x).toBeGreaterThanOrEqual(15);
      expect(box.x + box.width).toBeLessThanOrEqual(345);
    }
  });

  test("the Got it button closes it", async ({ page }) => {
    await open(page);
    await page.getByRole("button", { name: "Got it" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("skips transitions and the pulse with reduced motion", async ({ page }) => {
    await reduceMotion(page);
    await open(page);
    const circle = page.locator("[data-slot=tap-target-circle]");
    expect(await circle.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe("none");
    await expect(page.locator("[data-slot=tap-target] .animate-md-pulse")).toBeHidden();
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
    await open(page);
    await expectNoA11yViolations(page, "[data-slot=tap-target]");
  });
});
