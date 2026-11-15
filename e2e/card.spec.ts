import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview, reduceMotion } from "./utils";

test.describe("Card", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "card");
  });

  test("renders title, content and uppercase action links", async ({ page }) => {
    const demo = preview(page, "card-demo");
    await expect(demo.getByRole("heading", { name: "Card Title" })).toBeVisible();
    const link = demo.getByRole("link", { name: "This is a link" }).first();
    await expect(link).toHaveCSS("text-transform", "uppercase");
    await expect(demo.locator("[data-slot=card]")).toHaveCSS("border-radius", "2px");
  });

  test("image card overlays the title in white", async ({ page }) => {
    const title = preview(page, "card-with-image").getByRole("heading", { name: "Card Title" });
    await expect(title).toHaveCSS("position", "absolute");
    await expect(title).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("reveal opens with the mouse, focuses the panel and closes with the close button", async ({ page }) => {
    const demo = preview(page, "card-reveal-demo");
    const trigger = demo.getByRole("button", { name: "Card Title" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    const panelId = await trigger.getAttribute("aria-controls");
    const panel = page.locator(`[id="${panelId}"]`);
    await expect(panel).toBeHidden();

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("button", { name: "Close" })).toBeFocused();
    await expect(page.getByRole("region", { name: "Card Title" })).toBeVisible();

    await panel.getByRole("button", { name: "Close" }).click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("reveal works with the keyboard and Escape returns focus", async ({ page }) => {
    const demo = preview(page, "card-reveal-demo");
    const trigger = demo.getByRole("button", { name: "Card Title" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(demo.getByRole("button", { name: "Close" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Space");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  test("closed reveal panel is not reachable with Tab", async ({ page }) => {
    const panel = preview(page, "card-reveal-demo").locator("[data-slot=card-reveal]");
    await expect(panel).toHaveAttribute("inert", "");
  });

  test("reveal skips the slide with reduced motion", async ({ page }) => {
    await reduceMotion(page);
    const panel = preview(page, "card-reveal-demo").locator("[data-slot=card-reveal]");
    await expect(panel).toHaveCSS("transition-property", "none");
  });

  test("fixed sizes are 300, 400 and 500px tall", async ({ page }) => {
    const cards = preview(page, "card-sizes").locator("[data-slot=card]");
    await expect(cards).toHaveCount(3);
    const heights = await cards.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().height)));
    expect(heights).toEqual([300, 400, 500]);
  });

  test("horizontal card places the image beside the content", async ({ page }) => {
    const card = preview(page, "card-horizontal").locator("[data-slot=card]");
    await expect(card).toHaveCSS("flex-direction", "row");
    const image = await card.locator("[data-slot=card-image]").boundingBox();
    const content = await card.locator("[data-slot=card-stacked]").boundingBox();
    expect(image && content && image.x < content.x).toBe(true);
    expect(image?.width ?? 0).toBeGreaterThan(100);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
    await preview(page, "card-reveal-demo").getByRole("button", { name: "Card Title" }).click();
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
