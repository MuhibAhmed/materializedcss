import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

/** The visible tooltip bubble (excludes one that is fading out). */
const OPEN = "[data-slot=tooltip]:not([data-state=closed])";

test.describe("Tooltip", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "tooltip");
    await preview(page, "tooltip-demo").evaluate((el) => el.scrollIntoView({ block: "center" }));
  });

  test("opens on hover below the trigger and closes after the exit delay", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover only applies to mouse pointers");
    const trigger = preview(page, "tooltip-demo").getByRole("button", { name: "Bottom" });
    await trigger.hover();
    const bubble = page.locator(OPEN);
    await expect(bubble).toBeVisible();
    await expect(bubble).toHaveText("I am a tooltip");
    await page.waitForTimeout(300);
    const [t, b] = await Promise.all([trigger.boundingBox(), bubble.boundingBox()]);
    if (!t || !b) throw new Error("no box");
    // Materialize margin: 5px below the trigger.
    expect(Math.round(b.y - (t.y + t.height))).toBe(5);
    // aria-describedby points at the role=tooltip node.
    const describedBy = await trigger.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`[id="${describedBy}"]`)).toHaveAttribute("role", "tooltip");

    await page.mouse.move(2, 2, { steps: 6 });
    // Still shown during the 200ms exit delay.
    await page.waitForTimeout(60);
    await expect(page.locator("[data-slot=tooltip]")).toHaveCount(1);
    await expect(page.locator("[data-slot=tooltip]")).toHaveCount(0);
  });

  test("places each side correctly", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover only applies to mouse pointers");
    const scope = preview(page, "tooltip-demo");
    for (const side of ["Top", "Left", "Right"] as const) {
      const trigger = scope.getByRole("button", { name: side });
      await trigger.hover();
      const bubble = page.locator(OPEN);
      await expect(bubble).toBeVisible();
      await page.waitForTimeout(300);
      const [t, b] = await Promise.all([trigger.boundingBox(), bubble.boundingBox()]);
      if (!t || !b) throw new Error("no box");
      if (side === "Top") expect(b.y + b.height).toBeLessThanOrEqual(t.y);
      if (side === "Left") expect(b.x + b.width).toBeLessThanOrEqual(t.x);
      if (side === "Right") expect(b.x).toBeGreaterThanOrEqual(t.x + t.width);
      await page.mouse.move(2, 2, { steps: 6 });
      await expect(page.locator("[data-slot=tooltip]")).toHaveCount(0);
    }
  });

  test("opens on keyboard focus and closes on Escape", async ({ page }) => {
    const trigger = preview(page, "tooltip-demo").getByRole("button", { name: "Top" });
    await trigger.focus();
    const bubble = page.locator(OPEN);
    await expect(bubble).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-slot=tooltip]")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("moves with keyboard focus", async ({ page }) => {
    const scope = preview(page, "tooltip-demo");
    await scope.getByRole("button", { name: "Bottom" }).focus();
    await expect(page.locator(OPEN)).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(scope.getByRole("button", { name: "Top" })).toBeFocused();
    // Only the newly focused trigger's tooltip stays open.
    await expect(page.locator(OPEN)).toHaveCount(1);
    await expect(page.locator("[data-slot=tooltip]")).toHaveCount(1);
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(page.locator("[data-slot=tooltip]")).toHaveCount(0);
  });

  test("stays inside the viewport near the edge", async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 800 });
    const trigger = preview(page, "tooltip-demo").getByRole("button", { name: "Left" });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    const bubble = page.locator(OPEN);
    await expect(bubble).toBeVisible();
    await page.waitForTimeout(300);
    const box = await bubble.boundingBox();
    if (!box) throw new Error("no box");
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(420);
  });

  test("renders React nodes as content", async ({ page }) => {
    const trigger = preview(page, "tooltip-composable").getByRole("button", { name: "Keyboard shortcut" });
    await trigger.focus();
    const bubble = page.locator(OPEN);
    await expect(bubble).toBeVisible();
    await expect(bubble.locator("kbd")).toHaveText("Ctrl S");
  });

  test("skips the slide with reduced motion", async ({ page }) => {
    await reduceMotion(page);
    await preview(page, "tooltip-demo").getByRole("button", { name: "Bottom" }).focus();
    const bubble = page.locator(OPEN);
    await expect(bubble).toBeVisible();
    const style = await bubble.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { transition: cs.transitionProperty, animation: cs.animationName };
    });
    expect(style.transition).toBe("none");
    expect(style.animation).toBe("none");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
    await preview(page, "tooltip-demo").getByRole("button", { name: "Bottom" }).focus();
    await expect(page.locator(OPEN)).toBeVisible();
    await page.waitForTimeout(300);
    await expectNoA11yViolations(page, "[data-slot=tooltip]");
  });
});
