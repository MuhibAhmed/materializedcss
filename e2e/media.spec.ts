import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { gotoComponent, preview } from "./utils";

test.describe("Media", () => {
  test.beforeEach(async ({ page }) => {
    // Keep the tests offline and deterministic: the YouTube player never reaches network idle.
    await page.route(/youtube|ytimg|googlevideo|doubleclick|google\.com/, (route) => route.abort());
    await gotoComponent(page, "media");
  });

  test("responsive image never overflows its container", async ({ page }) => {
    const image = preview(page, "media-demo").getByRole("img", { name: "Pastel sunrise over rolling hills" });
    await expect(image).toHaveCSS("max-width", "100%");
    await page.setViewportSize({ width: 390, height: 800 });
    const fits = await image.evaluate((el) => el.getBoundingClientRect().width <= (el.parentElement?.getBoundingClientRect().width ?? 0) + 1);
    expect(fits).toBe(true);
  });

  test("circle images are round and keep their aspect ratio", async ({ page }) => {
    const demo = preview(page, "media-circle");
    const ada = demo.getByRole("img", { name: "Ada" });
    await expect(ada).toHaveCSS("width", "120px");
    await expect(ada).toHaveCSS("height", "120px");
    const radius = await ada.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
    expect(radius).toBeGreaterThanOrEqual(60);
    const forest = demo.getByRole("img", { name: "Forest (cropped, not squashed)" });
    await expect(forest).toHaveCSS("object-fit", "cover");
    await expect(forest).toHaveCSS("height", "80px");
  });

  test("video container keeps a 16:9 ratio and fills the iframe", async ({ page }) => {
    const demo = preview(page, "media-video");
    const container = demo.locator("[data-slot=video-container]");
    const box = await container.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.abs((box?.width ?? 0) / (box?.height ?? 1) - 16 / 9)).toBeLessThan(0.02);
    const frame = demo.locator('iframe[title="Materialize introduction video"]');
    await expect(frame).toHaveAttribute("loading", "lazy");
    const frameBox = await frame.boundingBox();
    expect(Math.round(frameBox?.width ?? 0)).toBe(Math.round(box?.width ?? -1));
    expect(Math.round(frameBox?.height ?? 0)).toBe(Math.round(box?.height ?? -1));
  });

  test("has no serious accessibility violations", async ({ page }) => {
    // The embedded YouTube player is third-party content we cannot fix, so it is excluded.
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .include("[data-doc-content]")
      .exclude(".shiki")
      .exclude('[data-preview="media-video"] iframe')
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id} -> ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  });
});
