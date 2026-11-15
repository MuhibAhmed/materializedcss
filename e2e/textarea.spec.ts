import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

test.describe("Textarea", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "textarea");
  });

  test("renders a labelled textarea with helper text", async ({ page }) => {
    const textarea = preview(page, "textarea-demo").getByLabel("Message");
    await expect(textarea).toBeVisible();
    expect(await textarea.evaluate((el) => el.tagName)).toBe("TEXTAREA");
    await expect(textarea).toHaveAccessibleDescription("The field grows as you type");
  });

  test("grows with its content and shrinks back", async ({ page }) => {
    const textarea = preview(page, "textarea-demo").getByLabel("Message");
    const height = (): Promise<number> => textarea.evaluate((el) => el.getBoundingClientRect().height);
    const initial = await height();
    await textarea.fill("one\ntwo\nthree\nfour\nfive");
    await expect.poll(height).toBeGreaterThan(initial + 50);
    await textarea.fill("");
    await expect.poll(height).toBeLessThan(initial + 2);
  });

  test("Enter inserts a new line", async ({ page }) => {
    const textarea = preview(page, "textarea-demo").getByLabel("Message");
    await textarea.click();
    await page.keyboard.type("a");
    await page.keyboard.press("Enter");
    await page.keyboard.type("b");
    await expect(textarea).toHaveValue("a\nb");
  });

  test("maxRows caps the height and then scrolls", async ({ page }) => {
    const textarea = preview(page, "textarea-rows").getByLabel("At most 4 rows");
    await textarea.fill(Array.from({ length: 12 }, (_, i) => `line ${i}`).join("\n"));
    const { height, scroll } = await textarea.evaluate((el) => ({ height: el.clientHeight, scroll: el.scrollHeight }));
    expect(scroll).toBeGreaterThan(height);
    expect(height).toBeLessThan(140);
  });

  test("minRows sets the starting height", async ({ page }) => {
    const scope = preview(page, "textarea-rows");
    const tall = await scope.getByLabel("At least 3 rows").evaluate((el) => el.getBoundingClientRect().height);
    const short = await scope.getByLabel("At most 4 rows").evaluate((el) => el.getBoundingClientRect().height);
    expect(tall).toBeGreaterThan(short + 40);
  });

  test("counter updates while typing", async ({ page }) => {
    const scope = preview(page, "textarea-counter");
    await scope.getByLabel("Short bio").pressSequentially("Hello");
    await expect(scope.locator('[data-slot="text-field-counter"]')).toContainText("5/120");
  });

  test("controlled values resize, float the label and validate", async ({ page }) => {
    const scope = preview(page, "textarea-controlled");
    const textarea = scope.getByLabel("Notes");
    const label = scope.locator("label", { hasText: "Notes" });
    const initial = await textarea.evaluate((el) => el.getBoundingClientRect().height);
    await scope.getByRole("button", { name: "Insert quote" }).click();
    await expect(textarea).toHaveValue(/Material is the metaphor/);
    await expect.poll(() => label.evaluate((el) => getComputedStyle(el).scale)).toBe("0.8");
    await expect.poll(() => textarea.evaluate((el) => el.getBoundingClientRect().height)).toBeGreaterThan(initial);
    await textarea.fill("short");
    await expect(textarea).toHaveAttribute("aria-invalid", "true");
    await expect(scope.getByRole("alert")).toHaveText("Write at least 10 characters");
  });

  test("disabled textarea", async ({ page }) => {
    await expect(preview(page, "textarea-rows").getByLabel("Disabled")).toBeDisabled();
  });

  test("submits its value in a form", async ({ page }) => {
    const scope = preview(page, "textarea-form");
    await scope.getByLabel("Feedback").fill("Great\nwork");
    await scope.getByRole("button", { name: "Send" }).click();
    await expect(scope.locator("output")).toHaveText('{"feedback":"Great\\nwork"}');
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
