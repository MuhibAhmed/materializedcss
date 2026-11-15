import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

test.describe("Checkbox", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "checkbox");
  });

  test("renders labelled checkboxes with their initial state", async ({ page }) => {
    const demo = preview(page, "checkbox-demo");
    await expect(demo.getByRole("checkbox", { name: "Red" })).toHaveAttribute("aria-checked", "false");
    await expect(demo.getByRole("checkbox", { name: "Yellow" })).toHaveAttribute("aria-checked", "true");
    await expect(demo.getByRole("checkbox", { name: "Filled in" })).toHaveAttribute("data-variant", "filled-in");
    await expect(demo.getByRole("checkbox", { name: "Indeterminate" })).toHaveAttribute("aria-checked", "mixed");
  });

  test("toggles with the mouse, on the box and on the label", async ({ page }) => {
    const demo = preview(page, "checkbox-demo");
    const red = demo.getByRole("checkbox", { name: "Red" });
    await red.click();
    await expect(red).toBeChecked();
    await demo.getByText("Red", { exact: true }).click();
    await expect(red).not.toBeChecked();
  });

  test("checked default checkbox morphs into a rotated tick", async ({ page }) => {
    const box = preview(page, "checkbox-demo").getByRole("checkbox", { name: "Yellow" }).locator("[data-slot=checkbox-box]");
    await expect
      .poll(() => box.evaluate((el) => ({ rotate: getComputedStyle(el).rotate, width: getComputedStyle(el).width })))
      .toEqual({ rotate: "40deg", width: "12px" });
  });

  test("toggles with Space and shows a focus halo", async ({ page }) => {
    const red = preview(page, "checkbox-demo").getByRole("checkbox", { name: "Red" });
    await red.focus();
    await page.keyboard.press("Space");
    await expect(red).toBeChecked();
    await page.keyboard.press("Space");
    await expect(red).not.toBeChecked();
    // Keyboard focus (focus-visible) shows the halo.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(red).toBeFocused();
    await expect.poll(() => red.evaluate((el) => getComputedStyle(el, "::before").opacity)).toBe("1");
  });

  test("disabled checkboxes cannot be toggled", async ({ page }) => {
    const brown = preview(page, "checkbox-demo").getByRole("checkbox", { name: "Brown (disabled)" });
    await expect(brown).toBeDisabled();
    await brown.click({ force: true });
    await expect(brown).not.toBeChecked();
  });

  test("controlled parent checkbox is indeterminate and selects all", async ({ page }) => {
    const ex = preview(page, "checkbox-indeterminate");
    const all = ex.getByRole("checkbox", { name: "All toppings" });
    await expect(all).toHaveAttribute("aria-checked", "mixed");
    await all.click();
    await expect(all).toHaveAttribute("aria-checked", "true");
    for (const name of ["Cheese", "Mushrooms", "Olives"]) await expect(ex.getByRole("checkbox", { name })).toBeChecked();
    await ex.getByRole("checkbox", { name: "Olives" }).click();
    await expect(all).toHaveAttribute("aria-checked", "mixed");
    await all.click();
    await expect(all).toHaveAttribute("aria-checked", "true");
    await all.click();
    await expect(all).toHaveAttribute("aria-checked", "false");
    await expect(ex.getByRole("checkbox", { name: "Cheese" })).not.toBeChecked();
  });

  test("description is linked with aria-describedby", async ({ page }) => {
    const box = preview(page, "checkbox-description").getByRole("checkbox", { name: "Accept terms and conditions" });
    await expect(box).toHaveAccessibleDescription(/Terms of Service/);
  });

  test("submits name/value with forms and honours required", async ({ page }) => {
    const form = preview(page, "checkbox-form");
    const output = form.getByRole("status", { name: "Submitted values" }).or(form.locator("output"));
    await form.getByRole("button", { name: "Submit" }).click();
    await expect(output).toHaveText("");
    await form.getByRole("checkbox", { name: "I accept the terms" }).click();
    await form.getByRole("button", { name: "Submit" }).click();
    await expect(output).toHaveText(JSON.stringify({ newsletter: "yes", terms: "accepted" }));
    await form.getByRole("checkbox", { name: "Subscribe to the newsletter" }).click();
    await form.getByRole("button", { name: "Submit" }).click();
    await expect(output).toHaveText(JSON.stringify({ terms: "accepted" }));
  });

  test("turns off transitions with reduced motion", async ({ page }) => {
    await reduceMotion(page);
    const box = preview(page, "checkbox-demo").getByRole("checkbox", { name: "Red" }).locator("[data-slot=checkbox-box]");
    await expect.poll(() => box.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe("none");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
