import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

test.describe("Chip", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "chip");
  });

  test("renders 32px pills with an avatar image", async ({ page }) => {
    const scope = preview(page, "chip-demo");
    const chip = scope.locator('[data-slot="chip"]', { hasText: "Tag" }).first();
    await expect(chip).toBeVisible();
    const box = await chip.boundingBox();
    expect(Math.round(box?.height ?? 0)).toBe(32);
    expect(await chip.evaluate((el) => getComputedStyle(el).borderRadius)).toBe("16px");
    const img = scope.locator('[data-slot="chip-image"]');
    await expect(img).toHaveAttribute("alt", "");
    expect(Math.round((await img.boundingBox())?.width ?? 0)).toBe(32);
    await expect(scope.locator('[data-slot="chip"][data-selected="true"]')).toHaveText("Selected");
  });

  test("close buttons are labelled and remove the chip (mouse and keyboard)", async ({ page }) => {
    const scope = preview(page, "chip-deletable");
    await scope.getByRole("button", { name: "Remove Design" }).click();
    await expect(scope.getByText("Design", { exact: true })).toHaveCount(0);
    const remove = scope.getByRole("button", { name: "Remove Sales" });
    await remove.focus();
    await page.keyboard.press("Enter");
    await expect(scope.getByText("Sales", { exact: true })).toHaveCount(0);
    await scope.getByRole("button", { name: "Restore" }).click();
    await expect(scope.locator('[data-slot="chip"]')).toHaveCount(4);
  });

  test("asChild filter chips toggle aria-pressed", async ({ page }) => {
    const scope = preview(page, "chip-filter");
    const small = scope.getByRole("button", { name: "Small" });
    await expect(small).toHaveAttribute("aria-pressed", "false");
    await expect(small).toHaveAttribute("data-slot", "chip");
    await small.click();
    await expect(small).toHaveAttribute("aria-pressed", "true");
    await expect(small).toHaveAttribute("data-selected", "true");
    await small.press("Space");
    await expect(small).toHaveAttribute("aria-pressed", "false");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
