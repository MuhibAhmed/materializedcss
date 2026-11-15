import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

test.describe("Pagination", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "pagination");
  });

  test("composable pagination marks the current page and disables previous", async ({ page }) => {
    const demo = preview(page, "pagination-demo");
    const current = demo.getByRole("link", { name: "1", exact: true });
    await expect(current).toHaveAttribute("aria-current", "page");
    await expect(current).toHaveCSS("height", "30px");
    const prev = demo.getByRole("link", { name: "Previous page" });
    await expect(prev).toHaveAttribute("aria-disabled", "true");
    await expect(prev).not.toHaveAttribute("href", /.*/);
    await expect(demo.getByRole("link", { name: "Next page" })).toHaveAttribute("href", "#!");
  });

  test("control: clicking pages, previous and next updates the current page", async ({ page }) => {
    const demo = preview(page, "pagination-controlled");
    const nav = demo.getByRole("navigation", { name: "Results pages" });
    await expect(nav.getByRole("button", { name: "Page 6" })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByText("…")).toHaveCount(2);

    await nav.getByRole("button", { name: "Page 7" }).click();
    await expect(nav.getByRole("button", { name: "Page 7" })).toHaveAttribute("aria-current", "page");
    await expect(demo.getByText("Showing page 7 of 20")).toBeVisible();

    await nav.getByRole("button", { name: "Previous page" }).click();
    await expect(nav.getByRole("button", { name: "Page 6" })).toHaveAttribute("aria-current", "page");

    await nav.getByRole("button", { name: "Page 20" }).click();
    const next = nav.getByRole("button", { name: "Next page" });
    await expect(next).toHaveAttribute("aria-disabled", "true");
    await expect(nav.getByRole("button", { name: "Page 1", exact: true })).toBeVisible();
  });

  test("control is keyboard operable and keeps focus at the last page", async ({ page }) => {
    const nav = preview(page, "pagination-controlled").getByRole("navigation", { name: "Results pages" });
    const next = nav.getByRole("button", { name: "Next page" });
    await nav.getByRole("button", { name: "Page 20" }).focus();
    await page.keyboard.press("Enter");
    await expect(nav.getByRole("button", { name: "Page 20" })).toHaveAttribute("aria-current", "page");
    await next.focus();
    await page.keyboard.press("Enter");
    await expect(next).toHaveAttribute("aria-disabled", "true");
    await expect(next).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Space");
    await expect(nav.getByRole("button", { name: "Page 20" })).toHaveAttribute("aria-current", "page");
  });

  test("getHref renders real links and keeps the state in sync", async ({ page }) => {
    const nav = preview(page, "pagination-links").getByRole("navigation", { name: "Blog pages" });
    const four = nav.getByRole("link", { name: "Page 4" });
    await expect(four).toHaveAttribute("href", "#page-4");
    await four.click();
    await expect(nav.getByRole("link", { name: "Page 4" })).toHaveAttribute("aria-current", "page");
    await expect(page).toHaveURL(/#page-4$/);
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
