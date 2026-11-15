import { expect, test, type Locator } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

/** The floating label is "floated" when it is scaled down to 0.8. */
async function labelScale(label: Locator): Promise<string> {
  return label.evaluate((el) => getComputedStyle(el).scale);
}

test.describe("TextField", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "text-field");
  });

  test("label is linked to the input and floats on focus and when filled", async ({ page }) => {
    await reduceMotion(page);
    const scope = preview(page, "text-field-demo");
    const input = scope.getByLabel("First name");
    const label = scope.locator("label", { hasText: "First name" });
    await expect(input).toBeVisible();
    expect(await labelScale(label)).toBe("none");

    await label.click({ force: true }); // pointer-events: none, the click lands on the input
    await expect(input).toBeFocused();
    await expect.poll(() => labelScale(label)).toBe("0.8");
    const color = await label.evaluate((el) => getComputedStyle(el).color);
    const secondary = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.color = "var(--secondary)";
      document.body.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    });
    expect(color).toBe(secondary);

    await input.fill("Ada");
    await input.blur();
    await expect.poll(() => labelScale(label)).toBe("0.8");
    await input.fill("");
    await input.blur();
    await expect.poll(() => labelScale(label)).toBe("none");
  });

  test("focus shows the secondary underline", async ({ page }) => {
    const input = preview(page, "text-field-demo").getByLabel("Last name");
    await input.focus();
    await expect.poll(() => input.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe("none");
  });

  test("programmatic values float the label without any JS call", async ({ page }) => {
    await reduceMotion(page);
    const scope = preview(page, "text-field-prefilled");
    const input = scope.getByLabel("City");
    const label = scope.locator("label", { hasText: "City" });
    expect(await labelScale(label)).toBe("none");
    await scope.getByRole("button", { name: "Fill city" }).click();
    await expect(input).toHaveValue("Amsterdam");
    await expect.poll(() => labelScale(label)).toBe("0.8");
    await scope.getByRole("button", { name: "Clear" }).click();
    await expect(input).toHaveValue("");
    await expect.poll(() => labelScale(label)).toBe("none");
  });

  test("placeholder and date inputs keep the label floated", async ({ page }) => {
    const scope = preview(page, "text-field-prefilled");
    await expect.poll(() => labelScale(scope.locator("label", { hasText: "Search" }))).toBe("0.8");
    await expect.poll(() => labelScale(scope.locator("label", { hasText: "Start date" }))).toBe("0.8");
  });

  test("disabled fields are disabled with a dotted underline", async ({ page }) => {
    const input = preview(page, "text-field-demo").getByLabel("Disabled");
    await expect(input).toBeDisabled();
    expect(await input.evaluate((el) => getComputedStyle(el).borderBottomStyle)).toBe("dotted");
  });

  test("helper text is linked with aria-describedby", async ({ page }) => {
    const input = preview(page, "text-field-helper").getByLabel("Website");
    await expect(input).toHaveAccessibleDescription("Include https://");
  });

  test("error message sets aria-invalid, is announced and clears when fixed", async ({ page }) => {
    const scope = preview(page, "text-field-helper");
    const input = scope.getByLabel("Email");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(scope.getByRole("alert")).toHaveText("Enter a valid email address");
    await expect(input).toHaveAccessibleDescription("Enter a valid email address");
    await input.fill("ada@example.com");
    await expect(input).not.toHaveAttribute("aria-invalid", "true");
    await expect(scope.getByRole("alert")).toHaveCount(0);
    await expect(input).toHaveAttribute("data-status", "success");
  });

  test("character counter counts, enforces maxLength and announces politely", async ({ page }) => {
    const scope = preview(page, "text-field-counter");
    const input = scope.getByLabel("Tweet");
    const counter = scope.locator('[data-slot="text-field-counter"]').first();
    await expect(counter).toContainText("0/20");
    await input.pressSequentially("Hello");
    await expect(counter).toContainText("5/20");
    await input.fill("x".repeat(30));
    await expect(input).toHaveValue("x".repeat(20));
    await expect(scope.locator('[aria-live="polite"]').first()).toHaveText(/20 of 20 characters/, { timeout: 3000 });
  });

  test("soft limit lets the user type past maxLength and flags the field", async ({ page }) => {
    const scope = preview(page, "text-field-counter");
    const input = scope.getByLabel("Bio (soft limit)");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(scope.locator('[data-over="true"]')).toContainText("15/10");
    await input.fill("Short");
    await expect(input).not.toHaveAttribute("aria-invalid", "true");
  });

  test("validate colors the field only after interaction", async ({ page }) => {
    const input = preview(page, "text-field-demo").getByLabel("Email");
    const border = (): Promise<string> => input.evaluate((el) => getComputedStyle(el).borderBottomColor);
    const initial = await border();
    await input.fill("nope");
    await input.blur();
    await expect.poll(border).not.toBe(initial);
  });

  test("prefix icon turns secondary on focus", async ({ page }) => {
    const scope = preview(page, "text-field-prefix");
    const prefix = scope.locator('[data-slot="text-field-prefix"]').first();
    const before = await prefix.evaluate((el) => getComputedStyle(el).color);
    await scope.getByLabel("Username").focus();
    await expect.poll(() => prefix.evaluate((el) => getComputedStyle(el).color)).not.toBe(before);
  });

  test("outlined variant renders and supports errors", async ({ page }) => {
    const scope = preview(page, "text-field-outlined");
    await expect(scope.getByLabel("Code")).toHaveAttribute("aria-invalid", "true");
    await expect(scope.getByLabel("Company")).toHaveCSS("border-top-style", "solid");
  });

  test("submits values in a form, validates required and resets the counter", async ({ page }) => {
    const scope = preview(page, "text-field-form");
    const output = scope.getByRole("status", { name: "Submitted values" }).or(scope.locator("output"));
    await scope.getByRole("button", { name: "Submit" }).click();
    await expect(output).toHaveText("");
    expect(await scope.getByLabel("Name").evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
    await scope.getByLabel("Name").fill("Grace");
    await scope.getByLabel("Age").fill("42");
    await scope.getByRole("button", { name: "Submit" }).click();
    await expect(output).toHaveText('{"name":"Grace","age":"42"}');
    await scope.getByRole("button", { name: "Reset" }).click();
    await expect(scope.getByLabel("Name")).toHaveValue("");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
