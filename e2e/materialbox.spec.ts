import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

test.describe("Materialbox", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "materialbox");
  });

  test("zooms the image to fit the viewport and restores it", async ({ page }) => {
    const trigger = preview(page, "materialbox-demo").getByRole("button", { name: /^Enlarge image:/ });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Pine forest under a pale green sky" });
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(400);
    const zoomed = dialog.getByRole("img", { name: "Pine forest under a pale green sky" });
    const box = await zoomed.boundingBox();
    const viewport = page.viewportSize();
    if (!box || !viewport) throw new Error("no box");
    // Keeps the 3:2 aspect ratio and fills 90% of the limiting dimension.
    expect(Math.abs(box.width / box.height - 1.5)).toBeLessThan(0.02);
    const fillsWidth = Math.abs(box.width - viewport.width * 0.9) < 2;
    const fillsHeight = Math.abs(box.height - viewport.height * 0.9) < 2;
    expect(fillsWidth || fillsHeight).toBe(true);
    // Centered.
    expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(2);
    // The thumbnail is hidden while zoomed.
    await expect(preview(page, "materialbox-demo").locator("img")).toBeHidden();

    await zoomed.click();
    await expect(dialog).toBeHidden();
    await expect(preview(page, "materialbox-demo").locator("img")).toBeVisible();
  });

  test("Escape closes it and focus returns to the thumbnail", async ({ page }) => {
    const trigger = preview(page, "materialbox-demo").getByRole("button", { name: /^Enlarge image:/ });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("the close button closes it", async ({ page }) => {
    await preview(page, "materialbox-demo").getByRole("button", { name: /^Enlarge image:/ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).toBeHidden();
  });

  test("a deliberate scroll closes it, a tiny one does not", async ({ page, isMobile }) => {
    test.skip(isMobile, "wheel events need a mouse");
    await preview(page, "materialbox-demo").getByRole("button", { name: /^Enlarge image:/ }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(350);
    await page.mouse.move(20, 20);
    await page.mouse.wheel(0, 20);
    await page.waitForTimeout(300);
    await expect(dialog).toBeVisible();
    await page.mouse.wheel(0, 120);
    await expect(dialog).toBeHidden();
  });

  test("shows the caption and uses it as the description", async ({ page }) => {
    await preview(page, "materialbox-caption").getByRole("button", { name: "Enlarge image: Snowy alpine peaks" }).click();
    const dialog = page.getByRole("dialog", { name: "Snowy alpine peaks" });
    await expect(dialog).toBeVisible();
    const caption = dialog.getByText("Alpine peaks above the tree line, early morning.");
    await expect(caption).toBeVisible();
    const describedBy = await dialog.getAttribute("aria-describedby");
    expect(await caption.getAttribute("id")).toBe(describedBy);
    // The image sits above the caption bar.
    await page.waitForTimeout(400);
    const [img, cap] = await Promise.all([dialog.getByRole("img").boundingBox(), caption.boundingBox()]);
    if (!img || !cap) throw new Error("no box");
    expect(img.y + img.height).toBeLessThanOrEqual(cap.y);
  });

  test("skips the zoom animation with reduced motion", async ({ page }) => {
    await reduceMotion(page);
    await preview(page, "materialbox-demo").getByRole("button", { name: /^Enlarge image:/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
    await preview(page, "materialbox-caption").getByRole("button", { name: "Enlarge image: Snowy alpine peaks" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(400);
    await expectNoA11yViolations(page, "[role=dialog]");
  });
});
