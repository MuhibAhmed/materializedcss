import { expect, type Page, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

interface Point {
  x: number;
  y: number;
}

/**
 * Drag with synthetic touch Pointer Events (works in every browser project).
 * `settle` adds a final pause without movement so the release has no fling velocity.
 */
async function touchDrag(page: Page, from: Point, to: Point, { steps = 8, settle = false } = {}): Promise<void> {
  await page.evaluate(
    async ({ from, to, steps, settle }) => {
      const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
      const init = (x: number, y: number, buttons: number): PointerEventInit => ({
        bubbles: true,
        cancelable: true,
        composed: true,
        pointerId: 11,
        pointerType: "touch",
        isPrimary: true,
        button: 0,
        buttons,
        clientX: x,
        clientY: y,
      });
      const start = document.elementFromPoint(from.x, from.y);
      if (!start) throw new Error("nothing at start point");
      start.dispatchEvent(new PointerEvent("pointerdown", init(from.x, from.y, 1)));
      let x = from.x;
      let y = from.y;
      for (let i = 1; i <= steps; i++) {
        await wait(20);
        x = from.x + ((to.x - from.x) * i) / steps;
        y = from.y + ((to.y - from.y) * i) / steps;
        (document.elementFromPoint(x, y) ?? document.body).dispatchEvent(new PointerEvent("pointermove", init(x, y, 1)));
      }
      if (settle) {
        await wait(120);
        (document.elementFromPoint(x, y) ?? document.body).dispatchEvent(new PointerEvent("pointermove", init(x, y, 1)));
        await wait(20);
      }
      (document.elementFromPoint(x, y) ?? document.body).dispatchEvent(new PointerEvent("pointerup", init(x, y, 0)));
    },
    { from, to, steps, settle },
  );
}

test.describe("Sidenav", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "sidenav");
  });

  test("opens a labelled drawer and returns focus on Escape", async ({ page }) => {
    const trigger = preview(page, "sidenav-demo").getByRole("button", { name: "Open sidenav" });
    await trigger.click();
    const drawer = page.getByRole("dialog", { name: "Main navigation" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Inbox" })).toHaveAttribute("aria-current", "page");
    await expect.poll(() => drawer.evaluate((el) => el.contains(document.activeElement))).toBe(true);

    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(page.locator("[data-slot=sidenav-overlay]")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("closes on overlay click without leaving the overlay behind", async ({ page }) => {
    await preview(page, "sidenav-demo").getByRole("button", { name: "Open sidenav" }).click();
    const drawer = page.getByRole("dialog", { name: "Main navigation" });
    await expect(drawer).toBeVisible();
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("no viewport");
    await page.mouse.click(viewport.width - 10, viewport.height / 2);
    await expect(drawer).toBeHidden();
    await expect(page.locator("[data-slot=sidenav-overlay]")).toHaveCount(0);
  });

  test("has a 300px panel with user view and collapsible group", async ({ page }) => {
    await preview(page, "sidenav-demo").getByRole("button", { name: "Open sidenav" }).click();
    const drawer = page.getByRole("dialog", { name: "Main navigation" });
    await expect(drawer).toBeVisible();
    await page.waitForTimeout(300);
    const box = await drawer.boundingBox();
    const viewport = page.viewportSize();
    if (!box || !viewport) throw new Error("no box");
    expect(Math.round(box.x)).toBe(0);
    expect(Math.round(box.width)).toBe(Math.min(300, viewport.width - 56));
    await expect(drawer.getByRole("img", { name: "Ada Lovelace" })).toBeVisible();

    const labels = drawer.getByRole("button", { name: "Labels" });
    await expect(labels).toHaveAttribute("aria-expanded", "false");
    await labels.click();
    await expect(labels).toHaveAttribute("aria-expanded", "true");
    await expect(drawer.getByRole("link", { name: "Work" })).toBeVisible();
  });

  test("swiping from the left edge opens the drawer", async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("no viewport");
    const y = Math.round(viewport.height / 2);
    await expect(page.locator("[data-slot=sidenav-drag-target]").first()).toBeAttached();
    await touchDrag(page, { x: 3, y }, { x: 200, y });
    const drawer = page.getByRole("dialog", { name: "Main navigation" });
    await expect(drawer).toBeVisible();
    await expect.poll(() => drawer.evaluate((el) => el.style.transform)).toBe("");
    const box = await drawer.boundingBox();
    expect(Math.round(box?.x ?? -1)).toBe(0);
  });

  test("a short, slow edge drag springs back closed", async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport) throw new Error("no viewport");
    const y = Math.round(viewport.height / 2);
    await touchDrag(page, { x: 3, y }, { x: 40, y }, { settle: true });
    await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 3000 });
    await expect(page.locator("[data-slot=sidenav-overlay]")).toHaveCount(0);
    // The edge target is back for the next gesture.
    await expect(page.locator("[data-slot=sidenav-drag-target]").first()).toBeAttached();
  });

  test("dragging the open panel closes it", async ({ page }) => {
    await preview(page, "sidenav-demo").getByRole("button", { name: "Open sidenav" }).click();
    const drawer = page.getByRole("dialog", { name: "Main navigation" });
    await expect(drawer).toBeVisible();
    await page.waitForTimeout(300);
    await touchDrag(page, { x: 200, y: 420 }, { x: 20, y: 425 });
    await expect(drawer).toBeHidden();
    await expect(page.locator("[data-slot=sidenav-overlay]")).toHaveCount(0);
  });

  test("a vertical drag on the panel does not close it", async ({ page }) => {
    await preview(page, "sidenav-demo").getByRole("button", { name: "Open sidenav" }).click();
    const drawer = page.getByRole("dialog", { name: "Main navigation" });
    await expect(drawer).toBeVisible();
    await page.waitForTimeout(300);
    await touchDrag(page, { x: 150, y: 400 }, { x: 145, y: 250 });
    await page.waitForTimeout(400);
    await expect(drawer).toBeVisible();
  });

  test("right edge drawer slides in from the right and closes on link click", async ({ page }) => {
    const trigger = preview(page, "sidenav-right").getByRole("button", { name: "Filters" });
    await trigger.click();
    const drawer = page.getByRole("dialog", { name: "Filters" });
    await expect(drawer).toBeVisible();
    await page.waitForTimeout(300);
    const box = await drawer.boundingBox();
    const viewport = page.viewportSize();
    if (!box || !viewport) throw new Error("no box");
    expect(Math.round(box.x + box.width)).toBe(viewport.width);
    await drawer.getByRole("link", { name: "Newest" }).click();
    await expect(drawer).toBeHidden();
  });

  test("fixed variant is a static nav on desktop and a drawer on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const scope = preview(page, "sidenav-fixed");
    await expect(scope.getByRole("navigation", { name: "Dashboard navigation" })).toBeVisible();
    await expect(scope.getByRole("button", { name: "Menu" })).toBeHidden();

    await page.setViewportSize({ width: 800, height: 900 });
    await expect(scope.getByRole("navigation", { name: "Dashboard navigation" })).toBeHidden();
    await scope.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("dialog", { name: "Dashboard navigation" })).toBeVisible();
    // Growing past the breakpoint closes the drawer.
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.getByRole("dialog", { name: "Dashboard navigation" })).toBeHidden();
  });

  test("skips slide animations with reduced motion", async ({ page }) => {
    await reduceMotion(page);
    await preview(page, "sidenav-demo").getByRole("button", { name: "Open sidenav" }).click();
    const drawer = page.getByRole("dialog", { name: "Main navigation" });
    await expect(drawer).toBeVisible();
    expect(await drawer.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    await page.keyboard.press("Escape");
    await expect(drawer).toHaveCount(0);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
    await preview(page, "sidenav-demo").getByRole("button", { name: "Open sidenav" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(700);
    await expectNoA11yViolations(page, "[role=dialog]");
  });
});
