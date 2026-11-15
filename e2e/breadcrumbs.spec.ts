import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

test.describe("Breadcrumbs", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "breadcrumbs");
  });

  test("renders a labelled nav with an ordered list", async ({ page }) => {
    const nav = preview(page, "breadcrumbs-demo").getByRole("navigation", { name: "Breadcrumb" });
    await expect(nav).toBeVisible();
    await expect(nav.locator("ol")).toHaveCount(1);
    await expect(nav.getByRole("link")).toHaveCount(2);
    // Separators are hidden from assistive technology.
    await expect(nav.getByRole("listitem")).toHaveCount(3);
    await expect(nav.locator("[data-slot=breadcrumb-separator]")).toHaveCount(2);
    await expect(nav.locator("[data-slot=breadcrumb-separator]").first()).toHaveAttribute("aria-hidden", "true");
  });

  test("marks the current page", async ({ page }) => {
    const nav = preview(page, "breadcrumbs-demo").getByRole("navigation", { name: "Breadcrumb" });
    const current = nav.getByText("Third");
    await expect(current).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "First" })).not.toHaveAttribute("aria-current", /.*/);
  });

  test("links are keyboard focusable in order", async ({ page }) => {
    const nav = preview(page, "breadcrumbs-standalone").getByRole("navigation", { name: "Breadcrumb (files)" });
    await nav.getByRole("link", { name: "Home" }).focus();
    await page.keyboard.press("Tab");
    await expect(nav.getByRole("link", { name: "Documents" })).toBeFocused();
  });

  test("inherits the navbar text color", async ({ page }) => {
    const link = preview(page, "breadcrumbs-demo").getByRole("link", { name: "First" });
    const [color, navColor] = await link.evaluate((el) => [
      getComputedStyle(el).color,
      getComputedStyle(el.closest("[data-slot=navbar]") as Element).color,
    ]);
    expect(color).toBe(navColor);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
