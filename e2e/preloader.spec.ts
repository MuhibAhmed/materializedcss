import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

test.describe("Preloader", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "preloader");
  });

  test("announces itself as a status with a label", async ({ page }) => {
    const demo = preview(page, "preloader-demo");
    await expect(demo.getByRole("status", { name: "Loading" })).toHaveCount(2);
    const colors = preview(page, "preloader-colors");
    for (const name of ["Loading messages", "Saving", "Syncing", "Loading photos"]) {
      await expect(colors.getByRole("status", { name })).toBeVisible();
    }
  });

  test("sizes are 64, 50 and 36px", async ({ page }) => {
    const sizes = preview(page, "preloader-sizes");
    await expect(sizes.getByRole("status", { name: "Loading (large)" })).toHaveCSS("width", "64px");
    await expect(sizes.getByRole("status", { name: "Loading (medium)" })).toHaveCSS("width", "50px");
    await expect(sizes.getByRole("status", { name: "Loading (small)" })).toHaveCSS("width", "36px");
  });

  test("spins and multicolor uses four layers", async ({ page }) => {
    const spinner = preview(page, "preloader-colors").getByRole("status", { name: "Loading photos" });
    await expect(spinner).not.toHaveCSS("animation-name", "none");
    await expect(spinner.locator("[data-slot=preloader-layer]")).toHaveCount(4);
    const single = preview(page, "preloader-colors").getByRole("status", { name: "Saving" });
    await expect(single.locator("[data-slot=preloader-layer]")).toHaveCount(1);
  });

  test("custom CSS colors are applied", async ({ page }) => {
    const spinner = preview(page, "preloader-colors").getByRole("status", { name: "Syncing" });
    const color = await spinner.evaluate((el) => getComputedStyle(el).color);
    // md-indigo-500 is #3f51b5.
    expect(color).toBe("rgb(63, 81, 181)");
  });

  test("reduced motion stops the arc animation and slows the rotation", async ({ page }) => {
    await reduceMotion(page);
    const spinner = preview(page, "preloader-sizes").getByRole("status", { name: "Loading (large)" });
    await expect(spinner).toHaveCSS("animation-duration", "4s");
    const arcs = await spinner.locator("[data-slot=preloader-layer] .rounded-full").evaluateAll((els) =>
      els.map((el) => getComputedStyle(el).animationName),
    );
    expect(arcs.length).toBeGreaterThan(0);
    expect(arcs.every((name) => name === "none")).toBe(true);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
