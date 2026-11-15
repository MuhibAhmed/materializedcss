import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

test.describe("Radio Group", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "radio-group");
  });

  test("renders a labelled radiogroup with the default value", async ({ page }) => {
    const demo = preview(page, "radio-group-demo");
    await expect(demo.getByRole("radiogroup", { name: "Favorite color" })).toBeVisible();
    await expect(demo.getByRole("radio", { name: "Yellow" })).toBeChecked();
    await expect(demo.getByRole("radio", { name: "Red" })).not.toBeChecked();
  });

  test("selects with the mouse on the circle and on the label", async ({ page }) => {
    const demo = preview(page, "radio-group-demo");
    await demo.getByRole("radio", { name: "Red" }).click();
    await expect(demo.getByRole("radio", { name: "Red" })).toBeChecked();
    await expect(demo.getByRole("radio", { name: "Yellow" })).not.toBeChecked();
    await demo.getByText("Green", { exact: true }).click();
    await expect(demo.getByRole("radio", { name: "Green" })).toBeChecked();
  });

  test("checked dot scales to 1.02 (default) and 0.5 (with gap)", async ({ page }) => {
    const dot = preview(page, "radio-group-demo").getByRole("radio", { name: "Yellow" }).locator("[data-slot=radio-group-dot]");
    await expect.poll(() => dot.evaluate((el) => getComputedStyle(el).scale)).toBe("1.02");
    const gapDot = preview(page, "radio-group-with-gap")
      .getByRole("radio", { name: "Standard" })
      .locator("[data-slot=radio-group-dot]");
    await expect.poll(() => gapDot.evaluate((el) => getComputedStyle(el).scale)).toBe("0.5");
  });

  test("arrow keys move and select, skipping disabled items", async ({ page }) => {
    const demo = preview(page, "radio-group-demo");
    const yellow = demo.getByRole("radio", { name: "Yellow" });
    await yellow.focus();
    await page.keyboard.press("ArrowDown", { delay: 50 });
    await expect(demo.getByRole("radio", { name: "Green" })).toBeChecked();
    await expect(demo.getByRole("radio", { name: "Green" })).toBeFocused();
    await page.keyboard.press("ArrowDown", { delay: 50 }); // Brown is disabled, wraps to Red.
    await expect(demo.getByRole("radio", { name: "Red" })).toBeChecked();
    await page.keyboard.press("ArrowUp", { delay: 50 });
    await expect(demo.getByRole("radio", { name: "Green" })).toBeChecked();
    await expect(demo.getByRole("radio", { name: "Brown" })).toBeDisabled();
  });

  test("is a single tab stop with a visible focus halo", async ({ page }) => {
    const demo = preview(page, "radio-group-demo");
    const yellow = demo.getByRole("radio", { name: "Yellow" });
    await demo.getByRole("radio", { name: "Red" }).evaluate((el) => (el as HTMLElement).blur());
    await yellow.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(yellow).toBeFocused();
    await expect.poll(() => yellow.evaluate((el) => getComputedStyle(el, "::before").opacity)).toBe("1");
    await page.keyboard.press("Tab");
    const focusedInGroup = await demo.evaluate((el) => el.contains(document.activeElement));
    expect(focusedInGroup).toBe(false);
  });

  test("horizontal groups use left/right arrows", async ({ page }) => {
    const ex = preview(page, "radio-group-horizontal");
    await ex.getByRole("radio", { name: "Medium" }).focus();
    await page.keyboard.press("ArrowRight", { delay: 50 });
    await expect(ex.getByRole("radio", { name: "Large" })).toBeChecked();
  });

  test("controlled value updates from outside", async ({ page }) => {
    const ex = preview(page, "radio-group-controlled");
    await expect(ex.getByRole("radio", { name: "Monthly" })).toBeChecked();
    await ex.getByRole("button", { name: "Switch to yearly" }).click();
    await expect(ex.getByRole("radio", { name: "Yearly" })).toBeChecked();
    await expect(ex.getByText("Selected plan: yearly")).toBeVisible();
    await ex.getByRole("radio", { name: "Monthly" }).click();
    await expect(ex.getByText("Selected plan: monthly")).toBeVisible();
  });

  test("submits the selected value and honours required", async ({ page }) => {
    const form = preview(page, "radio-group-form");
    const output = form.locator("output");
    await form.getByRole("button", { name: "Submit" }).click();
    await expect(output).toHaveText("");
    await form.getByRole("radio", { name: "Office" }).click();
    await form.getByRole("button", { name: "Submit" }).click();
    await expect(output).toHaveText(JSON.stringify({ delivery: "office" }));
  });

  test("description is linked with aria-describedby", async ({ page }) => {
    await expect(preview(page, "radio-group-with-gap").getByRole("radio", { name: "Express" })).toHaveAccessibleDescription(
      "1 to 2 business days",
    );
  });

  test("turns off transitions with reduced motion", async ({ page }) => {
    await reduceMotion(page);
    const dot = preview(page, "radio-group-demo").getByRole("radio", { name: "Red" }).locator("[data-slot=radio-group-dot]");
    await expect.poll(() => dot.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe("none");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
