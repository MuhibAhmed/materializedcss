import { expect, test, type Locator, type Page } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

function toc(page: Page): Locator {
  return preview(page, "table-of-contents-demo").getByRole("navigation", { name: "Demo contents" });
}

async function scrollSectionTo(page: Page, id: string, y: number): Promise<void> {
  await page.evaluate(
    ([sectionId, top]) => {
      const section = document.getElementById(sectionId);
      if (section) window.scrollTo({ top: window.scrollY + section.getBoundingClientRect().top - top, behavior: "instant" });
    },
    [id, y] as const,
  );
}

test.describe("Table of contents", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "table-of-contents");
  });

  test("highlights the section scrolled above the offset line", async ({ page }) => {
    const nav = toc(page);
    await expect(nav.getByRole("link")).toHaveCount(5);

    await scrollSectionTo(page, "toc-structure", 150);
    const structure = nav.getByRole("link", { name: "Structure" });
    await expect(structure).toHaveAttribute("aria-current", "location");
    await expect(nav.locator('[aria-current="location"]')).toHaveCount(1);
    const style = await structure.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { width: cs.borderLeftWidth, weight: Number(cs.fontWeight) };
    });
    expect(style.width).toBe("2px");
    expect(style.weight).toBeGreaterThanOrEqual(500);
    await expect(nav.getByRole("link", { name: "Introduction" })).not.toHaveAttribute("aria-current", "location");

    // Below the 200px line the section is not active yet.
    await scrollSectionTo(page, "toc-options", 260);
    await expect(nav.getByRole("link", { name: "Initialization" })).toHaveAttribute("aria-current", "location");
    await scrollSectionTo(page, "toc-options", 120);
    await expect(nav.getByRole("link", { name: "Options" })).toHaveAttribute("aria-current", "location");
  });

  test("clicking a link scrolls to the section, updates the hash and moves focus", async ({ page, isMobile }) => {
    test.skip(isMobile, "the list is not pinned on small screens");
    const nav = toc(page);
    await nav.scrollIntoViewIfNeeded();
    await nav.getByRole("link", { name: "Methods" }).click();
    await expect(page).toHaveURL(/#toc-methods$/);
    await expect(page.locator("#toc-methods")).toBeFocused();
    await expect
      .poll(() => page.locator("#toc-methods").evaluate((el) => Math.round(el.getBoundingClientRect().top)))
      .toBe(96);
    await expect(nav.getByRole("link", { name: "Methods" })).toHaveAttribute("aria-current", "location");
  });

  test("keeps the list pinned below the header while reading", async ({ page, isMobile }) => {
    test.skip(isMobile, "the list is not pinned on small screens");
    await scrollSectionTo(page, "toc-options", 100);
    const top = await toc(page).evaluate((el) => el.getBoundingClientRect().top);
    expect(Math.abs(top - 88)).toBeLessThan(1.5);
  });

  test("scrolls instantly with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const nav = toc(page);
    await nav.scrollIntoViewIfNeeded();
    await nav.getByRole("link", { name: "Options" }).click();
    // No smooth scroll in progress: the very next frame is already at the target.
    const top = await page.evaluate(
      () => new Promise<number>((resolve) => requestAnimationFrame(() => resolve(document.getElementById("toc-options")?.getBoundingClientRect().top ?? -1))),
    );
    expect(Math.round(top)).toBe(96);
  });

  test("useScrollSpy works inside a scroll container", async ({ page }) => {
    const demo = preview(page, "table-of-contents-hook");
    const scroller = demo.getByRole("region", { name: "Steps content" });
    const nav = demo.getByRole("navigation", { name: "Steps" });
    await expect(nav.getByRole("link", { name: "Plan" })).toHaveAttribute("aria-current", "location");
    await scroller.evaluate((el) => {
      const target = document.getElementById("spy-test");
      if (target) el.scrollTop += target.getBoundingClientRect().top - el.getBoundingClientRect().top;
    });
    await expect(nav.getByRole("link", { name: "Test" })).toHaveAttribute("aria-current", "location");
    await nav.getByRole("link", { name: "Build" }).click();
    await expect(nav.getByRole("link", { name: "Build" })).toHaveAttribute("aria-current", "location");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
