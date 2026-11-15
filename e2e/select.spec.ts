import { expect, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

test.describe("Select", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "select");
  });

  test("renders a labelled combobox trigger with helper text", async ({ page }) => {
    const trigger = preview(page, "select-demo").getByRole("combobox", { name: /Materialize select/ });
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveAccessibleDescription(/Pick your favorite/);
  });

  test("mouse: opens, selects the clicked option and closes", async ({ page, isMobile }) => {
    test.skip(isMobile, "covered by the touch test");
    const trigger = preview(page, "select-demo").getByRole("combobox", { name: /Materialize select/ });
    await trigger.click();
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();
    // Stays open (Materialize opened and closed immediately on some Chrome versions).
    await page.waitForTimeout(300);
    await expect(listbox).toBeVisible();
    await page.getByRole("option", { name: "Option 2" }).click();
    await expect(listbox).toHaveCount(0);
    await expect(trigger).toContainText("Option 2");
    await expect(trigger).toBeFocused();
  });

  test("touch: tapping an option selects exactly that option", async ({ page, hasTouch }) => {
    test.skip(!hasTouch, "touch-only");
    const trigger = preview(page, "select-demo").getByRole("combobox", { name: /Materialize select/ });
    await trigger.tap();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.waitForTimeout(400);
    await page.getByRole("option", { name: "Option 3" }).tap();
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(trigger).toContainText("Option 3");
    await trigger.tap();
    await page.waitForTimeout(400);
    await page.getByRole("option", { name: "Option 1" }).tap();
    await expect(trigger).toContainText("Option 1");
  });

  test("keyboard: opens with Enter, arrows skip disabled options, Escape returns focus", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard");
    const trigger = preview(page, "select-demo").getByRole("combobox", { name: /Materialize select/ });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("listbox")).toBeVisible();
    await expect(page.getByRole("option", { name: "Option 4 (sold out)" })).toHaveAttribute("aria-disabled", "true");
    // Radix moves focus in a timeout after each arrow key, so wait for it before the next key.
    await expect(page.getByRole("option", { name: "Option 1" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("option", { name: "Option 2" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("option", { name: "Option 3" })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("option", { name: "Option 3" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(trigger).toContainText("Option 3");
    await expect(trigger).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).toContainText("Option 3");
  });

  test("groups render labels and options", async ({ page }) => {
    const trigger = preview(page, "select-groups").getByRole("combobox", { name: /Optgroups/ });
    await expect(trigger).toContainText("Choose your option");
    await trigger.click();
    await expect(page.getByRole("group")).toHaveCount(2);
    await expect(page.getByText("Team 2", { exact: true })).toBeVisible();
    await page.getByRole("option", { name: "Option 4" }).click();
    await expect(trigger).toContainText("Option 4");
  });

  test("options can show icons", async ({ page }) => {
    const trigger = preview(page, "select-icons").getByRole("combobox", { name: /Transport/ });
    await expect(trigger).toContainText("Car");
    await trigger.click();
    await expect(page.getByRole("option", { name: /Bike/ })).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("controlled value updates are reflected both ways", async ({ page }) => {
    const scope = preview(page, "select-controlled");
    const trigger = scope.getByRole("combobox", { name: /Fruit/ });
    await expect(trigger).toContainText("Apple");
    await scope.getByRole("button", { name: "Pick cherry" }).click();
    await expect(trigger).toContainText("Cherry");
    await trigger.click();
    await page.getByRole("option", { name: "Banana" }).click();
    await expect(scope.getByText("Value: banana")).toBeVisible();
    await scope.getByRole("button", { name: "Clear" }).click();
    await expect(scope.getByText("Value: (none)")).toBeVisible();
    await expect(trigger).not.toContainText("Banana");
  });

  test("the list is not clipped inside an overflow-hidden container", async ({ page }) => {
    const scope = preview(page, "select-overflow");
    const box = scope.locator(".overflow-hidden").first();
    await scope.getByRole("combobox", { name: /Inside overflow/ }).click();
    const listbox = page.getByRole("listbox");
    await expect(listbox).toBeVisible();
    const container = await box.boundingBox();
    const list = await listbox.boundingBox();
    if (!container || !list) throw new Error("missing boxes");
    // Portalled: the list escapes the clipping box (it may open below or flip above).
    const escapes = list.y + list.height > container.y + container.height + 1 || list.y < container.y - 1;
    expect(escapes).toBe(true);
    expect(list.height).toBeGreaterThan(container.height);
    const last = page.getByRole("option", { name: "Foxtrot" });
    await expect(last).toBeInViewport();
    await last.click();
    await expect(scope.getByRole("combobox", { name: /Inside overflow/ })).toContainText("Foxtrot");
  });

  test("NativeSelect is a real labelled <select>", async ({ page }) => {
    const select = preview(page, "select-native").getByLabel("Browser select");
    expect(await select.evaluate((el) => el.tagName)).toBe("SELECT");
    await select.selectOption("m");
    await expect(select).toHaveValue("m");
    await expect(select).toHaveAccessibleDescription(/platform picker/);
  });

  test("MultiSelect: listbox with checkboxes, keyboard toggling, type-ahead and Escape", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard");
    const scope = preview(page, "select-multiple");
    const trigger = scope.getByRole("combobox", { name: /^Toppings/ }).first();
    await expect(trigger).toContainText("Cheese");
    await trigger.focus();
    await page.keyboard.press("Enter");
    const listbox = page.getByRole("listbox");
    await expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    await expect(listbox).toBeFocused();
    await expect(page.getByRole("option", { name: "Cheese" })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press(" ");
    await expect(page.getByRole("option", { name: "Mushrooms" })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("p");
    await page.keyboard.press("Enter");
    await expect(page.getByRole("option", { name: "Peppers" })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    // Pineapple is disabled; End lands on the last enabled option (Peppers) and toggles it off.
    await expect(page.getByRole("option", { name: "Pineapple" })).toHaveAttribute("aria-disabled", "true");
    await page.keyboard.press("Home");
    await page.keyboard.press(" ");
    await expect(page.getByRole("option", { name: "Cheese" })).toHaveAttribute("aria-selected", "false");
    await page.keyboard.press("Escape");
    await expect(listbox).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).toContainText("Mushrooms");
  });

  test("MultiSelect: mouse toggles and chips display", async ({ page }) => {
    const scope = preview(page, "select-multiple");
    const trigger = scope.getByRole("combobox", { name: /Toppings \(chips\)/ });
    await trigger.click();
    await page.getByRole("option", { name: "Olives" }).click();
    await page.getByRole("option", { name: "Cheese" }).click();
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(scope.locator('[data-slot="multi-select-chip"]')).toHaveText(["Cheese", "Olives"]);
  });

  test("form submission includes Select, NativeSelect and MultiSelect values", async ({ page }) => {
    const scope = preview(page, "select-form");
    await scope.getByRole("button", { name: "Submit" }).click();
    await expect(scope.locator("output")).toHaveText('{"plan":"pro","billing":"yearly","extras":["backup"]}');
    await scope.getByRole("combobox", { name: /Plan/ }).click();
    await page.getByRole("option", { name: "Team" }).click();
    await scope.getByLabel("Billing").selectOption("monthly");
    await scope.getByRole("combobox", { name: /Extras/ }).click();
    await page.getByRole("option", { name: "Single sign-on" }).click();
    await page.keyboard.press("Escape");
    await scope.getByRole("button", { name: "Submit" }).click();
    await expect(scope.locator("output")).toHaveText('{"plan":"team","billing":"monthly","extras":["backup","sso"]}');
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
