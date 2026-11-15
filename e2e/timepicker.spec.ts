import { expect, test, type Locator, type Page } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

const dialog = (page: Page): Locator => page.getByRole("dialog", { name: "Select time" });
// Located by tag: while the modal is open Radix hides the page from the accessibility tree.
const field = (page: Page, example: string): Locator =>
  preview(page, example).locator('input[data-slot="picker-input"]').first();
const hours = (page: Page): Locator => dialog(page).getByRole("spinbutton", { name: "Hours" });
const minutes = (page: Page): Locator => dialog(page).getByRole("spinbutton", { name: "Minutes" });

/** Wait for the dialog's open (scale-in) animation, so measured boxes are final. */
async function settled(page: Page): Promise<void> {
  await expect(dialog(page)).toBeVisible();
  await dialog(page).evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
}

/** Click the center of a dial tick (ticks ignore pointer events; the plate handles them). */
async function clickTick(page: Page, dial: "Hours" | "Minutes", label: string): Promise<void> {
  await settled(page);
  const tick = dialog(page).getByRole("listbox", { name: dial }).getByRole("option", { name: label, exact: true });
  const box = await tick.boundingBox();
  if (!box) throw new Error(`no tick ${label}`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

test.describe("Timepicker", () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-15T10:00:00"));
    await gotoComponent(page, "timepicker");
  });

  test("opens the clock modal with keyboard focus on the hours", async ({ page }) => {
    await expect(field(page, "timepicker-demo")).toHaveValue("10:30 AM");
    await field(page, "timepicker-demo").click();
    await expect(dialog(page)).toBeVisible();
    await expect(hours(page)).toBeFocused();
    await expect(hours(page)).toHaveAttribute("aria-valuenow", "10");
    await expect(hours(page)).toHaveAttribute("aria-valuetext", "10 AM");
    await expect(minutes(page)).toHaveText("30");
    await expect(dialog(page).getByRole("button", { name: "AM" })).toHaveAttribute("aria-pressed", "true");
    await expect(dialog(page).getByRole("listbox", { name: "Hours" }).getByRole("option")).toHaveCount(12);
  });

  test("picks hours then minutes on the dial and commits with OK", async ({ page }) => {
    await field(page, "timepicker-demo").click();
    await clickTick(page, "Hours", "3 AM");
    await expect(hours(page)).toHaveText("3");
    // Auto-switches to the minutes dial.
    await expect(minutes(page)).toHaveAttribute("data-active", "true");
    await clickTick(page, "Minutes", "45");
    await expect(minutes(page)).toHaveText("45");
    await dialog(page).getByRole("button", { name: "Ok" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(field(page, "timepicker-demo")).toHaveValue("3:45 AM");
    await expect(field(page, "timepicker-demo")).toBeFocused();
  });

  test("dragging the hand snaps to the nearest value", async ({ page }) => {
    await field(page, "timepicker-demo").click();
    const plate = dialog(page).locator('[data-slot="timepicker-plate"]');
    await settled(page);
    const box = await plate.boundingBox();
    if (!box) throw new Error("no plate");
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy - 100);
    await page.mouse.down();
    await expect(hours(page)).toHaveText("12");
    await page.mouse.move(cx + 100, cy, { steps: 5 });
    await expect(hours(page)).toHaveText("3");
    await page.mouse.move(cx + 3, cy + 100, { steps: 5 });
    await expect(hours(page)).toHaveText("6");
    await page.mouse.up();
    await expect(minutes(page)).toHaveAttribute("data-active", "true");
    // Minutes snap to the nearest minute while dragging.
    await page.mouse.move(cx + 100, cy + 10);
    await page.mouse.down();
    await page.mouse.up();
    await expect(minutes(page)).toHaveText("16");
  });

  test("spinbuttons support arrows, PageUp/PageDown and typed digits", async ({ page }) => {
    await field(page, "timepicker-demo").click();
    await expect(hours(page)).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(hours(page)).toHaveAttribute("aria-valuenow", "11");
    await page.keyboard.press("7");
    await expect(hours(page)).toHaveAttribute("aria-valuenow", "7");
    await page.keyboard.press("Tab");
    await expect(minutes(page)).toBeFocused();
    await expect(minutes(page)).toHaveAttribute("data-active", "true");
    await page.keyboard.press("ArrowDown");
    await expect(minutes(page)).toHaveAttribute("aria-valuenow", "29");
    await page.keyboard.press("PageUp");
    await expect(minutes(page)).toHaveAttribute("aria-valuenow", "34");
    await page.keyboard.press("0");
    await page.keyboard.press("5");
    await expect(minutes(page)).toHaveAttribute("aria-valuenow", "5");
    await dialog(page).getByRole("button", { name: "PM" }).click();
    await expect(hours(page)).toHaveAttribute("aria-valuetext", "7 PM");
    await dialog(page).getByRole("button", { name: "Ok" }).click();
    await expect(field(page, "timepicker-demo")).toHaveValue("7:05 PM");
  });

  test("dial ticks are focusable and move with the arrow keys", async ({ page }) => {
    await field(page, "timepicker-demo").click();
    const hourDial = dialog(page).getByRole("listbox", { name: "Hours" });
    const selected = hourDial.getByRole("option", { selected: true });
    await expect(selected).toHaveAccessibleName("10 AM");
    await selected.focus();
    await page.keyboard.press("ArrowRight");
    await expect(hourDial.getByRole("option", { name: "11 AM" })).toBeFocused();
    await expect(hours(page)).toHaveText("11");
    await page.keyboard.press("Enter");
    const minuteDial = dialog(page).getByRole("listbox", { name: "Minutes" });
    await expect(minuteDial.getByRole("option", { name: "30" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(minuteDial.getByRole("option", { name: "29" })).toBeFocused();
    await expect(minutes(page)).toHaveText("29");
  });

  test("Escape and Cancel close without committing; Clear empties", async ({ page }) => {
    await field(page, "timepicker-demo").click();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeHidden();
    await expect(field(page, "timepicker-demo")).toHaveValue("10:30 AM");
    await expect(field(page, "timepicker-demo")).toBeFocused();

    await field(page, "timepicker-demo").click();
    await page.keyboard.press("ArrowUp");
    await dialog(page).getByRole("button", { name: "Cancel" }).click();
    await expect(field(page, "timepicker-demo")).toHaveValue("10:30 AM");

    await field(page, "timepicker-demo").click();
    await dialog(page).getByRole("button", { name: "Clear" }).click();
    await expect(dialog(page)).toBeHidden();
    await expect(field(page, "timepicker-demo")).toHaveValue("");
  });

  test("overlay click closes the modal", async ({ page }) => {
    await field(page, "timepicker-demo").click();
    await expect(dialog(page)).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(dialog(page)).toBeHidden();
  });

  test("typing a time in the field works", async ({ page }) => {
    const input = field(page, "timepicker-demo");
    await input.fill("10:15 pm");
    await input.press("Enter");
    await expect(input).toHaveValue("10:15 PM");
    await input.fill("garbage");
    await input.press("Tab");
    await expect(input).toHaveValue("10:15 PM");
  });

  test("24-hour dial uses an inner and an outer ring", async ({ page }) => {
    await expect(field(page, "timepicker-24-hour")).toHaveValue("18:45");
    await field(page, "timepicker-24-hour").click();
    await expect(dialog(page).getByRole("button", { name: "AM" })).toHaveCount(0);
    await expect(dialog(page).getByRole("listbox", { name: "Hours" }).getByRole("option")).toHaveCount(24);
    await clickTick(page, "Hours", "3");
    await expect(hours(page)).toHaveText("03");
    await hours(page).click();
    await clickTick(page, "Hours", "15");
    await expect(hours(page)).toHaveText("15");
    await hours(page).click();
    await clickTick(page, "Hours", "00");
    await expect(hours(page)).toHaveText("00");
  });

  test("step, minTime and maxTime restrict the choices", async ({ page }) => {
    await field(page, "timepicker-step").click();
    await expect(dialog(page).getByRole("listbox", { name: "Hours" }).getByRole("option", { name: "8 AM" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await page.keyboard.press("ArrowDown");
    await expect(hours(page)).toHaveAttribute("aria-valuetext", "5 PM");
    await minutes(page).click();
    await expect(dialog(page).getByRole("listbox", { name: "Minutes" }).getByRole("option")).toHaveCount(4);
    await page.keyboard.press("ArrowUp");
    await expect(minutes(page)).toHaveAttribute("aria-valuenow", "15");
    await page.keyboard.press("ArrowUp");
    await expect(minutes(page)).toHaveAttribute("aria-valuenow", "30");
    // 17:45 is past maxTime.
    await page.keyboard.press("ArrowUp");
    await expect(minutes(page)).toHaveAttribute("aria-valuenow", "0");
    await page.keyboard.press("Escape");

    const input = field(page, "timepicker-step");
    await input.fill("10:10 AM");
    await input.press("Enter");
    await expect(input).toHaveValue("9:00 AM");
  });

  test("controlled value follows outside changes", async ({ page }) => {
    const example = preview(page, "timepicker-controlled");
    await expect(field(page, "timepicker-controlled")).toHaveValue("7:00 AM");
    await example.getByRole("button", { name: "6:30" }).click();
    await expect(field(page, "timepicker-controlled")).toHaveValue("6:30 AM");
    await field(page, "timepicker-controlled").click();
    await clickTick(page, "Hours", "9 AM");
    await clickTick(page, "Minutes", "15");
    await dialog(page).getByRole("button", { name: "Ok" }).click();
    await expect(example.getByLabel("Controlled value")).toHaveText("09:15");
    await example.getByRole("button", { name: "Reset" }).click();
    await expect(field(page, "timepicker-controlled")).toHaveValue("");
  });

  test("submits HH:mm in forms and autoClose commits after the minutes", async ({ page }) => {
    const form = preview(page, "timepicker-form");
    const time = form.locator('input[data-slot="picker-input"]').nth(1);
    await time.click();
    await clickTick(page, "Hours", "8 PM");
    await clickTick(page, "Minutes", "20");
    await expect(dialog(page)).toBeHidden();
    await expect(time).toHaveValue("8:20 PM");
    await form.getByRole("button", { name: "Reserve" }).click();
    await expect(form.getByLabel("Submitted values")).toHaveText('{"date":"2026-11-20","time":"20:20"}');
  });

  test("localizes AM/PM, digits and the clock", async ({ page }) => {
    const example = preview(page, "timepicker-locales");
    await expect(field(page, "timepicker-locales")).toHaveValue("14:05");
    await example.locator('input[data-slot="picker-input"]').nth(2).click();
    const ja = page.getByRole("dialog", { name: "時刻を選択" });
    await expect(ja.getByRole("button", { name: "午前" })).toHaveAttribute("aria-pressed", "true");
    await expect(ja.getByRole("button", { name: "午後" })).toBeVisible();
    await page.keyboard.press("Escape");
    await example.locator('input[data-slot="picker-input"]').nth(1).click();
    const ar = page.getByRole("dialog", { name: "اختر الوقت" });
    await expect(ar).toHaveAttribute("dir", "rtl");
    await expect(ar.getByRole("spinbutton", { name: "الدقائق" })).toHaveText("٣٠");
  });

  test("touch: tapping the dial picks a value", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.use.hasTouch, "touch devices only");
    await field(page, "timepicker-demo").click();
    await settled(page);
    const tick = dialog(page).getByRole("listbox", { name: "Hours" }).getByRole("option", { name: "4 AM", exact: true });
    const box = await tick.boundingBox();
    if (!box) throw new Error("no tick");
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await expect(hours(page)).toHaveText("4");
  });

  test("has no serious accessibility violations, closed and open", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
    await field(page, "timepicker-demo").click();
    await expect(dialog(page)).toBeVisible();
    await expectNoA11yViolations(page, '[role="dialog"]');
  });
});
