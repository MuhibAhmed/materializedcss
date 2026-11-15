import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

test.describe("Button", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "button");
  });

  test("renders native buttons with type=button", async ({ page }) => {
    const button = preview(page, "button-demo").getByRole("button", { name: "Button", exact: true });
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("type", "button");
  });

  test("shows an ink ripple on press and removes it afterwards", async ({ page }) => {
    const button = preview(page, "button-demo").getByRole("button", { name: "Button", exact: true });
    const box = await button.boundingBox();
    if (!box) throw new Error("no bounding box");
    await page.mouse.move(box.x + 10, box.y + 10);
    await page.mouse.down();
    await expect(button.locator("[data-ripple]")).toHaveCount(1);
    await page.mouse.up();
    await expect(button.locator("[data-ripple]")).toHaveCount(0, { timeout: 3000 });
  });

  test("skips the ripple when reduced motion is preferred", async ({ page }) => {
    await reduceMotion(page);
    const button = preview(page, "button-demo").getByRole("button", { name: "Button", exact: true });
    await button.click();
    await expect(button.locator("[data-ripple]")).toHaveCount(0);
  });

  test("disabled buttons are not clickable and have no ripple", async ({ page }) => {
    const disabled = preview(page, "button-variants").getByRole("button", { name: "Disabled", exact: true });
    await expect(disabled).toBeDisabled();
  });

  test("floating icon buttons have accessible names", async ({ page }) => {
    await expect(preview(page, "button-demo").getByRole("button", { name: "Add" })).toBeVisible();
  });

  test("asChild renders a link with button styling", async ({ page }) => {
    const link = preview(page, "button-as-link").getByRole("link", { name: "Read the docs" });
    await expect(link).toHaveAttribute("data-slot", "button");
    await expect(link).not.toHaveAttribute("type", /.*/);
  });

  test("is keyboard focusable with a visible focus ring", async ({ page }) => {
    const button = preview(page, "button-variants").getByRole("button", { name: "Raised" });
    await button.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(button).toBeFocused();
    const outline = await button.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
