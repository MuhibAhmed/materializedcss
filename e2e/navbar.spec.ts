import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

test.describe("Navbar", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "navbar");
  });

  test("renders brand and a labelled nav with the active link", async ({ page }) => {
    const demo = preview(page, "navbar-demo");
    // A <header> inside the docs <main> is not a banner landmark, so check the element.
    await expect(demo.locator("[data-slot=navbar]")).toHaveJSProperty("tagName", "HEADER");
    await expect(demo.getByRole("link", { name: "Logo" })).toBeVisible();
    const nav = demo.getByRole("navigation", { name: "Main" });
    await expect(nav.getByRole("link")).toHaveCount(3);
    await expect(nav.getByRole("link", { name: "Components" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Sass" })).not.toHaveAttribute("aria-current", /.*/);
  });

  test("is 64px tall on desktop and 56px on mobile", async ({ page }) => {
    const content = preview(page, "navbar-demo").locator("[data-slot=navbar-content]");
    await expect(content).toHaveCSS("height", "64px");
    await page.setViewportSize({ width: 390, height: 800 });
    await expect(content).toHaveCSS("height", "56px");
  });

  test("links are keyboard reachable with a visible focus outline", async ({ page }) => {
    const nav = preview(page, "navbar-demo").getByRole("navigation", { name: "Main" });
    await nav.getByRole("link", { name: "Sass" }).focus();
    await page.keyboard.press("Tab");
    const link = nav.getByRole("link", { name: "Components" });
    await expect(link).toBeFocused();
    await expect(link).not.toHaveCSS("outline-style", "none");
  });

  test("menu button has an accessible name", async ({ page }) => {
    const button = preview(page, "navbar-brand-position").getByRole("button", { name: "Open navigation menu" });
    await expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("fixed navbar sticks to the top of its scroll container", async ({ page }) => {
    const region = preview(page, "navbar-fixed").getByRole("region", { name: "Scrollable page with a fixed navbar" });
    const header = region.locator("[data-slot=navbar]");
    await expect(header).toHaveCSS("position", "sticky");
    await region.evaluate((el) => el.scrollTo(0, 200));
    await expect
      .poll(async () => {
        const [h, r] = await Promise.all([header.boundingBox(), region.boundingBox()]);
        return Math.round((h?.y ?? 0) - (r?.y ?? 0));
      })
      .toBe(0);
  });

  test("search submits on Enter and Escape clears the field", async ({ page }) => {
    const demo = preview(page, "navbar-search-demo");
    const search = demo.getByRole("search");
    const input = search.getByRole("searchbox", { name: "Search" });
    await input.fill("cards");
    await input.press("Enter");
    await expect(demo.getByText('Searched for "cards"')).toBeVisible();
    await input.press("Escape");
    await expect(input).toHaveValue("");
    await expect(input).toBeFocused();

    await input.fill("chips");
    await search.getByRole("button", { name: "Clear search" }).click();
    await expect(input).toHaveValue("");
    await expect(input).toBeFocused();
  });

  test("search field turns to the surface color when focused", async ({ page }) => {
    const input = preview(page, "navbar-search-demo").getByRole("searchbox", { name: "Search" });
    const before = await input.evaluate((el) => getComputedStyle(el).backgroundColor);
    await input.focus();
    await expect.poll(async () => input.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(before);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
