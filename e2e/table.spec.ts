import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

test.describe("Table", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "table");
  });

  test("renders semantic headers and rows", async ({ page }) => {
    const table = preview(page, "table-demo").getByRole("table");
    await expect(table.getByRole("columnheader")).toHaveCount(3);
    await expect(table.getByRole("row")).toHaveCount(4);
    await expect(table.getByRole("columnheader", { name: "Name", exact: true })).toHaveAttribute("scope", "col");
    await expect(table.getByRole("cell", { name: "Eclair" })).toHaveCSS("padding-top", "15px");
    await expect(table.getByRole("row").nth(1)).toHaveCSS("border-bottom-width", "1px");
  });

  test("striped, highlight and centered variants", async ({ page }) => {
    const tables = preview(page, "table-variants").getByRole("table");
    await expect(tables).toHaveCount(3);

    const striped = tables.nth(0);
    const [odd, even] = await striped
      .locator("tbody tr")
      .evaluateAll((rows) => rows.slice(0, 2).map((row) => getComputedStyle(row).backgroundColor));
    expect(odd).not.toBe(even);

    const highlightRow = tables.nth(1).getByRole("row").filter({ hasText: "Alan" });
    const before = await highlightRow.evaluate((el) => getComputedStyle(el).backgroundColor);
    await highlightRow.hover();
    await expect.poll(async () => highlightRow.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(before);

    await expect(tables.nth(2).getByRole("cell", { name: "Eclair" })).toHaveCSS("text-align", "center");
  });

  test("responsive table scrolls inside a focusable labelled region", async ({ page }) => {
    const region = preview(page, "table-responsive").getByRole("region", { name: "Monthly sales (scrollable)" });
    await expect(region).toHaveAttribute("tabindex", "0");
    const scrolls = await region.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(scrolls).toBe(true);
    await region.focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(async () => region.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);

    const table = region.getByRole("table");
    await expect(table.getByRole("rowheader", { name: "North" })).toBeVisible();
    await expect(table.locator("caption")).toHaveText("Monthly sales in thousands of units.");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
