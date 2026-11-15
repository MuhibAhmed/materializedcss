import { expect, test, type Locator } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

function chips(scope: Locator): Locator {
  return scope.getByRole("listitem");
}

test.describe("ChipsInput", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "chips-input");
  });

  test("renders default chips and adds with Enter and comma", async ({ page }) => {
    const scope = preview(page, "chips-input-demo");
    await expect(chips(scope)).toHaveCount(2);
    const input = scope.getByLabel("Tags", { exact: true });
    await expect(input).toHaveAttribute("placeholder", "+Tag");
    await input.click();
    await input.pressSequentially("Vite");
    await page.keyboard.press("Enter");
    await input.pressSequentially("Node,");
    await expect(chips(scope)).toHaveCount(4);
    await expect(chips(scope).nth(3)).toContainText("Node");
    await expect(input).toHaveValue("");
    // Duplicates are ignored.
    await input.pressSequentially("Vite");
    await page.keyboard.press("Enter");
    await expect(chips(scope)).toHaveCount(4);
  });

  test("Backspace on empty input focuses the last chip, then removes it", async ({ page }) => {
    const scope = preview(page, "chips-input-demo");
    const input = scope.getByLabel("Tags", { exact: true });
    await input.click();
    await page.keyboard.press("Backspace");
    await expect(chips(scope).last()).toBeFocused();
    await page.keyboard.press("Backspace");
    await expect(chips(scope)).toHaveCount(1);
    await expect(chips(scope).first()).toBeFocused();
    await expect(scope.locator('[aria-live="polite"]').last()).toHaveText("Removed Tailwind");
  });

  test("arrow keys move between chips (roving tabindex) and back to the input", async ({ page }) => {
    const scope = preview(page, "chips-input-demo");
    const input = scope.getByLabel("Tags", { exact: true });
    await input.click();
    await page.keyboard.press("ArrowLeft");
    await expect(chips(scope).nth(1)).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(chips(scope).nth(0)).toBeFocused();
    await expect(chips(scope).nth(0)).toHaveAttribute("tabindex", "0");
    await expect(chips(scope).nth(1)).toHaveAttribute("tabindex", "-1");
    await page.keyboard.press("End");
    await expect(chips(scope).nth(1)).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(input).toBeFocused();
    // Delete on a focused chip removes it.
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Home");
    await page.keyboard.press("Delete");
    await expect(chips(scope)).toHaveCount(1);
    await expect(chips(scope).first()).toContainText("Tailwind");
  });

  test("remove buttons are labelled and work with the mouse", async ({ page }) => {
    const scope = preview(page, "chips-input-demo");
    await scope.getByRole("button", { name: "Remove React" }).click();
    await expect(chips(scope)).toHaveCount(1);
    await expect(scope.getByLabel("Tags", { exact: true })).toBeFocused();
  });

  test("suggestions: filtered, keyboard-selectable, excluded once added, not clipped", async ({ page }) => {
    const scope = preview(page, "chips-input-suggestions");
    const input = scope.getByRole("combobox", { name: "Languages" });
    await input.pressSequentially("ja");
    const listbox = page.getByRole("listbox", { name: "Languages suggestions" });
    await expect(listbox.getByRole("option")).toHaveText(["Java", "JavaScript"]);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(chips(scope)).toHaveCount(1);
    await expect(chips(scope).first()).toContainText("JavaScript");
    await input.pressSequentially("ja");
    await expect(listbox.getByRole("option")).toHaveText(["Java"]);
    await listbox.getByRole("option", { name: "Java" }).click();
    await expect(chips(scope)).toHaveCount(2);
    await expect(input).toBeFocused();
  });

  test("limit caps the number of chips", async ({ page }) => {
    const scope = preview(page, "chips-input-suggestions");
    const input = scope.getByRole("combobox", { name: "Languages" });
    for (const tag of ["a", "b", "c", "d", "e", "f"]) {
      await input.pressSequentially(tag);
      await page.keyboard.press("Escape");
      await page.keyboard.press("Enter");
    }
    await expect(chips(scope)).toHaveCount(5);
  });

  test("controlled value updates from outside and fires onAdd/onDelete", async ({ page }) => {
    const scope = preview(page, "chips-input-controlled");
    await scope.getByRole("button", { name: "Load team" }).click();
    await expect(chips(scope)).toHaveCount(2);
    const input = scope.getByLabel("Recipients", { exact: true });
    await input.pressSequentially("linus@example.com");
    await page.keyboard.press("Enter");
    await expect(scope.locator("span.text-sm", { hasText: "Added linus@example.com" })).toBeVisible();
    await input.pressSequentially("x@example.com,");
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(scope.getByRole("alert")).toHaveText("Too many recipients (max 3)");
    await scope.getByRole("button", { name: "Remove x@example.com" }).click();
    await expect(scope.locator("span.text-sm", { hasText: "Removed x@example.com" })).toBeVisible();
    await scope.getByRole("button", { name: "Clear" }).click();
    await expect(chips(scope)).toHaveCount(0);
  });

  test("submits each chip under its name and enforces required", async ({ page }) => {
    const scope = preview(page, "chips-input-form");
    const input = scope.getByLabel("Skills", { exact: true });
    await scope.getByRole("button", { name: "Save" }).click();
    await expect(scope.locator("output")).toHaveText("");
    expect(await input.evaluate((el: HTMLInputElement) => el.validity.valueMissing)).toBe(true);
    await input.pressSequentially("CSS,HTML,");
    await page.keyboard.press("Enter"); // empty input: Enter submits
    await expect(scope.locator("output")).toHaveText('{"skills":["CSS","HTML"]}');
  });

  test("pasting a comma-separated list adds several chips", async ({ page }) => {
    const scope = preview(page, "chips-input-form");
    const input = scope.getByLabel("Skills", { exact: true });
    await input.focus();
    await input.evaluate((el) => {
      const data = new DataTransfer();
      data.setData("text", "Go, Rust, Zig");
      el.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    });
    await expect(chips(scope)).toHaveText(["Go", "Rust", "Zig"].map((t) => new RegExp(t)));
  });

  test("has no serious accessibility violations", async ({ page, isMobile }) => {
    // At phone width the docs PropsTable scroll wrapper (docs chrome) is flagged; desktop runs cover this.
    test.skip(isMobile, "docs chrome PropsTable overflow on phones");
    await preview(page, "chips-input-suggestions").getByRole("combobox", { name: "Languages" }).pressSequentially("r");
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
