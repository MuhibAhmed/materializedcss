import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page } from "@playwright/test";

/** Open a component docs page and wait for it to hydrate. */
export async function gotoComponent(page: Page, name: string): Promise<void> {
  await page.goto(`/docs/components/${name}`);
  await expect(page.locator("h1")).toBeVisible();
  // Interactive examples are client components; wait until React has hydrated.
  await page.waitForLoadState("networkidle");
}

/** The live preview pane of an example (see ComponentPreview `name`). */
export function preview(page: Page, example: string): Locator {
  return page.locator(`[data-preview="${example}"]`);
}

/**
 * Fail on serious or critical axe violations inside `selector` (defaults to the
 * whole page). Syntax-highlighted code is docs chrome and is excluded.
 */
export async function expectNoA11yViolations(page: Page, selector?: string): Promise<void> {
  let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]);
  if (selector) builder = builder.include(selector);
  builder = builder.exclude(".shiki");
  const results = await builder.analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(
    serious.map((v) => `${v.id}: ${v.help} -> ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
    "axe violations",
  ).toEqual([]);
}

/** Emulate `prefers-reduced-motion: reduce` for the rest of the test. */
export async function reduceMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: "reduce" });
}
