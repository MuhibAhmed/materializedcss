import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

test.describe("Dropdown Menu", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "dropdown-menu");
  });

  test("opens over the trigger and closes on selection", async ({ page }) => {
    const trigger = preview(page, "dropdown-menu-demo").getByRole("button", { name: "Drop me!", includeHidden: true });
    await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await trigger.evaluate((el) => el.scrollIntoView({ block: "start" }));
    await page.evaluate(() => window.scrollBy(0, -100));
    await trigger.click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.waitForTimeout(250);
    const [triggerBox, menuBox] = await Promise.all([trigger.boundingBox(), menu.boundingBox()]);
    if (!triggerBox || !menuBox) throw new Error("no box");
    // coverTrigger: the menu starts at the trigger's top-left corner.
    expect(Math.abs(menuBox.y - triggerBox.y)).toBeLessThan(2);
    expect(Math.abs(menuBox.x - triggerBox.x)).toBeLessThan(2);
    const item = menu.getByRole("menuitem", { name: "two" });
    expect(Math.round((await item.boundingBox())?.height ?? 0)).toBeGreaterThanOrEqual(50);

    await item.click();
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("supports the keyboard: arrows, type-ahead and Escape", async ({ page }) => {
    const trigger = preview(page, "dropdown-menu-demo").getByRole("button", { name: "Drop me!", includeHidden: true });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem", { name: "one" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(menu.getByRole("menuitem", { name: "two" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(menu.getByRole("menuitem", { name: "five" })).toBeFocused();
    await page.keyboard.press("t");
    await expect(menu.getByRole("menuitem", { name: /^t/ }).first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("coverTrigger=false opens below and constrainWidth matches the trigger", async ({ page }) => {
    const trigger = preview(page, "dropdown-menu-below").getByRole("button", { name: "Sort by", includeHidden: true });
    await trigger.click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await page.waitForTimeout(250);
    const [triggerBox, menuBox] = await Promise.all([trigger.boundingBox(), menu.boundingBox()]);
    if (!triggerBox || !menuBox) throw new Error("no box");
    expect(menuBox.y).toBeGreaterThanOrEqual(triggerBox.y + triggerBox.height - 1);
    expect(Math.abs(menuBox.width - triggerBox.width)).toBeLessThan(1);
  });

  test("align=end lines up the right edges", async ({ page }) => {
    const trigger = preview(page, "dropdown-menu-below").getByRole("button", { name: "Align end", includeHidden: true });
    await trigger.click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await page.waitForTimeout(250);
    const [triggerBox, menuBox] = await Promise.all([trigger.boundingBox(), menu.boundingBox()]);
    if (!triggerBox || !menuBox) throw new Error("no box");
    expect(Math.abs(menuBox.x + menuBox.width - (triggerBox.x + triggerBox.width))).toBeLessThan(2);
  });

  test("hover mode opens on pointer enter and closes on leave", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover only applies to mouse pointers");
    const trigger = preview(page, "dropdown-menu-hover").getByRole("button", { name: "Hover me" });
    await trigger.hover();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await menu.getByRole("menuitem", { name: "Photos" }).hover();
    await page.waitForTimeout(400);
    await expect(menu).toBeVisible();
    await page.mouse.move(5, 5);
    await expect(menu).toBeHidden();
    // Still keyboard accessible.
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("checkbox, radio and submenu items", async ({ page }) => {
    const trigger = preview(page, "dropdown-menu-advanced").getByRole("button", { name: "View options", includeHidden: true });
    await trigger.click();
    const menu = page.getByRole("menu").first();
    const wrap = menu.getByRole("menuitemcheckbox", { name: "Word wrap" });
    await expect(wrap).toHaveAttribute("aria-checked", "true");
    await wrap.click();
    await expect(page.getByRole("menu")).toHaveCount(0);
    await trigger.click();
    await expect(page.getByRole("menuitemcheckbox", { name: "Word wrap" })).toHaveAttribute("aria-checked", "false");
    await page.getByRole("menuitemradio", { name: "Compact" }).click();
    await expect(page.getByRole("menu")).toHaveCount(0);
    await trigger.click();
    await expect(page.getByRole("menuitemradio", { name: "Compact" })).toHaveAttribute("aria-checked", "true");

    const share = page.getByRole("menuitem", { name: "Share" });
    await share.focus();
    await page.keyboard.press("ArrowRight");
    const sub = page.getByRole("menu").nth(1);
    await expect(sub.getByRole("menuitem", { name: "Email link" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(sub).toBeHidden();
    await expect(share).toBeFocused();
  });

  test("is not clipped by an overflow: hidden container", async ({ page }) => {
    const scope = preview(page, "dropdown-menu-overflow");
    await scope.getByRole("button", { name: "Actions" }).click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await page.waitForTimeout(250);
    const container = await scope.locator("div.overflow-hidden").first().boundingBox();
    const menuBox = await menu.boundingBox();
    if (!container || !menuBox) throw new Error("no box");
    expect(menuBox.y + menuBox.height).toBeGreaterThan(container.y + container.height);
    // The last item is actually hit-testable outside the container.
    const archive = menu.getByRole("menuitem", { name: "Archive" });
    await archive.click();
    await expect(menu).toBeHidden();
  });

  test("stays inside the viewport near the bottom edge", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 500 });
    const trigger = preview(page, "dropdown-menu-overflow").getByRole("button", { name: "Actions" });
    await trigger.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, -(window.innerHeight - 120)));
    await trigger.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      window.scrollBy(0, rect.bottom - window.innerHeight + 8);
    });
    await trigger.click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await page.waitForTimeout(250);
    const box = await menu.boundingBox();
    if (!box) throw new Error("no box");
    expect(box.y + box.height).toBeLessThanOrEqual(500);
    expect(box.y).toBeGreaterThanOrEqual(0);
  });

  test("skips animations with reduced motion", async ({ page }) => {
    await reduceMotion(page);
    await preview(page, "dropdown-menu-demo").getByRole("button", { name: "Drop me!", includeHidden: true }).click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    expect(await menu.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
    await preview(page, "dropdown-menu-demo").getByRole("button", { name: "Drop me!", includeHidden: true }).click();
    await expect(page.getByRole("menu")).toBeVisible();
    await page.waitForTimeout(400);
    await expectNoA11yViolations(page, "[role=menu]");
  });
});
