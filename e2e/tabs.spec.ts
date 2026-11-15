import { expect, test, type Locator } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

/** Horizontal distance between the indicator and the selected tab edges (0 when aligned). */
async function indicatorOffset(scope: Locator): Promise<number> {
  return scope.evaluate((root) => {
    const indicator = root.querySelector<HTMLElement>('[data-slot="tabs-indicator"]');
    const active = root.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!indicator || !active) return Number.POSITIVE_INFINITY;
    const a = indicator.getBoundingClientRect();
    const b = active.getBoundingClientRect();
    return Math.max(Math.abs(a.left - b.left), Math.abs(a.right - b.right));
  });
}

/** True when the named tab is fully inside the visible part of its scrolling tab list. */
async function tabVisibleInList(scope: Locator, name: string): Promise<boolean> {
  return scope.getByRole("tab", { name }).evaluate((tab) => {
    const list = tab.closest<HTMLElement>('[role="tablist"]');
    if (!list) return false;
    const a = tab.getBoundingClientRect();
    const b = list.getBoundingClientRect();
    return a.left >= b.left - 1 && a.right <= b.left + list.clientWidth + 1;
  });
}

async function expectIndicatorAligned(scope: Locator): Promise<void> {
  await expect.poll(() => indicatorOffset(scope), { timeout: 3000 }).toBeLessThan(1.5);
}

