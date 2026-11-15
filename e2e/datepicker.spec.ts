import { expect, test, type Locator, type Page } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

const day = (scope: Locator | Page, iso: string): Locator => scope.locator(`[role="gridcell"][data-date="${iso}"]`);
const dialog = (page: Page): Locator => page.getByRole("dialog", { name: "Select date" });
// Located by tag: while the modal is open Radix hides the page from the accessibility tree.
const birthday = (page: Page): Locator => preview(page, "datepicker-demo").locator('input[data-slot="picker-input"]');

test.describe("Datepicker", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-15T10:00:00"));
    await gotoComponent(page, "datepicker");
  });

  test("opens the Materialize modal on click and commits with OK", async ({ page }) => {
    const input = birthday(page);
    await expect(input).toHaveValue("");
    await input.click();
    const modal = dialog(page);
    await expect(modal).toBeVisible();
    // Focus starts on today's cell, and the header shows today.
    await expect(day(modal, "2026-11-15")).toBeFocused();
    await expect(modal.locator('[data-slot="datepicker-date"]')).toHaveText("Sun, Nov 15");
    await expect(modal.locator('[data-slot="datepicker-year"]')).toHaveText("2026");

    await day(modal, "2026-11-20").click();
    await expect(modal.locator('[data-slot="datepicker-date"]')).toHaveText("Fri, Nov 20");
    // Nothing is committed before OK.
    await expect(input).toHaveValue("");
    await modal.getByRole("button", { name: "Ok" }).click();
    await expect(modal).toBeHidden();
    await expect(input).toHaveValue("Nov 20, 2026");
    await expect(input).toBeFocused();
  });

  test("Cancel discards the draft and Clear empties the value", async ({ page }) => {
    const input = birthday(page);
    await input.click();
    await day(dialog(page), "2026-11-03").click();
    await dialog(page).getByRole("button", { name: "Ok" }).click();
    await expect(input).toHaveValue("Nov 3, 2026");

    await input.click();
    await expect(day(dialog(page), "2026-11-03")).toHaveAttribute("aria-selected", "true");
    await day(dialog(page), "2026-11-25").click();
    await dialog(page).getByRole("button", { name: "Cancel" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(input).toHaveValue("Nov 3, 2026");

    await input.click();
    await dialog(page).getByRole("button", { name: "Clear" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(input).toHaveValue("");
  });

  test("selects with the keyboard and opens with Alt+ArrowDown", async ({ page }) => {
    const input = birthday(page);
    await input.focus();
    await page.keyboard.press("Alt+ArrowDown");
    await expect(dialog(page)).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("PageDown");
    await expect(day(dialog(page), "2026-12-16")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dialog(page).locator('[data-slot="datepicker-date"]')).toHaveText("Wed, Dec 16");
    await dialog(page).getByRole("button", { name: "Ok" }).click();
    await expect(input).toHaveValue("Dec 16, 2026");
  });

  test("the icon button opens the picker", async ({ page }) => {
    await preview(page, "datepicker-demo").getByRole("button", { name: "Choose date" }).click();
    await expect(dialog(page)).toBeVisible();
  });

  test("Escape and overlay click close the modal and fire onOpenChange (fixes #6500)", async ({ page }) => {
    const example = preview(page, "datepicker-controlled");
    const input = example.getByRole("textbox", { name: "Start date" });
    await input.click();
    await expect(dialog(page)).toBeVisible();
    await expect(example).toContainText("open: true");
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeHidden();
    await expect(example).toContainText("open: false");
    await expect(input).toBeFocused();

    await example.getByRole("button", { name: "Open" }).click();
    await expect(dialog(page)).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(dialog(page)).toBeHidden();
    await expect(example).toContainText("open: false");
  });

  test("controlled value follows outside changes", async ({ page }) => {
    const example = preview(page, "datepicker-controlled");
    const input = example.getByRole("textbox", { name: "Start date" });
    await expect(input).toHaveValue("Nov 15, 2026");
    await input.click();
    await day(dialog(page), "2026-11-02").click();
    await dialog(page).getByRole("button", { name: "Ok" }).click();
    await expect(example.getByLabel("Controlled value")).toHaveText("Mon Nov 02 2026");
    await example.getByRole("button", { name: "Today" }).click();
    await expect(input).toHaveValue("Nov 15, 2026");
  });

  test("typed dates are parsed and respected on open (fixes #6575)", async ({ page }) => {
    const input = birthday(page);
    await input.focus();
    await page.keyboard.type("12/3/2026");
    await page.keyboard.press("Tab");
    await expect(input).toHaveValue("Dec 3, 2026");

    await input.fill("Jan 9, 2027");
    await input.click();
    await expect(input).toHaveValue("Jan 9, 2027");
    await expect(day(dialog(page), "2027-01-09")).toHaveAttribute("aria-selected", "true");
    await expect(day(dialog(page), "2027-01-09")).toBeFocused();
    await page.keyboard.press("Escape");

    // Invalid text reverts to the last valid value.
    await input.fill("not a date");
    await input.press("Enter");
    await expect(input).toHaveValue("Jan 9, 2027");
  });

  test("popover variant selects and closes", async ({ page }) => {
    const input = preview(page, "datepicker-popover").getByRole("textbox", { name: "Check-in" });
    await input.click();
    const popover = page.getByRole("dialog", { name: "Select date" });
    await expect(popover).toBeVisible();
    await expect(popover.locator('[data-slot="datepicker-header"]')).toHaveCount(0);
    await expect(day(popover, "2026-11-15")).toBeFocused();
    await day(popover, "2026-11-18").click();
    await expect(popover).toBeHidden();
    await expect(input).toHaveValue("Nov 18, 2026");
    await expect(input).toBeFocused();

    await input.click();
    await expect(popover).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(popover).toBeHidden();
    await expect(input).toBeFocused();
  });

  test("min / max and disabled days are enforced", async ({ page }) => {
    await preview(page, "datepicker-min-max").getByRole("textbox", { name: "Delivery date" }).click();
    const modal = dialog(page);
    await expect(modal.getByRole("button", { name: "Previous month" })).toBeDisabled();
    await expect(day(modal, "2026-11-14")).toHaveAttribute("aria-disabled", "true");
    await page.keyboard.press("Escape");

    const input = preview(page, "datepicker-disabled-days").getByRole("textbox", { name: "Appointment" });
    await input.fill("11/14/2026");
    await input.press("Enter");
    await expect(input).toHaveValue("");
    await input.fill("11/16/2026");
    await input.press("Enter");
    await expect(input).toHaveValue("Nov 16, 2026");
  });

  test("read-only and disabled fields never open (fixes #6538)", async ({ page }) => {
    const example = preview(page, "datepicker-states");
    await example.getByRole("textbox", { name: "Read only" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(example.getByRole("textbox", { name: "Disabled" })).toBeDisabled();
    await expect(example.getByRole("button", { name: "Choose date" }).first()).toBeDisabled();
  });

  test("submits yyyy-mm-dd in forms; autoClose commits on pick", async ({ page }) => {
    const form = preview(page, "datepicker-form");
    await form.getByRole("textbox", { name: "Departure" }).click();
    await page.keyboard.press("PageDown");
    await day(dialog(page), "2026-12-28").click();
    await expect(dialog(page)).toBeHidden();
    await expect(form.getByRole("textbox", { name: "Departure" })).toHaveValue("Dec 28, 2026");
    await form.getByRole("button", { name: "Book" }).click();
    await expect(form.getByLabel("Submitted values")).toHaveText('{"arrival":"2026-12-24","departure":"2026-12-28"}');
  });

  test("localizes the field and the modal", async ({ page }) => {
    const example = preview(page, "datepicker-locales");
    await expect(example.getByRole("textbox", { name: "Datum" })).toHaveValue("15. Nov. 2026");
    await expect(example.getByRole("textbox", { name: "日付" })).toHaveValue("2026年11月15日");
    await example.getByRole("textbox", { name: "التاريخ" }).click();
    const modal = page.getByRole("dialog", { name: "اختر التاريخ" });
    await expect(modal).toHaveAttribute("dir", "rtl");
    await expect(modal.getByRole("button", { name: "تم" })).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("has no serious accessibility violations, closed and open", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
    await preview(page, "datepicker-demo").getByRole("textbox", { name: "Birthday" }).click();
    await expect(dialog(page)).toBeVisible();
    await expectNoA11yViolations(page, '[role="dialog"]');
  });
});
