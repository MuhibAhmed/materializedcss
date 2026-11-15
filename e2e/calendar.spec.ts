import { expect, test, type Locator, type Page } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

const day = (scope: Locator, iso: string): Locator => scope.locator(`[role="gridcell"][data-date="${iso}"]`);
const caption = (scope: Locator): Locator => scope.locator('[data-slot="calendar-caption"]');

async function open(page: Page): Promise<void> {
  await page.clock.setFixedTime(new Date("2026-11-15T10:00:00"));
  await gotoComponent(page, "calendar");
}

test.describe("Calendar", () => {
  test.beforeEach(async ({ page }) => {
    await open(page);
  });

  test("renders a date grid with today and the selection", async ({ page }) => {
    const demo = preview(page, "calendar-demo");
    await expect(demo.getByRole("grid")).toBeVisible();
    await expect(caption(demo)).toContainText("November 2026");
    const today = demo.getByRole("gridcell", { name: "Sunday, November 15, 2026" });
    await expect(today).toHaveAttribute("aria-current", "date");
    await expect(today).toHaveAttribute("aria-selected", "true");
    await expect(today).toHaveAttribute("tabindex", "0");
    await expect(demo.getByRole("columnheader")).toHaveCount(7);
    await expect(demo.getByRole("columnheader").first()).toContainText("Sunday");
  });

  test("selects a day with the mouse", async ({ page }) => {
    const demo = preview(page, "calendar-demo");
    await day(demo, "2026-11-20").click();
    await expect(day(demo, "2026-11-20")).toHaveAttribute("aria-selected", "true");
    await expect(day(demo, "2026-11-15")).toHaveAttribute("aria-selected", "false");
    await expect(demo.locator("output")).toHaveText("Fri Nov 20 2026");
  });

  test("supports the WAI-ARIA grid keyboard model", async ({ page }) => {
    const demo = preview(page, "calendar-demo");
    await day(demo, "2026-11-15").focus();
    await page.keyboard.press("ArrowRight");
    await expect(day(demo, "2026-11-16")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(day(demo, "2026-11-23")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowUp");
    await expect(day(demo, "2026-11-15")).toBeFocused();
    await page.keyboard.press("End");
    await expect(day(demo, "2026-11-21")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(day(demo, "2026-11-15")).toBeFocused();

    await page.keyboard.press("PageDown");
    await expect(caption(demo)).toContainText("December 2026");
    await expect(day(demo, "2026-12-15")).toBeFocused();
    await expect(demo.locator('[aria-live="polite"]')).toHaveText("December 2026");

    await page.keyboard.press("Shift+PageUp");
    await expect(caption(demo)).toContainText("December 2025");
    await expect(day(demo, "2025-12-15")).toBeFocused();

    await page.keyboard.press("PageUp");
    await page.keyboard.press("ArrowDown");
    await expect(day(demo, "2025-11-22")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(demo.locator("output")).toHaveText("Sat Nov 22 2025");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("Space");
    await expect(demo.locator("output")).toHaveText("Sun Nov 23 2025");

    // Only one day is in the tab sequence.
    await expect(demo.locator('[role="gridcell"][tabindex="0"]')).toHaveCount(1);
  });

  test("crosses month boundaries with the arrow keys", async ({ page }) => {
    const demo = preview(page, "calendar-demo");
    await day(demo, "2026-11-15").click();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(caption(demo)).toContainText("October 2026");
    await expect(day(demo, "2026-10-25")).toBeFocused();
  });

  test("prev / next buttons change the month", async ({ page }) => {
    const demo = preview(page, "calendar-demo");
    await demo.getByRole("button", { name: "Next month" }).click();
    await expect(caption(demo)).toContainText("December 2026");
    await demo.getByRole("button", { name: "Previous month" }).click();
    await demo.getByRole("button", { name: "Previous month" }).click();
    await expect(caption(demo)).toContainText("October 2026");
  });

  test("picks a year and a month from the built-in views", async ({ page }) => {
    const demo = preview(page, "calendar-demo");
    await caption(demo).click();
    const years = demo.getByRole("listbox", { name: "Year" });
    await expect(years).toBeVisible();
    await expect(years.getByRole("option", { name: "2026" })).toHaveAttribute("aria-selected", "true");
    await expect(years.getByRole("option", { name: "2026" })).toBeFocused();
    // The year list scrolls inside the calendar instead of jumping off-screen.
    await expect
      .poll(() =>
        years.evaluate((list) => {
          const option = list.querySelector('[aria-selected="true"]');
          if (!option) return false;
          const a = list.getBoundingClientRect();
          const b = option.getBoundingClientRect();
          return b.top >= a.top && b.bottom <= a.bottom;
        }),
      )
      .toBe(true);
    await page.keyboard.press("ArrowRight");
    await expect(years.getByRole("option", { name: "2027" })).toBeFocused();
    await years.getByRole("option", { name: "2030" }).click();

    const months = demo.getByRole("listbox", { name: "Month" });
    await expect(months).toBeVisible();
    await months.getByRole("option", { name: "March" }).click();
    await expect(caption(demo)).toContainText("March 2030");
    await expect(day(demo, "2030-03-15")).toBeFocused();
  });

  test("Escape leaves the year view", async ({ page }) => {
    const demo = preview(page, "calendar-demo");
    await caption(demo).click();
    await expect(demo.getByRole("listbox", { name: "Year" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(demo.getByRole("grid")).toBeVisible();
  });

  test("selects a range", async ({ page }) => {
    const demo = preview(page, "calendar-range");
    await day(demo, "2026-11-10").click();
    await expect(demo.locator("output")).toHaveText("Nov 10 – …");
    await day(demo, "2026-11-18").hover();
    await expect(day(demo, "2026-11-12")).toHaveClass(/bg-secondary-light/);
    await day(demo, "2026-11-18").click();
    await expect(demo.locator("output")).toHaveText("Nov 10 – Nov 18");
    await expect(day(demo, "2026-11-10")).toHaveAttribute("data-range-start");
    await expect(day(demo, "2026-11-18")).toHaveAttribute("data-range-end");
    await expect(day(demo, "2026-11-12")).toHaveAttribute("aria-selected", "true");
    await expect(day(demo, "2026-11-20")).toHaveAttribute("aria-selected", "false");

    // Picking an earlier end swaps the range.
    await day(demo, "2026-11-20").click();
    await day(demo, "2026-11-05").click();
    await expect(demo.locator("output")).toHaveText("Nov 5 – Nov 20");
  });

  test("min and max dates disable days and navigation (fixes #6541)", async ({ page }) => {
    const demo = preview(page, "calendar-min-max");
    await expect(demo.getByRole("button", { name: "Previous month" })).toBeDisabled();
    await expect(day(demo, "2026-11-11")).toHaveAttribute("aria-disabled", "true");
    await expect(day(demo, "2026-11-12")).not.toHaveAttribute("aria-disabled", /.*/);
    await day(demo, "2026-11-11").click({ force: true });
    await expect(day(demo, "2026-11-11")).toHaveAttribute("aria-selected", "false");

    // Keyboard focus is clamped to the range.
    await day(demo, "2026-11-12").click();
    await page.keyboard.press("ArrowLeft");
    await expect(day(demo, "2026-11-12")).toBeFocused();

    await demo.getByRole("button", { name: "Next month" }).click();
    await expect(demo.getByRole("button", { name: "Next month" })).toBeDisabled();
    await expect(day(demo, "2026-12-11")).toHaveAttribute("aria-disabled", "true");
  });

  test("disabled days and weekends cannot be selected", async ({ page }) => {
    const demo = preview(page, "calendar-disabled-days");
    await expect(day(demo, "2026-11-14")).toHaveAttribute("aria-disabled", "true");
    await expect(day(demo, "2026-11-13")).toHaveAttribute("aria-disabled", "true");
    await expect(day(demo, "2026-11-16")).not.toHaveAttribute("aria-disabled", /.*/);
    await day(demo, "2026-11-14").click({ force: true });
    await expect(day(demo, "2026-11-14")).toHaveAttribute("aria-selected", "false");
    await day(demo, "2026-11-16").click();
    await expect(day(demo, "2026-11-16")).toHaveAttribute("aria-selected", "true");
  });

  test("marks event days", async ({ page }) => {
    const demo = preview(page, "calendar-events");
    await expect(demo.getByRole("gridcell", { name: "Tuesday, November 17, 2026, has events" })).toBeVisible();
    await expect(demo.locator('[data-slot="calendar-event"]')).toHaveCount(4);
  });

  test("shows outside days and honours firstDayOfWeek", async ({ page }) => {
    const demo = preview(page, "calendar-outside-days");
    await expect(demo.getByRole("columnheader").first()).toContainText("Monday");
    await expect(day(demo, "2026-10-26")).toHaveAttribute("data-outside");
    await day(demo, "2026-12-01").click();
    await expect(caption(demo)).toContainText("December 2026");
  });

  test("localizes names, first day and direction", async ({ page }) => {
    const calendars = preview(page, "calendar-locales").locator('[data-slot="calendar"]');
    const [de, ar, ja] = [calendars.nth(0), calendars.nth(1), calendars.nth(2)];
    await expect(caption(de)).toContainText("November 2026");
    await expect(de.getByRole("columnheader").first()).toContainText("Montag");
    await expect(ar).toHaveAttribute("dir", "rtl");
    await expect(ar.getByRole("columnheader").first()).toContainText("السبت");
    await expect(day(ar, "2026-11-15")).toContainText("١٥");
    await expect(ja.getByRole("columnheader").first()).toContainText("日曜日");

    // Arrow keys follow the reading direction in RTL.
    await day(ar, "2026-11-15").focus();
    await page.keyboard.press("ArrowLeft");
    await expect(day(ar, "2026-11-16")).toBeFocused();
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
