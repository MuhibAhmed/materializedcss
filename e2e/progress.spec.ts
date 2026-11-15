import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

test.describe("Progress", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "progress");
  });

  test("determinate bar exposes its value and updates", async ({ page }) => {
    const demo = preview(page, "progress-demo");
    const bar = demo.getByRole("progressbar", { name: "Upload progress" });
    await expect(bar).toHaveAttribute("aria-valuenow", "70");
    await expect(bar).toHaveAttribute("aria-valuemin", "0");
    await expect(bar).toHaveAttribute("aria-valuemax", "100");
    await expect(bar).toHaveCSS("height", "4px");

    await demo.getByRole("button", { name: "More" }).click();
    await expect(bar).toHaveAttribute("aria-valuenow", "80");
    await expect(demo.getByText("80%")).toBeVisible();

    const indicator = bar.locator("[data-slot=progress-indicator]");
    await expect
      .poll(async () => indicator.evaluate((el) => el.getBoundingClientRect().width / (el.parentElement?.getBoundingClientRect().width ?? 1)))
      .toBeCloseTo(0.8, 2);

    await demo.getByRole("button", { name: "Less" }).click();
    await demo.getByRole("button", { name: "Less" }).click();
    await expect(bar).toHaveAttribute("aria-valuenow", "60");
  });

  test("indeterminate bars omit aria-valuenow and animate", async ({ page }) => {
    const demo = preview(page, "progress-indeterminate");
    const bar = demo.getByRole("progressbar", { name: "Loading results" });
    await expect(bar).not.toHaveAttribute("aria-valuenow", /.*/);
    const indicator = bar.locator("[data-slot=progress-indicator]");
    const animation = await indicator.evaluate((el) => getComputedStyle(el, "::before").animationName);
    expect(animation).not.toBe("none");
    await expect(demo.getByRole("progressbar", { name: "Syncing contacts" })).toBeVisible();
  });

  test("reduced motion removes the width transition", async ({ page }) => {
    await reduceMotion(page);
    const indicator = preview(page, "progress-demo").getByRole("progressbar").locator("[data-slot=progress-indicator]");
    await expect(indicator).toHaveCSS("transition-property", "none");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