test.describe("Tabs", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "tabs");
  });

  test("renders a tablist with the default tab selected and its panel", async ({ page }) => {
    const demo = preview(page, "tabs-demo");
    await expect(demo.getByRole("tablist", { name: "Demo tabs" })).toBeVisible();
    await expect(demo.getByRole("tab", { name: "Test 2" })).toHaveAttribute("aria-selected", "true");
    await expect(demo.getByRole("tabpanel")).toHaveText("Test 2");
    await expect(demo.getByRole("tab", { name: "Disabled Tab" })).toBeDisabled();
    await expectIndicatorAligned(demo);
  });

  test("clicking a tab selects it and moves the indicator", async ({ page }) => {
    const demo = preview(page, "tabs-demo");
    await demo.getByRole("tab", { name: "Test 4" }).click();
    await expect(demo.getByRole("tab", { name: "Test 4" })).toHaveAttribute("aria-selected", "true");
    await expect(demo.getByRole("tabpanel")).toHaveText("Test 4");
    await expectIndicatorAligned(demo);
    await demo.getByRole("tab", { name: "Test 1" }).click();
    await expectIndicatorAligned(demo);
  });

  test("a mouse click does not show the keyboard focus ring, but arrow keys do", async ({ page }) => {
    const demo = preview(page, "tabs-demo");
    const ring = (name: string) => demo.getByRole("tab", { name }).evaluate((el) => getComputedStyle(el).boxShadow);
    await demo.getByRole("tab", { name: "Test 4" }).click();
    await expect(demo.getByRole("tab", { name: "Test 4" })).toBeFocused();
    expect(await ring("Test 4")).not.toContain("inset");
    await page.keyboard.press("ArrowLeft");
    await expect(demo.getByRole("tab", { name: "Test 2" })).toBeFocused();
    await expect.poll(() => ring("Test 2")).toContain("inset");
  });

  test("the trailing edge of the indicator lags behind (stretch animation)", async ({ page }) => {
    const demo = preview(page, "tabs-demo");
    await demo.getByRole("tab", { name: "Test 4" }).click();
    const transition = await demo.locator('[data-slot="tabs-indicator"]').evaluate((el) => el.style.transition);
    // Moving right: the left (trailing) edge is delayed by 90ms.
    expect(transition).toContain("left 300ms");
    expect(transition).toMatch(/left 300ms cubic-bezier\([^)]*\) 90ms/);
    expect(transition).toMatch(/right 300ms cubic-bezier\([^)]*\)( 0ms)?$/);
  });

  test("arrow keys, Home and End move between enabled tabs", async ({ page }) => {
    const demo = preview(page, "tabs-demo");
    await demo.getByRole("tab", { name: "Test 2" }).focus();
    await page.keyboard.press("ArrowRight");
    // The disabled tab is skipped.
    await expect(demo.getByRole("tab", { name: "Test 4" })).toBeFocused();
    await expect(demo.getByRole("tab", { name: "Test 4" })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Home");
    await expect(demo.getByRole("tab", { name: "Test 1" })).toHaveAttribute("aria-selected", "true");
    await expectIndicatorAligned(demo);
    await page.keyboard.press("End");
    await expect(demo.getByRole("tab", { name: "Test 4" })).toHaveAttribute("aria-selected", "true");
    await expectIndicatorAligned(demo);
  });

  test("manual activation selects only on Enter and reports controlled value", async ({ page }) => {
    const manual = preview(page, "tabs-manual");
    await manual.getByRole("tab", { name: "Overview" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(manual.getByRole("tab", { name: "Activity" })).toBeFocused();
    await expect(manual.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(manual.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
    await expect(manual.getByText("Selected:")).toContainText("activity");
    await expectIndicatorAligned(manual);
  });

  test("fixed-width tabs share the width equally", async ({ page }) => {
    const tabs = preview(page, "tabs-fixed-width").getByRole("tab");
    const widths = await tabs.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1.5);
  });

  test("indicator stays aligned after the viewport is resized", async ({ page }) => {
    const demo = preview(page, "tabs-fixed-width");
    await demo.getByRole("tab", { name: "Photos" }).click();
    await expectIndicatorAligned(demo);
    await page.setViewportSize({ width: 700, height: 800 });
    await expectIndicatorAligned(demo);
    await page.setViewportSize({ width: 1100, height: 800 });
    await expectIndicatorAligned(demo);
  });

  test("scrollable tabs keep the selected tab in view", async ({ page }) => {
    const scrollable = preview(page, "tabs-scrollable");
    const list = scrollable.getByRole("tablist");
    await expect.poll(() => tabVisibleInList(scrollable, "October")).toBe(true);
    const overflow = await list.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(overflow).toBe(true);
    await scrollable.getByRole("tab", { name: "October" }).focus();
    await page.keyboard.press("End");
    await expect(scrollable.getByRole("tab", { name: "December" })).toHaveAttribute("aria-selected", "true");
    await expect.poll(() => tabVisibleInList(scrollable, "December")).toBe(true);
    await expectIndicatorAligned(scrollable);
    await page.keyboard.press("Home");
    await expect(scrollable.getByRole("tab", { name: "January" })).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => list.evaluate((el) => el.scrollLeft), { timeout: 3000 })
      .toBeLessThan(1);
    await expectIndicatorAligned(scrollable);
  });

  test("RTL: indicator aligned and arrow keys are mirrored", async ({ page }) => {
    const rtl = preview(page, "tabs-rtl");
    await expectIndicatorAligned(rtl);
    const first = rtl.getByRole("tab").nth(0);
    const second = rtl.getByRole("tab").nth(1);
    const [a, b] = await Promise.all([first.boundingBox(), second.boundingBox()]);
    expect(a && b && a.x > b.x).toBe(true);
    await first.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(second).toHaveAttribute("aria-selected", "true");
    await expectIndicatorAligned(rtl);
  });

  test("tabs rendered while hidden measure the indicator when shown", async ({ page }) => {
    const hidden = preview(page, "tabs-hidden");
    await hidden.getByRole("button", { name: "Show details" }).click();
    await expect(hidden.getByRole("tab", { name: "Specifications" })).toBeVisible();
    await expectIndicatorAligned(hidden);
  });

  test("reduced motion moves the indicator without animation", async ({ page }) => {
    await reduceMotion(page);
    const demo = preview(page, "tabs-demo");
    await demo.getByRole("tab", { name: "Test 4" }).click();
    const transition = await demo.locator('[data-slot="tabs-indicator"]').evaluate((el) => el.style.transition);
    expect(transition).toContain("none");
    expect(await indicatorOffset(demo)).toBeLessThan(1.5);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
