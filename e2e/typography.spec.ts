import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

test.describe("Typography", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "typography");
  });

  test("headings show the full h1-h6 scale without a second h1", async ({ page }) => {
    const demo = preview(page, "typography-headings");
    await expect(demo.getByRole("heading", { level: 1 })).toHaveCount(0);
    const sizes: number[] = [];
    for (let size = 1; size <= 6; size++) {
      const heading = demo.getByRole("heading", { name: `Heading h${size}` });
      await expect(heading).toBeVisible();
      sizes.push(await heading.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)));
    }
    // Strictly decreasing from 4.2rem to 1.15rem.
    expect(sizes.every((value, index) => index === 0 || value < (sizes[index - 1] ?? 0))).toBe(true);
    await expect(demo.getByRole("heading", { name: "Heading h1" })).toHaveCSS("font-weight", "400");
  });

  test("size can differ from the semantic level", async ({ page }) => {
    const heading = preview(page, "typography-text").getByRole("heading", { level: 2, name: "Release notes" });
    const h4Size = await preview(page, "typography-headings")
      .getByRole("heading", { name: "Heading h4" })
      .evaluate((el) => getComputedStyle(el).fontSize);
    await expect(heading).toHaveCSS("font-size", h4Size);
  });

  test("blockquote has a 5px left border", async ({ page }) => {
    const quote = preview(page, "typography-blockquote").locator("blockquote");
    await expect(quote).toHaveCSS("border-left-width", "5px");
    await expect(quote).toHaveCSS("border-left-style", "solid");
  });

  test("flow text scales with the viewport", async ({ page }) => {
    const text = preview(page, "typography-flow-text").locator("[data-slot=flow-text]");
    await page.setViewportSize({ width: 1400, height: 900 });
    const large = await text.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    await page.setViewportSize({ width: 390, height: 900 });
    const small = await text.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(large).toBeGreaterThan(small);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
