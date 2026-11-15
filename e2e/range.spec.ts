import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

test.describe("Range", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "range");
  });

  test("renders a labelled slider with its value", async ({ page }) => {
    const slider = preview(page, "range-demo").getByRole("slider", { name: "Volume" });
    await expect(slider).toBeVisible();
    await expect(slider).toHaveAttribute("aria-valuenow", "40");
    await expect(slider).toHaveAttribute("aria-valuemin", "0");
    await expect(slider).toHaveAttribute("aria-valuemax", "100");
  });

  test("keyboard: arrows, PageUp, Home and End change the value", async ({ page }) => {
    const slider = preview(page, "range-demo").getByRole("slider", { name: "Volume" });
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuenow", "41");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await expect(slider).toHaveAttribute("aria-valuenow", "39");
    await page.keyboard.press("PageUp");
    await expect(slider).toHaveAttribute("aria-valuenow", "49");
    await page.keyboard.press("End");
    await expect(slider).toHaveAttribute("aria-valuenow", "100");
    await page.keyboard.press("Home");
    await expect(slider).toHaveAttribute("aria-valuenow", "0");
  });

  test("the value bubble grows above the thumb on keyboard focus and shows the value", async ({ page }) => {
    const slider = preview(page, "range-demo").getByRole("slider", { name: "Volume" });
    const bubble = slider.locator('[data-slot="range-bubble"]');
    await expect.poll(() => bubble.evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => bubble.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    await expect(bubble).toHaveText("41");
    const thumbBox = await slider.boundingBox();
    const bubbleBox = await bubble.boundingBox();
    expect((bubbleBox?.y ?? 0) + (bubbleBox?.height ?? 0)).toBeLessThanOrEqual((thumbBox?.y ?? 0) + 1);
  });

  test("dragging with the mouse moves the thumb and shows the bubble", async ({ page }) => {
    const scope = preview(page, "range-demo");
    const slider = scope.getByRole("slider", { name: "Volume" });
    const track = scope.locator('[data-slot="range-track"]');
    await slider.scrollIntoViewIfNeeded();
    const box = await track.boundingBox();
    const thumb = await slider.boundingBox();
    if (!box || !thumb) throw new Error("no boxes");
    await page.mouse.move(thumb.x + thumb.width / 2, thumb.y + thumb.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2, { steps: 5 });
    await expect(slider).toHaveAttribute("data-active", "true");
    await page.mouse.up();
    const value = Number(await slider.getAttribute("aria-valuenow"));
    expect(value).toBeGreaterThan(70);
    expect(value).toBeLessThan(90);
  });

  test("multiple thumbs: named, formatted value text and min distance", async ({ page }) => {
    const scope = preview(page, "range-multiple");
    const min = scope.getByRole("slider", { name: /Minimum/ });
    const max = scope.getByRole("slider", { name: /Maximum/ });
    await expect(min).toHaveAttribute("aria-valuetext", "$200");
    await expect(max).toHaveAttribute("aria-valuenow", "600");
    await max.focus();
    // minStepsBetweenThumbs=5 with step 10 keeps a 50 gap: moves past it are rejected.
    for (let i = 0; i < 4; i++) await page.keyboard.press("PageDown");
    for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowLeft");
    await expect(max).toHaveAttribute("aria-valuenow", "250");
    await expect(scope.getByText("$200 – $250")).toBeVisible();
  });

  test("step and always-visible bubbles", async ({ page }) => {
    const scope = preview(page, "range-step");
    const rating = scope.getByRole("slider", { name: "Rating" });
    await expect.poll(() => rating.locator('[data-slot="range-bubble"]').evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    await rating.focus();
    await page.keyboard.press("ArrowRight");
    await expect(rating).toHaveAttribute("aria-valuenow", "4");
    const brightness = scope.getByRole("slider", { name: "Brightness" });
    await brightness.focus();
    await page.keyboard.press("ArrowRight");
    await expect(brightness).toHaveAttribute("aria-valuenow", "40");
    await expect(brightness).toHaveAttribute("aria-valuetext", "40%");
  });

  test("controlled value updates are reflected", async ({ page }) => {
    const scope = preview(page, "range-controlled");
    const slider = scope.getByRole("slider", { name: "Temperature" });
    await scope.getByRole("button", { name: /Eco/ }).click();
    await expect(slider).toHaveAttribute("aria-valuenow", "18");
    await expect(slider).toHaveAttribute("aria-valuetext", "18 degrees Celsius");
    await slider.focus();
    await page.keyboard.press("ArrowRight");
    await expect(scope.getByText("Current: 18.5°C")).toBeVisible();
  });

  test("vertical orientation uses up/down", async ({ page }) => {
    const slider = preview(page, "range-vertical").getByRole("slider", { name: "Bass" });
    await expect(slider).toHaveAttribute("aria-orientation", "vertical");
    await slider.focus();
    await page.keyboard.press("ArrowUp");
    await expect(slider).toHaveAttribute("aria-valuenow", "61");
  });

  test("disabled range ignores input", async ({ page }) => {
    const slider = preview(page, "range-disabled").getByRole("slider", { name: "Locked setting" });
    await expect(slider).toHaveAttribute("data-disabled", "");
    await slider.focus().catch(() => undefined);
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuenow", "60");
  });

  test("submits values in a form", async ({ page }) => {
    const scope = preview(page, "range-form");
    await scope.getByRole("slider", { name: "Volume" }).focus();
    await page.keyboard.press("ArrowRight");
    await scope.getByRole("button", { name: "Submit" }).click();
    await expect(scope.locator("output")).toHaveText('{"volume":"71","age":["18","65"]}');
  });

  test("has no serious accessibility violations", async ({ page, isMobile }) => {
    test.skip(isMobile, "docs chrome PropsTable overflow on phones");
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
