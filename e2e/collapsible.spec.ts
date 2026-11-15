import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

test.describe("Collapsible", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "collapsible");
  });

  test("renders button headers with aria-expanded and aria-controls", async ({ page }) => {
    const demo = preview(page, "collapsible-demo");
    const first = demo.getByRole("button", { name: "First" });
    await expect(first).toHaveAttribute("aria-expanded", "true");
    const controls = await first.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    await expect(demo.locator(`[id="${controls}"]`)).toBeVisible();
    await expect(demo.getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "false");
    await expect(demo.getByText("Sed do eiusmod")).toBeHidden();
  });

  test("accordion mode opens one section at a time and can close it", async ({ page }) => {
    const demo = preview(page, "collapsible-demo");
    await demo.getByRole("button", { name: "Second" }).click();
    await expect(demo.getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "true");
    await expect(demo.getByRole("button", { name: "First" })).toHaveAttribute("aria-expanded", "false");
    await expect(demo.getByText("Sed do eiusmod")).toBeVisible();
    await expect(demo.getByText("Lorem ipsum dolor")).toBeHidden();
    await demo.getByRole("button", { name: "Second" }).click();
    await expect(demo.getByRole("button", { name: "Second" })).toHaveAttribute("aria-expanded", "false");
  });

  test("expandable mode keeps several sections open", async ({ page }) => {
    const list = preview(page, "collapsible-expandable");
    await list.getByRole("button", { name: "Returns" }).click();
    await list.getByRole("button", { name: "Warranty" }).click();
    for (const name of ["Shipping", "Returns", "Warranty"]) {
      await expect(list.getByRole("button", { name })).toHaveAttribute("aria-expanded", "true");
    }
  });

  test("keyboard: arrows, Home and End move between headers; Enter and Space toggle", async ({ page }) => {
    const demo = preview(page, "collapsible-demo");
    await demo.getByRole("button", { name: "First" }).focus();
    await page.keyboard.press("ArrowDown");
    await expect(demo.getByRole("button", { name: "Second" })).toBeFocused();
    await page.keyboard.press("End");
    await expect(demo.getByRole("button", { name: "Third" })).toBeFocused();
    await page.keyboard.press("Home");
    await expect(demo.getByRole("button", { name: "First" })).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(demo.getByRole("button", { name: "Third" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(demo.getByRole("button", { name: "Third" })).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Space");
    await expect(demo.getByRole("button", { name: "Third" })).toHaveAttribute("aria-expanded", "false");
  });

  test("animates the body height over 300ms", async ({ page }) => {
    const demo = preview(page, "collapsible-demo");
    await demo.getByRole("button", { name: "Third" }).click();
    const body = demo.locator('[data-slot="collapsible-body"][data-state="open"]');
    const animation = await body.evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toContain("md-accordion-down");
  });

  test("reduced motion disables the height animation", async ({ page }) => {
    await reduceMotion(page);
    const demo = preview(page, "collapsible-demo");
    await demo.getByRole("button", { name: "Third" }).click();
    const body = demo.locator('[data-slot="collapsible-body"][data-state="open"]');
    expect(await body.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  });

  test("popout lifts the open item to full width", async ({ page }) => {
    const popout = preview(page, "collapsible-popout");
    const items = popout.locator('[data-slot="collapsible-item"]');
    await expect
      .poll(async () => {
        const [open, closed] = await Promise.all([items.nth(0).boundingBox(), items.nth(1).boundingBox()]);
        return open && closed ? open.width - closed.width : 0;
      })
      .toBeGreaterThan(40);
  });

  test("controlled mode follows external buttons", async ({ page }) => {
    const controlled = preview(page, "collapsible-controlled");
    await controlled.getByRole("button", { name: "Next step" }).click();
    await expect(controlled.getByRole("button", { name: "Step 2: Profile" })).toHaveAttribute("aria-expanded", "true");
    await expect(controlled.getByRole("button", { name: "Step 1: Account" })).toHaveAttribute("aria-expanded", "false");
    await controlled.getByRole("button", { name: "Back" }).click();
    await expect(controlled.getByRole("button", { name: "Step 1: Account" })).toHaveAttribute("aria-expanded", "true");
  });

  test("single collapsible section toggles", async ({ page }) => {
    const section = preview(page, "collapsible-disclosure");
    const trigger = section.getByRole("button", { name: "Show advanced options" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect(section.getByRole("button", { name: "Hide advanced options" })).toHaveAttribute("aria-expanded", "true");
    await expect(section.getByText("Cache size")).toBeVisible();
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
