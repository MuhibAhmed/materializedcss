import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

test.describe("Autocomplete", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "autocomplete");
  });

  test("is an ARIA combobox that opens a listbox while typing", async ({ page }) => {
    const input = preview(page, "autocomplete-demo").getByRole("combobox", { name: "Fruit" });
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await expect(input).toHaveAttribute("aria-autocomplete", "list");
    await input.pressSequentially("ap");
    await expect(input).toHaveAttribute("aria-expanded", "true");
    const listbox = page.getByRole("listbox", { name: "Fruit" });
    await expect(listbox).toBeVisible();
    await expect(input).toHaveAttribute("aria-controls", (await listbox.getAttribute("id")) ?? "");
    // Matches at the start sort first (Materialize sortFunction).
    await expect(listbox.getByRole("option")).toHaveText(["Apple", "Apricot", "Grape", "Pineapple"]);
  });

  test("highlights the matching text with elements, not HTML", async ({ page }) => {
    const input = preview(page, "autocomplete-demo").getByRole("combobox", { name: "Fruit" });
    await input.fill("<b>an");
    await input.fill("an");
    const highlight = page.getByRole("option", { name: "Banana" }).locator('[data-slot="autocomplete-highlight"]');
    await expect(highlight).toHaveText("an");
    await input.fill('<img src=x onerror="window.__xss=1">');
    await expect(page.locator('[data-slot="autocomplete-status"]')).toHaveText("No results");
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
  });

  test("keyboard: arrows, Home/End, Enter selects, Escape closes", async ({ page }) => {
    const input = preview(page, "autocomplete-demo").getByRole("combobox", { name: "Fruit" });
    await input.pressSequentially("berry");
    const options = page.getByRole("listbox").getByRole("option");
    await expect(options).toHaveCount(2);
    await page.keyboard.press("ArrowDown");
    await expect(options.nth(0)).toHaveAttribute("aria-selected", "true");
    await expect(input).toHaveAttribute("aria-activedescendant", (await options.nth(0).getAttribute("id")) ?? "");
    await page.keyboard.press("End");
    await expect(options.nth(1)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowDown");
    await expect(options.nth(0)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(options.nth(0)).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("Blueberry"); // earlier match sorts first
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await expect(input).toBeFocused();

    await input.fill("ap");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(input).toHaveValue("ap");
  });

  test("mouse click chooses an option and keeps focus", async ({ page }) => {
    const input = preview(page, "autocomplete-images").getByRole("combobox", { name: "Assign to" });
    await input.pressSequentially("gr");
    const option = page.getByRole("option", { name: "Grace Hopper" });
    await expect(option.locator("img")).toBeVisible();
    await option.click();
    await expect(input).toHaveValue("Grace Hopper");
    await expect(input).toBeFocused();
  });

  test("async: shows loading, cancels stale requests and shows results", async ({ page }) => {
    const input = preview(page, "autocomplete-async").getByRole("combobox", { name: "Country" });
    await input.pressSequentially("ger", { delay: 30 });
    await expect(page.locator('[data-slot="autocomplete-status"]')).toHaveText("Loading…");
    await expect(page.getByRole("option")).toHaveText(["Germany", "Nigeria"]);
    await input.fill("zzz");
    await expect(page.locator('[data-slot="autocomplete-status"]')).toHaveText("No countries found");
  });

  test("minLength; controlled value and onAutocomplete", async ({ page }) => {
    const scope = preview(page, "autocomplete-controlled");
    const input = scope.getByRole("combobox", { name: "Language" });
    await input.pressSequentially("j");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await input.pressSequentially("a");
    await expect(page.getByRole("option")).toHaveCount(2);
    await input.fill("");
    await input.pressSequentially("ru");
    await page.getByRole("option", { name: "Ruby" }).click();
    await expect(scope.getByText("Chosen: Ruby")).toBeVisible();
    await scope.getByRole("button", { name: "Set TypeScript" }).click();
    await expect(input).toHaveValue("TypeScript");
  });

  test("the list is not clipped by an overflow-hidden container", async ({ page }) => {
    const scope = preview(page, "autocomplete-overflow");
    const box = scope.locator(".overflow-hidden").first();
    const input = scope.getByRole("combobox", { name: "City" });
    await input.pressSequentially("b");
    const listbox = page.getByRole("listbox", { name: "City" });
    await expect(listbox.getByRole("option")).toHaveCount(5);
    const container = await box.boundingBox();
    const list = await listbox.boundingBox();
    if (!container || !list) throw new Error("missing boxes");
    // Portalled: the list escapes the clipping box (below, or flipped above near the viewport edge).
    const escapes = list.y + list.height > container.y + container.height + 1 || list.y < container.y - 1;
    expect(escapes).toBe(true);
    expect(list.height).toBeGreaterThan(container.height);
    // The last option is really visible (hit-testable), not hidden under the clip.
    const last = listbox.getByRole("option").last();
    await last.scrollIntoViewIfNeeded();
    await last.click();
    await expect(input).toHaveValue("Brussels");
  });

  test("submits the typed value in a form", async ({ page }) => {
    const scope = preview(page, "autocomplete-form");
    const input = scope.getByRole("combobox", { name: "Framework" });
    await input.pressSequentially("sv");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await scope.getByRole("button", { name: "Submit" }).click();
    await expect(scope.locator("output")).toHaveText('{"framework":"Svelte"}');
  });

  test("has no serious accessibility violations (closed and open)", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
    await preview(page, "autocomplete-demo").getByRole("combobox", { name: "Fruit" }).pressSequentially("ap");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await expectNoA11yViolations(page, "[data-slot=autocomplete-content]");
  });
});
