import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Wait until React has hydrated the page: the h1 and every example preview
 * carry React's fiber key. This is more reliable than `networkidle`, which can
 * hang on a busy dev server.
 */
export async function waitForHydration(page: Page): Promise<void> {
  await expect(page.locator("h1")).toBeVisible();
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const hydrated = (el: Element): boolean => Object.keys(el).some((key) => key.startsWith("__reactFiber$"));
          const nodes = [document.querySelector("h1"), ...document.querySelectorAll("[data-preview]")];
          return nodes.every((node) => node !== null && hydrated(node));
        }),
      { timeout: 30_000 },
    )
    .toBe(true);
}

/** Open a component docs page and wait for it to hydrate. */
export async function gotoComponent(page: Page, name: string): Promise<void> {
  await page.goto(`/docs/components/${name}`);
  // Interactive examples are client components; wait until React has hydrated.
  await waitForHydration(page);
}

/** The live preview pane of an example (see ComponentPreview `name`). */
export function preview(page: Page, example: string): Locator {
  return page.locator(`[data-preview="${example}"]`);
}

/**
 * Fail on serious or critical axe violations inside `selector` (defaults to the
 * whole page). Syntax-highlighted code is docs chrome and is excluded, as is
 * anything matching `exclude` (e.g. third-party embeds).
 */
export async function expectNoA11yViolations(page: Page, selector?: string, exclude: string[] = []): Promise<void> {
  // Let enter transitions (fades, scale-ins) finish so contrast is measured on the final colors.
  // Infinite animations such as spinners are ignored, and the wait is capped.
  await page.evaluate(() =>
    Promise.race([
      Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => undefined)),
      ),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]),
  );
  let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]);
  if (selector) builder = builder.include(selector);
  builder = builder.exclude(".shiki");
  for (const excluded of exclude) builder = builder.exclude(excluded);
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
