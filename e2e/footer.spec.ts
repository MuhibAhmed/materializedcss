import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

test.describe("Footer", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "footer");
  });

  test("renders a contentinfo landmark with headings and links", async ({ page }) => {
    const demo = preview(page, "footer-demo");
    const footer = demo.locator("[data-slot=footer]");
    await expect(footer).toBeVisible();
    await expect(footer).toHaveJSProperty("tagName", "FOOTER");
    await expect(demo.getByRole("heading", { name: "Footer Content" })).toBeVisible();
    const nav = demo.getByRole("navigation", { name: "Footer" });
    await expect(nav.getByRole("link")).toHaveCount(4);
    await expect(demo.getByText("© 2026 Copyright Text")).toBeVisible();
    await expect(demo.getByRole("link", { name: "More Links" })).toBeVisible();
  });

  test("uses the primary color with a two-column layout on desktop", async ({ page }) => {
    const demo = preview(page, "footer-demo");
    const sections = demo.locator("[data-slot=footer-section]");
    const [a, b] = await sections.evaluateAll((els) => els.map((el) => el.getBoundingClientRect()));
    expect(a && b && b.x > a.x && Math.abs(b.y - a.y) < 2).toBe(true);

    await page.setViewportSize({ width: 390, height: 800 });
    const [c, d] = await sections.evaluateAll((els) => els.map((el) => el.getBoundingClientRect()));
    expect(c && d && d.y > c.y).toBe(true);
  });

  test("links are keyboard focusable", async ({ page }) => {
    const nav = preview(page, "footer-demo").getByRole("navigation", { name: "Footer" });
    await nav.getByRole("link", { name: "Link 1" }).focus();
    await page.keyboard.press("Tab");
    await expect(nav.getByRole("link", { name: "Link 2" })).toBeFocused();
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
