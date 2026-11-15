import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

test.describe("Modal", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "modal");
  });

  test("opens a labelled dialog and returns focus on Escape", async ({ page }) => {
    const trigger = preview(page, "modal-demo").getByRole("button", { name: "Open modal" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Modal Header" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleDescription(/describing what this dialog/);
    await expect(page.locator("[data-slot=modal-overlay]")).toHaveCount(1);
    // Focus is inside the dialog.
    await expect.poll(() => dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.locator("[data-slot=modal-overlay]")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("closes on overlay click and with close buttons", async ({ page }) => {
    const trigger = preview(page, "modal-demo").getByRole("button", { name: "Open modal" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Modal Header" });
    await expect(dialog).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(dialog).toBeHidden();

    await trigger.click();
    await dialog.getByRole("button", { name: "Agree", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("traps focus with Tab", async ({ page }) => {
    await preview(page, "modal-demo").getByRole("button", { name: "Open modal" }).click();
    const dialog = page.getByRole("dialog", { name: "Modal Header" });
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
  });

  test("locks page scrolling while open", async ({ page }) => {
    await preview(page, "modal-demo").getByRole("button", { name: "Open modal" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.move(20, 400);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => window.scrollY)).toBe(before);
  });

  test("fixed footer scrolls the body and pins the footer", async ({ page }) => {
    await preview(page, "modal-fixed-footer").getByRole("button", { name: "Terms of service" }).click();
    const dialog = page.getByRole("dialog", { name: "Terms of service" });
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(350);
    const body = dialog.locator("[data-slot=modal-body]");
    const scrollable = await body.evaluate((el) => el.scrollHeight > el.clientHeight && getComputedStyle(el).overflowY === "auto");
    expect(scrollable).toBe(true);
    const footer = dialog.locator("[data-slot=modal-footer]");
    await expect(footer).toBeInViewport();
    expect(await footer.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe("1px");
  });

  test("bottom sheet spans the full width at the bottom", async ({ page }) => {
    await preview(page, "modal-bottom-sheet").getByRole("button", { name: "Share" }).click();
    const dialog = page.getByRole("dialog", { name: "Share with" });
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(350);
    const box = await dialog.boundingBox();
    const viewport = page.viewportSize();
    if (!box || !viewport) throw new Error("no box");
    expect(Math.round(box.width)).toBe(viewport.width);
    expect(Math.round(box.y + box.height)).toBe(viewport.height);
  });

  test("non-dismissible modals ignore Escape and overlay clicks", async ({ page }) => {
    const scope = preview(page, "modal-non-dismissible");
    await scope.getByRole("button", { name: "Delete project" }).click();
    const dialog = page.getByRole("dialog", { name: "Delete project?" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await page.mouse.click(10, 10);
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Delete" }).click();
    await expect(dialog).toBeHidden();
    await expect(scope.getByText("Project deleted.")).toBeVisible();
  });

  test("nested modals stack and close one at a time", async ({ page }) => {
    await preview(page, "modal-nested").getByRole("button", { name: "Edit profile" }).click();
    const outer = page.getByRole("dialog", { name: "Edit profile" });
    await expect(outer).toBeVisible();
    const innerTrigger = outer.getByRole("button", { name: "Change avatar" });
    await innerTrigger.click();
    const inner = page.getByRole("dialog", { name: "Change avatar" });
    await expect(inner).toBeVisible();

    // The inner modal is on top of the outer one.
    const box = await inner.boundingBox();
    if (!box) throw new Error("no box");
    const topmost = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest("[role=dialog]")?.getAttribute("aria-labelledby"),
      { x: box.x + box.width / 2, y: box.y + 20 },
    );
    expect(topmost).toBe(await inner.getAttribute("aria-labelledby"));

    await page.keyboard.press("Escape");
    await expect(inner).toBeHidden();
    await expect(outer).toBeVisible();
    await expect(innerTrigger).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(outer).toBeHidden();
    await expect(page.locator("[data-slot=modal-overlay]")).toHaveCount(0);
  });

  test("preventScrolling=false keeps focus inside and closes on overlay click", async ({ page }) => {
    const trigger = preview(page, "modal-scrollable-page").getByRole("button", { name: "Open without scroll lock" });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Page still scrolls" });
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    await page.mouse.click(10, 10);
    await expect(dialog).toBeHidden();
  });

  test("opens instantly with reduced motion", async ({ page }) => {
    await reduceMotion(page);
    await preview(page, "modal-demo").getByRole("button", { name: "Open modal" }).click();
    const dialog = page.getByRole("dialog", { name: "Modal Header" });
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
    await preview(page, "modal-demo").getByRole("button", { name: "Open modal" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(700);
    await expectNoA11yViolations(page, "[role=dialog]");
  });
});
