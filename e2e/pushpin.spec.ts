import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

test.describe("Pushpin", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "pushpin");
  });

  test("changes state from pin-top to pinned to pin-bottom while scrolling", async ({ page }) => {
    const demo = preview(page, "pushpin-demo");
    const scroller = demo.getByRole("region", { name: "Scrollable article" });
    const pin = demo.locator('[data-slot="pushpin"]');
    await expect(pin).toHaveAttribute("data-state", "pin-top");
    await expect(demo.getByText("Pushpin state:")).toContainText("pin-top");

    await scroller.evaluate((el) => el.scrollTo({ top: 200 }));
    await expect(pin).toHaveAttribute("data-state", "pinned");
    await expect(demo.getByText("Pushpin state:")).toContainText("pinned");
    // Pinned 16px below the top of the scroll container.
    const offset = await pin.evaluate((el) => {
      const scroller = el.closest('[role="region"]');
      return el.getBoundingClientRect().top - (scroller?.getBoundingClientRect().top ?? 0) - (scroller?.clientTop ?? 0);
    });
    expect(Math.abs(offset - 16)).toBeLessThan(1.5);

    await scroller.evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
    await expect(pin).toHaveAttribute("data-state", "pin-bottom");
    await expect(demo.getByText("Pushpin state:")).toContainText("pin-bottom");

    await scroller.evaluate((el) => el.scrollTo({ top: 0 }));
    await expect(pin).toHaveAttribute("data-state", "pin-top");
  });

  test("stays pinned through small scroll steps", async ({ page }) => {
    const demo = preview(page, "pushpin-demo");
    const scroller = demo.getByRole("region", { name: "Scrollable article" });
    const pin = demo.locator('[data-slot="pushpin"]');
    for (const top of [120, 160, 220, 280]) {
      await scroller.evaluate((el, y) => el.scrollTo({ top: y }), top);
      await expect(pin).toHaveAttribute("data-state", "pinned");
    }
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
