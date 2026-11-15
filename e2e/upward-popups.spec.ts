import { expect, type Locator, type Page, test } from "@playwright/test";

import { gotoComponent, preview } from "./utils";

// When there is no room below a field, its popup flips above it. Materialize let the list
// cover the floated label; here the popup must end above the label.

/** Scroll so `control` sits near the bottom of the viewport, leaving no room below it. */
async function pinToViewportBottom(page: Page, control: Locator): Promise<void> {
  await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.style.height = "100vh";
    document.querySelector("main")!.prepend(spacer);
  });
  await control.evaluate((el) => window.scrollBy(0, el.getBoundingClientRect().bottom - window.innerHeight + 48));
}

async function expectAboveLabel(popup: Locator, label: Locator): Promise<void> {
  await expect(popup).toBeVisible();
  // Let the open animation and the label float transition settle.
  await popup.page().waitForTimeout(350);
  const [popupBox, labelBox] = await Promise.all([popup.boundingBox(), label.boundingBox()]);
  expect(popupBox && labelBox).toBeTruthy();
  expect(popupBox!.y).toBeGreaterThanOrEqual(0);
  expect(popupBox!.y + popupBox!.height).toBeLessThanOrEqual(labelBox!.y + 1);
}

test.describe("Popups that open upward clear the floated label", () => {
  test.beforeEach(async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop layout");
    await page.setViewportSize({ width: 1280, height: 640 });
  });

  test("Select", async ({ page }) => {
    await gotoComponent(page, "select");
    const scope = preview(page, "select-demo");
    const trigger = scope.getByRole("combobox", { name: /Materialize select/ });
    await pinToViewportBottom(page, trigger);
    await trigger.click();
    await expectAboveLabel(page.locator('[data-slot="select-content"]'), scope.locator("label").first());
  });

  test("MultiSelect", async ({ page }) => {
    await gotoComponent(page, "select");
    const scope = preview(page, "select-multiple");
    const trigger = scope.getByRole("combobox", { name: /^Toppings/ }).first();
    await pinToViewportBottom(page, trigger);
    await trigger.click();
    await expectAboveLabel(page.locator('[data-slot="multi-select-content"]'), scope.locator("label").first());
  });

  test("Autocomplete", async ({ page }) => {
    await gotoComponent(page, "autocomplete");
    const scope = preview(page, "autocomplete-demo");
    const input = scope.getByRole("combobox", { name: "Fruit" });
    await pinToViewportBottom(page, input);
    await input.fill("a");
    await expectAboveLabel(page.locator('[data-slot="autocomplete-content"]'), scope.locator("label").first());
  });
});
