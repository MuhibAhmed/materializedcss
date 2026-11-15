import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { expect, type Page, test } from "@playwright/test";

import { expectNoA11yViolations, waitForHydration } from "./utils";

/** Every docs route, derived from the `page.tsx` files under `apps/docs/app/docs`. */
function docsRoutes(): string[] {
  const root = fileURLToPath(new URL("../apps/docs/app/docs", import.meta.url));
  const routes: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (statSync(full).isDirectory()) walk(full);
      else if (entry === "page.tsx") {
        const rel = path.relative(root, dir).split(path.sep).join("/");
        routes.push(rel ? `/docs/${rel}` : "/docs");
      }
    }
  };
  walk(root);
  return routes.sort();
}

const ROUTES = docsRoutes();

/** Hrefs of the docs sidebar (rendered on every docs page, hidden below `lg`). */
async function sidebarHrefs(page: Page): Promise<string[]> {
  return page
    .getByRole("navigation", { name: "Documentation" })
    .first()
    .locator("a[href]")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
}

/** Collects console errors and uncaught exceptions for the rest of the test. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console.error: ${message.text()}`);
    // React reports hydration problems and key / prop mistakes as warnings in some cases.
    // Firefox's own "[JavaScript Warning: ...]" messages (font sanitizer, Permissions Policy) are engine noise.
    const text = message.text();
    if (message.type() === "warning" && !text.startsWith("[JavaScript Warning") && /hydrat|^Warning:|did not match/i.test(text)) {
      errors.push(`console.warn: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

test.describe("Docs navigation", () => {
  test("the sidebar links to every docs page and nothing else", async ({ page }) => {
    await page.goto("/docs");
    const hrefs = await sidebarHrefs(page);
    expect(new Set(hrefs).size, "no duplicate sidebar links").toBe(hrefs.length);
    expect([...hrefs].sort()).toEqual(ROUTES);
  });

  test("prev and next links walk through the component pages", async ({ page }) => {
    await page.goto("/docs");
    const components = (await sidebarHrefs(page)).filter((href) => href.startsWith("/docs/components/"));
    const [first, second] = components;
    await page.goto(first);
    const pager = page.getByRole("navigation", { name: "Pagination" }).last();
    const next = pager.getByRole("link").last();
    await expect(next).toHaveAttribute("href", second);
    await next.click();
    await expect(page).toHaveURL(second);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Pagination" }).last().getByRole("link").first()).toHaveAttribute(
      "href",
      first,
    );
  });

  test("table of contents links jump to their section", async ({ page, isMobile }) => {
    test.skip(isMobile, "the table of contents column is only shown on wide screens");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/docs/components/button");
    const toc = page.getByRole("navigation", { name: "On this page" });
    const link = toc.getByRole("link", { name: "API Reference" });
    await expect(link).toHaveAttribute("href", "#api-reference");
    await link.click();
    await expect(page).toHaveURL(/#api-reference$/);
    await expect(page.locator("#api-reference")).toBeInViewport();
  });

  test("Ctrl+K opens the command menu, finds a component and navigates to it", async ({ page, isMobile }) => {
    await page.goto("/docs");
    await waitForHydration(page);
    if (isMobile) {
      await page.getByRole("button", { name: /Search docs/ }).click();
    } else {
      await page.keyboard.press("ControlOrMeta+k");
    }
    const dialog = page.getByRole("dialog", { name: "Search documentation" });
    await expect(dialog).toBeVisible();
    const input = dialog.getByRole("combobox", { name: "Search pages" });
    await expect(input).toBeFocused();
    await input.fill("toolt");
    await expect(dialog.getByRole("option")).toHaveCount(1);
    await expect(dialog.getByRole("option", { name: /Tooltip/ })).toHaveAttribute("aria-selected", "true");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/docs\/components\/tooltip$/);
    await expect(page.locator("h1")).toHaveText("Tooltip");
  });

  for (const route of ROUTES) {
    test(`${route} loads cleanly`, async ({ page }) => {
      const errors = collectErrors(page);
      const response = await page.goto(route);
      expect(response?.status(), "HTTP status").toBeLessThan(400);
      await expect(page.locator("h1")).toHaveCount(1);
      await waitForHydration(page);

      // In-page links (TOC and heading anchors) point at existing ids.
      const anchors = await page
        .locator('main h2 a[href^="#"], nav[aria-label="On this page"] a[href^="#"]')
        .evaluateAll((links) => links.map((link) => (link.getAttribute("href") ?? "").slice(1)).filter(Boolean));
      for (const id of new Set(anchors)) {
        await expect(page.locator(`[id="${id}"]`), `#${id} target`).toHaveCount(1);
      }

      // Third-party embeds (the YouTube player on the media page) are not ours to fix.
      await expectNoA11yViolations(page, undefined, ['iframe[src*="youtube"]']);
      expect(errors, "console errors").toEqual([]);
    });
  }
});
