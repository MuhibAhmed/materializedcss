import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

test.describe("Switch", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "switch");
  });

  test("renders switches with accessible names (Off/On text is decorative)", async ({ page }) => {
    const demo = preview(page, "switch-demo");
    const wifi = demo.getByRole("switch", { name: "Wi-Fi", exact: true });
    await expect(wifi).toBeChecked();
    await expect(demo.getByRole("switch", { name: "Airplane mode", exact: true })).not.toBeChecked();
  });

  test("toggles on click, on the label and on the Off/On text", async ({ page }) => {
    const demo = preview(page, "switch-demo");
    const airplane = demo.getByRole("switch", { name: "Airplane mode" });
    await airplane.click();
    await expect(airplane).toBeChecked();
    await demo.getByText("Airplane mode").click();
    await expect(airplane).not.toBeChecked();
    const wifi = demo.getByRole("switch", { name: "Wi-Fi" });
    await demo.getByText("Off", { exact: true }).click();
    await expect(wifi).not.toBeChecked();
  });

  test("thumb slides 18px and turns secondary when checked", async ({ page }) => {
    const thumb = preview(page, "switch-demo").getByRole("switch", { name: "Wi-Fi" }).locator("[data-slot=switch-thumb]");
    await expect.poll(() => thumb.evaluate((el) => getComputedStyle(el).translate)).toBe("18px");
    const secondary = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.color = "var(--secondary)";
      document.body.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });
    await expect.poll(() => thumb.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(secondary);
  });

  test("toggles with Space and Enter and shows the focus halo", async ({ page }) => {
    const airplane = preview(page, "switch-demo").getByRole("switch", { name: "Airplane mode" });
    await airplane.focus();
    await page.keyboard.press("Space");
    await expect(airplane).toBeChecked();
    await page.keyboard.press("Enter");
    await expect(airplane).not.toBeChecked();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(airplane).toBeFocused();
    const thumb = airplane.locator("[data-slot=switch-thumb]");
    await expect.poll(() => thumb.evaluate((el) => getComputedStyle(el, "::before").scale)).toBe("2.4");
  });

  test("disabled switches cannot be toggled", async ({ page }) => {
    const sw = preview(page, "switch-disabled").getByRole("switch", { name: "Disabled on" });
    await expect(sw).toBeDisabled();
    await sw.click({ force: true });
    await expect(sw).toBeChecked();
  });

  test("controlled state updates from outside", async ({ page }) => {
    const ex = preview(page, "switch-controlled");
    const sw = ex.getByRole("switch", { name: "Notifications" });
    await expect(sw).toHaveAccessibleDescription("Get notified about new comments.");
    await ex.getByRole("button", { name: "Toggle from outside" }).click();
    await expect(sw).toBeChecked();
    await expect(ex.getByText("Notifications are on")).toBeVisible();
    await sw.click();
    await expect(ex.getByText("Notifications are off")).toBeVisible();
  });

  test("submits name/value with forms", async ({ page }) => {
    const form = preview(page, "switch-form");
    const output = form.locator("output");
    await form.getByRole("button", { name: "Submit" }).click();
    await expect(output).toHaveText(JSON.stringify({ darkMode: "enabled" }));
    await form.getByRole("switch", { name: "Beta features" }).click();
    await form.getByRole("button", { name: "Submit" }).click();
    await expect(output).toHaveText(JSON.stringify({ darkMode: "enabled", beta: "enabled" }));
  });

  test("turns off transitions with reduced motion", async ({ page }) => {
    await reduceMotion(page);
    const thumb = preview(page, "switch-demo").getByRole("switch", { name: "Wi-Fi" }).locator("[data-slot=switch-thumb]");
    await expect.poll(() => thumb.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe("none");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
