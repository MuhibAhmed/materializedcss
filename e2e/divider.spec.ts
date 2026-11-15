import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

test.describe("Divider", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "divider");
  });

  test("horizontal divider is a 1px separator", async ({ page }) => {
    const divider = preview(page, "divider-demo").getByRole("separator");
    await expect(divider).toHaveCount(1);
    await expect(divider).toHaveCSS("height", "1px");
    await expect(divider).not.toHaveAttribute("aria-orientation", /.*/);
  });

  test("decorative vertical dividers are hidden from assistive technology", async ({ page }) => {
    const demo = preview(page, "divider-vertical");
    await expect(demo.getByRole("separator")).toHaveCount(0);
    const dividers = demo.locator("[data-slot=divider]");
    await expect(dividers).toHaveCount(2);
    await expect(dividers.first()).toHaveAttribute("role", "none");
    await expect(dividers.first()).toHaveCSS("width", "1px");
    const height = await dividers.first().evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeGreaterThan(10);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
