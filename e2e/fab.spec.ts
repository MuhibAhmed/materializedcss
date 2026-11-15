import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

test.describe("Floating Action Button", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "fab");
  });

  test("opens on hover with the actions above the trigger", async ({ page, isMobile }) => {
    test.skip(isMobile, "hover only applies to mouse pointers");
    const scope = preview(page, "fab-demo");
    await scope.evaluate((el) => el.scrollIntoView({ block: "center" }));
    const trigger = scope.getByRole("button", { name: "Edit options" });
    await expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.hover();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const menu = scope.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("menuitem")).toHaveCount(4);
    await page.waitForTimeout(500);
    const [t, m] = await Promise.all([trigger.boundingBox(), menu.boundingBox()]);
    if (!t || !m) throw new Error("no box");
    expect(m.y + m.height).toBeLessThanOrEqual(t.y + 1);
    // Mouse click while hovering keeps it open (Materialize hover behavior).
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.mouse.move(5, 5);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(menu.getByRole("menuitem").first()).toBeHidden();
  });

  test("staggers the actions from the trigger outward", async ({ page }) => {
    const scope = preview(page, "fab-demo");
    const delays = await scope
      .locator("[data-slot=fab-actions] > div")
      .evaluateAll((items) => items.map((item) => (item as HTMLElement).style.transitionDelay));
    expect(delays).toEqual(["0ms", "0ms", "0ms", "0ms"]);
    await scope.getByRole("button", { name: "Edit options" }).focus();
    await page.keyboard.press("Enter");
    const open = await scope
      .locator("[data-slot=fab-actions] > div")
      .evaluateAll((items) => items.map((item) => (item as HTMLElement).style.transitionDelay));
    // Direction top: the last item is closest to the trigger and animates first.
    expect(open).toEqual(["120ms", "80ms", "40ms", "0ms"]);
  });

  test("keyboard: Enter opens and focuses the nearest action, arrows move, Escape refocuses", async ({ page }) => {
    const scope = preview(page, "fab-demo");
    const trigger = scope.getByRole("button", { name: "Edit options" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(scope.getByRole("menuitem", { name: "Attach file" })).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(scope.getByRole("menuitem", { name: "Publish" })).toBeFocused();
    await page.keyboard.press("Home");
    await expect(scope.getByRole("menuitem", { name: "Insert chart" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(scope.getByRole("menuitem", { name: "Attach file" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(scope.getByRole("menuitem", { name: "Insert chart" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();

    // An arrow key also opens it.
    await page.keyboard.press("ArrowUp");
    await expect(scope.getByRole("menuitem", { name: "Attach file" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("click mode toggles and an outside click closes", async ({ page }) => {
    const scope = preview(page, "fab-directions");
    const trigger = scope.getByRole("button", { name: "Actions (opens right)" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const menu = page.locator(`[id="${await trigger.getAttribute("aria-controls")}"]`);
    await expect(menu).toHaveAttribute("aria-orientation", "horizontal");
    await page.waitForTimeout(500);
    const [t, m] = await Promise.all([trigger.boundingBox(), menu.boundingBox()]);
    if (!t || !m) throw new Error("no box");
    expect(m.x).toBeGreaterThanOrEqual(t.x + t.width - 1);
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.locator("h1").click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("each direction places the actions on its side", async ({ page }) => {
    const scope = preview(page, "fab-directions");
    for (const direction of ["top", "bottom", "left", "right"] as const) {
      const trigger = scope.getByRole("button", { name: `Actions (opens ${direction})` });
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      const menu = page.locator(`[id="${await trigger.getAttribute("aria-controls")}"]`);
      await page.waitForTimeout(450);
      const [t, m] = await Promise.all([trigger.boundingBox(), menu.boundingBox()]);
      if (!t || !m) throw new Error("no box");
      if (direction === "top") expect(m.y + m.height).toBeLessThanOrEqual(t.y + 1);
      if (direction === "bottom") expect(m.y).toBeGreaterThanOrEqual(t.y + t.height - 1);
      if (direction === "left") expect(m.x + m.width).toBeLessThanOrEqual(t.x + 1);
      if (direction === "right") expect(m.x).toBeGreaterThanOrEqual(t.x + t.width - 1);
      await page.keyboard.press("Escape");
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
    }
  });

  test("selecting an action closes the menu", async ({ page }) => {
    const scope = preview(page, "fab-directions");
    const trigger = scope.getByRole("button", { name: "Actions (opens top)" });
    await trigger.click();
    const menu = page.locator(`[id="${await trigger.getAttribute("aria-controls")}"]`);
    await menu.getByRole("menuitem", { name: "Favorite" }).click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("toolbar mode morphs into a bar of actions", async ({ page }) => {
    const scope = preview(page, "fab-toolbar");
    await scope.evaluate((el) => el.scrollIntoView({ block: "center" }));
    const trigger = scope.getByRole("button", { name: "Open toolbar" });
    // Hover does not open a toolbar.
    await trigger.hover();
    await page.waitForTimeout(200);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    const bar = scope.locator("[data-slot=fab-toolbar]");
    await expect(bar).toHaveAttribute("data-state", "open");
    await page.waitForTimeout(500);
    const container = await scope.locator("div.relative").first().boundingBox();
    const box = await bar.boundingBox();
    if (!container || !box) throw new Error("no box");
    expect(Math.abs(box.width - container.width)).toBeLessThan(4);
    expect(Math.round(box.height)).toBe(56);
    const items = scope.getByRole("menuitem");
    await expect(items).toHaveCount(4);
    await expect(items.first()).toBeVisible();
    await items.nth(2).click();
    await expect(bar).toHaveAttribute("data-state", "closed");
    await expect(trigger).toBeVisible();
  });

  test("skips the stagger with reduced motion", async ({ page }) => {
    await reduceMotion(page);
    const scope = preview(page, "fab-demo");
    await scope.getByRole("button", { name: "Edit options" }).focus();
    await page.keyboard.press("Enter");
    const item = scope.locator("[data-slot=fab-actions] > div").first();
    expect(await item.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe("none");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
    const scope = preview(page, "fab-demo");
    await scope.getByRole("button", { name: "Edit options" }).focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);
    await expectNoA11yViolations(page, "[data-preview=fab-demo]");
  });
});
