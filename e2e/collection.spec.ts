import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

test.describe("Collection", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "collection");
  });

  test("renders a bordered list", async ({ page }) => {
    const list = preview(page, "collection-demo").getByRole("list", { name: "Names" });
    await expect(list).toBeVisible();
    await expect(list.getByRole("listitem")).toHaveCount(4);
    await expect(list).toHaveCSS("border-top-width", "1px");
    await expect(list.getByRole("listitem").first()).toHaveCSS("padding-left", "20px");
  });

  test("link collection is a navigation landmark with aria-current", async ({ page }) => {
    const nav = preview(page, "collection-links").getByRole("navigation", { name: "Account" });
    await expect(nav.getByRole("link")).toHaveCount(4);
    const active = nav.getByRole("link", { name: "Settings" });
    await expect(active).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Profile" })).not.toHaveAttribute("aria-current", /.*/);
  });

  test("links are keyboard focusable with a visible ring", async ({ page }) => {
    const nav = preview(page, "collection-links").getByRole("navigation", { name: "Account" });
    const first = nav.getByRole("link", { name: "Profile" });
    await first.focus();
    await page.keyboard.press("Tab");
    await expect(nav.getByRole("link", { name: "Settings" })).toBeFocused();
    const outline = await nav.getByRole("link", { name: "Settings" }).evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
  });

  test("header indents items and secondary content is right aligned", async ({ page }) => {
    const list = preview(page, "collection-with-header").getByRole("list", { name: "First Names" });
    const item = list.getByRole("listitem").filter({ hasText: "Alvin" });
    await expect(item).toHaveCSS("padding-left", "30px");
    const itemBox = await item.boundingBox();
    const secondary = await item.getByRole("link", { name: "Send Alvin a message" }).boundingBox();
    expect(itemBox && secondary && secondary.x > itemBox.x + itemBox.width / 2).toBe(true);
  });

  test("avatar items are 84px tall with a 42px circle", async ({ page }) => {
    const list = preview(page, "collection-avatars").getByRole("list", { name: "Contacts" });
    const item = list.getByRole("listitem").first();
    await expect(item).toHaveCSS("padding-left", "72px");
    const height = await item.evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(84);
    const avatar = item.locator("[data-slot=collection-avatar]");
    await expect(avatar).toHaveCSS("width", "42px");
    // rounded-full resolves to a very large pixel radius, which renders as a circle.
    const radius = await avatar.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
    expect(radius).toBeGreaterThanOrEqual(21);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
