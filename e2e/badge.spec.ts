import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

test.describe("Badge", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "badge");
  });

  test("new badges show a readable caption", async ({ page }) => {
    const demo = preview(page, "badge-demo");
    const items = demo.getByRole("listitem");
    await expect(items).toHaveCount(4);
    await expect(items.nth(1)).toHaveText(/Alan\s*4\s*new/);
    await expect(items.nth(2)).toContainText("custom caption");
    // The caption is real text in the accessibility tree.
    await expect(demo.locator("[data-slot=badge-caption]").first()).toHaveText("new");
  });

  test("matches Materialize metrics", async ({ page }) => {
    const badge = preview(page, "badge-demo").locator("[data-slot=badge][data-variant=new]").first();
    await expect(badge).toHaveCSS("height", "22px");
    await expect(badge).toHaveCSS("min-width", "48px");
    await expect(badge).toHaveCSS("font-weight", "300");
    await expect(badge).toHaveCSS("border-radius", "2px");
  });

  test("caption can be hidden and colors applied", async ({ page }) => {
    const colors = preview(page, "badge-colors");
    await expect(colors.getByText("Beta", { exact: true })).toBeVisible();
    await expect(colors.locator("[data-slot=badge]").filter({ hasText: "Beta" }).locator("[data-slot=badge-caption]")).toHaveCount(0);
    await expect(colors.getByText(/2\s*failed/)).toBeVisible();
  });

  test("badges sit inside navbar links", async ({ page }) => {
    const link = preview(page, "badge-navbar").getByRole("link", { name: /Inbox 4 new/ });
    await expect(link).toBeVisible();
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
