import { expect, test, type Page } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

const TOAST = "[data-slot=toast]";

async function showDemoToast(page: Page): Promise<void> {
  await preview(page, "toast-demo").getByRole("button", { name: "Toast!" }).click();
}

test.describe("Toast", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "toast");
  });

  test("shows a toast and hides it after the duration", async ({ page }) => {
    await showDemoToast(page);
    const toast = page.locator(TOAST);
    await expect(toast).toHaveText("I am a toast!");
    await page.waitForTimeout(2500);
    await expect(toast).toBeVisible();
    await expect(toast).toHaveCount(0, { timeout: 4000 });
  });

  test("announces through the live regions", async ({ page }) => {
    await showDemoToast(page);
    await expect(page.locator("[data-slot=toaster] [role=status]")).toHaveText("I am a toast!");
    await preview(page, "toast-styles").getByRole("button", { name: "Error" }).click();
    await expect(page.locator("[data-slot=toaster] [role=alert]")).toHaveText("Upload failed. Check your connection.");
    // Only one toaster renders even though every example mounts one.
    await expect(page.locator("[data-slot=toaster]")).toHaveCount(1);
  });

  test("uses Materialize placement on large, medium and small screens", async ({ page, isMobile }) => {
    test.skip(isMobile, "viewport sizes are set explicitly");
    await page.setViewportSize({ width: 1280, height: 800 });
    await showDemoToast(page);
    const toast = page.locator(TOAST);
    await expect(toast).toBeVisible();
    await page.waitForTimeout(400);
    let box = await toast.boundingBox();
    if (!box) throw new Error("no box");
    expect(Math.abs(box.y - (800 * 0.1 + 10))).toBeLessThan(3);
    expect(Math.abs(1280 - (box.x + box.width) - 1280 * 0.07)).toBeLessThan(3);

    await page.setViewportSize({ width: 800, height: 800 });
    await page.waitForTimeout(100);
    box = await toast.boundingBox();
    if (!box) throw new Error("no box");
    expect(Math.abs(box.x - 800 * 0.05)).toBeLessThan(3);
    expect(Math.abs(800 - (box.y + box.height) - 800 * 0.07)).toBeLessThan(3);

    await page.setViewportSize({ width: 400, height: 800 });
    await page.waitForTimeout(100);
    box = await toast.boundingBox();
    if (!box) throw new Error("no box");
    expect(box.x).toBe(0);
    expect(Math.round(box.width)).toBe(400);
    expect(Math.round(box.y + box.height)).toBe(800);
    expect(await toast.evaluate((el) => getComputedStyle(el).borderRadius)).toBe("0px");
  });

  test("runs the action and dismisses", async ({ page }) => {
    await preview(page, "toast-undo").getByRole("button", { name: "Archive" }).click();
    const toast = page.locator(TOAST).filter({ hasText: "Message archived" });
    await expect(toast).toBeVisible();
    await toast.getByRole("button", { name: "Undo" }).click();
    await expect(toast).toHaveCount(0);
    await expect(page.locator(TOAST).filter({ hasText: "Message restored" })).toBeVisible();
  });

  test("pauses while hovered", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover only applies to mouse pointers");
    await showDemoToast(page);
    const toast = page.locator(TOAST);
    await expect(toast).toBeVisible();
    await toast.hover();
    await page.waitForTimeout(5000);
    await expect(toast).toBeVisible();
    await page.mouse.move(5, 5);
    await expect(toast).toHaveCount(0, { timeout: 6000 });
  });

  test("swipes away past 80% of its width and springs back otherwise", async ({ page }) => {
    await showDemoToast(page);
    const toast = page.locator(TOAST);
    await expect(toast).toBeVisible();
    await page.waitForTimeout(400);
    const box = await toast.boundingBox();
    if (!box) throw new Error("no box");
    const swipe = async (distance: number, steps: number, stepMs: number): Promise<void> => {
      await toast.evaluate(
        async (el, { distance, steps, stepMs }) => {
          const rect = el.getBoundingClientRect();
          const y = rect.top + rect.height / 2;
          const x0 = rect.left + 20;
          const init = { bubbles: true, pointerId: 7, pointerType: "touch", isPrimary: true, clientY: y, button: 0 };
          el.dispatchEvent(new PointerEvent("pointerdown", { ...init, clientX: x0, buttons: 1 }));
          for (let i = 1; i <= steps; i++) {
            if (stepMs) await new Promise((resolve) => setTimeout(resolve, stepMs));
            el.dispatchEvent(new PointerEvent("pointermove", { ...init, clientX: x0 + (distance * i) / steps, buttons: 1 }));
          }
          el.dispatchEvent(new PointerEvent("pointerup", { ...init, clientX: x0 + distance }));
        },
        { distance, steps, stepMs },
      );
    };
    // A slow, short drag springs back (a quick flick would dismiss).
    await swipe(box.width * 0.3, 6, 60);
    await page.waitForTimeout(300);
    await expect(toast).toBeVisible();
    expect(await toast.evaluate((el) => el.style.transform)).toBe("");
    // Past 80%: dismissed.
    await swipe(box.width * 0.9, 8, 30);
    await expect(toast).toHaveCount(0);
  });

  test("Escape dismisses a focused toast", async ({ page }) => {
    await preview(page, "toast-undo").getByRole("button", { name: "Archive" }).click();
    const toast = page.locator(TOAST);
    const undo = toast.getByRole("button", { name: "Undo" });
    await undo.focus();
    await page.keyboard.press("Escape");
    await expect(toast).toHaveCount(0);
  });

  test("queues beyond max and dismissAll clears everything", async ({ page }) => {
    const scope = preview(page, "toast-styles");
    const persistent = scope.getByRole("button", { name: "Persistent" });
    for (let i = 0; i < 4; i++) await persistent.click();
    await expect(page.locator(TOAST)).toHaveCount(3);
    await page.locator(TOAST).first().getByRole("button", { name: "Dismiss notification" }).click();
    await expect(page.locator(TOAST)).toHaveCount(3);
    await scope.getByRole("button", { name: "Dismiss all" }).click();
    await expect(page.locator(TOAST)).toHaveCount(0);
  });

  test("applies the rounded variant and custom classes", async ({ page }) => {
    const scope = preview(page, "toast-styles");
    await scope.getByRole("button", { name: "Rounded" }).click();
    await expect(page.locator(TOAST)).toBeVisible();
    expect(await page.locator(TOAST).evaluate((el) => getComputedStyle(el).borderRadius)).toBe("24px");
    await scope.getByRole("button", { name: "Custom classes" }).click();
    const custom = page.locator(TOAST).filter({ hasText: "Saved to drafts" });
    await expect(custom).toHaveClass(/bg-md-green-700/);
  });

  test("skips animations with reduced motion", async ({ page }) => {
    await reduceMotion(page);
    await showDemoToast(page);
    const toast = page.locator(TOAST);
    await expect(toast).toBeVisible();
    expect(await toast.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
    await preview(page, "toast-undo").getByRole("button", { name: "Archive" }).click();
    await expect(page.locator(TOAST)).toBeVisible();
    await page.waitForTimeout(400);
    await expectNoA11yViolations(page, "[data-slot=toaster]");
  });
});
