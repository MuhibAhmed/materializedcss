import { expect, test, type Locator, type Page } from "@playwright/test";

import { expectNoA11yViolations, waitForHydration } from "./utils";

const TOUR_KEY = "materializedcss-store-tour";

/** Open the store. The cart tour is marked as seen unless `tour` is set. */
async function gotoStore(page: Page, { tour = false, theme }: { tour?: boolean; theme?: "light" | "dark" } = {}): Promise<void> {
  await page.addInitScript(
    ({ key, tour, theme }) => {
      if (!tour) localStorage.setItem(key, "1");
      if (theme) localStorage.setItem("theme", theme);
    },
    { key: TOUR_KEY, tour, theme },
  );
  await page.goto("/examples/store");
  await expect(page.getByRole("heading", { level: 1, name: "Shop all" })).toBeVisible();
  await waitForHydration(page);
}

function cartButton(page: Page): Locator {
  return page.getByTestId("cart-button");
}

function results(page: Page): Locator {
  return page.getByRole("list", { name: "Products" }).getByRole("listitem");
}

async function addFirstProduct(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Add Trail Runner 2 to cart" }).click();
  await expect(cartButton(page)).toHaveAccessibleName("Open cart, 1 item");
}

test.describe("Store example", () => {
  test("adding to the cart updates the badge and shows a toast", async ({ page }) => {
    await gotoStore(page);
    await expect(cartButton(page)).toHaveAccessibleName("Open cart, 0 items");
    await expect(page.getByTestId("cart-count")).toHaveCount(0);

    await addFirstProduct(page);
    await expect(page.getByTestId("cart-count")).toHaveText("1");
    await expect(page.locator("[data-slot=toast]").filter({ hasText: "Added Trail Runner 2" })).toBeVisible();

    await page.getByRole("button", { name: "Add Halo ANC Headphones to cart" }).click();
    await expect(page.getByTestId("cart-count")).toHaveText("2");
    await expect(cartButton(page)).toHaveAccessibleName("Open cart, 2 items");
  });

  test("filters, tabs and search narrow the results", async ({ page }) => {
    await gotoStore(page);
    const count = page.getByTestId("result-count");
    await expect(count).toContainText("24 products");
    await expect(results(page)).toHaveCount(9);

    const filters = page.getByRole("complementary", { name: "Product filters" });
    await filters.getByRole("checkbox", { name: "Lumen" }).click();
    await expect(count).toContainText("3 products");
    await expect(results(page)).toHaveCount(3);
    await expect(page.getByRole("button", { name: "Remove filter Lumen" })).toBeVisible();

    await page.getByRole("button", { name: "Remove filter Lumen" }).click();
    await expect(count).toContainText("24 products");
    await filters.getByRole("switch", { name: "In stock only" }).click();
    await expect(count).toContainText("22 products");

    await page.getByRole("tab", { name: "Audio" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Audio");
    await expect(count).toContainText("4 products");

    await filters.getByRole("button", { name: "Clear all" }).click();
    await page.getByRole("tab", { name: "All" }).click();
    await expect(count).toContainText("24 products");

    await page.getByRole("combobox", { name: "Search products" }).fill("lamp");
    await page.getByRole("combobox", { name: "Search products" }).press("Enter");
    await expect(count).toContainText("2 products");
    await expect(page.getByRole("button", { name: "Remove filter “lamp”" })).toBeVisible();
  });

  test("pagination loads the next page", async ({ page }) => {
    await gotoStore(page);
    await page.getByRole("navigation", { name: "Product pages" }).getByRole("button", { name: "Page 2" }).click();
    await expect(page.getByTestId("result-count")).toContainText("page 2 of 3");
    await expect(results(page)).toHaveCount(9);
  });

  test("quick view opens, picks options and closes", async ({ page }) => {
    await gotoStore(page);
    await page.getByRole("button", { name: "Quick view: Trail Runner 2" }).click();
    const dialog = page.getByRole("dialog", { name: "Trail Runner 2" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("region", { name: "Trail Runner 2 photos" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();

    await page.getByRole("button", { name: "Quick view: Trail Runner 2" }).click();
    await dialog.getByRole("button", { name: "Teal" }).click();
    await expect(dialog.getByRole("button", { name: "Teal" })).toHaveAttribute("aria-pressed", "true");
    await expect(dialog.getByRole("button", { name: "12, sold out" })).toBeDisabled();
    await dialog.getByRole("button", { name: "9", exact: true }).click();
    await dialog.getByRole("button", { name: "Increase quantity" }).click();
    await dialog.getByRole("button", { name: "Add to cart" }).click();
    await expect(dialog).toBeHidden();
    await expect(cartButton(page)).toHaveAccessibleName("Open cart, 2 items");

    await cartButton(page).click();
    const cart = page.getByRole("dialog", { name: "Shopping cart" });
    await expect(cart.getByTestId("cart-line")).toContainText("Teal · 9");
  });

  test("cart changes quantities, removes items and undoes", async ({ page }) => {
    await gotoStore(page);
    await addFirstProduct(page);
    await cartButton(page).click();
    const cart = page.getByRole("dialog", { name: "Shopping cart" });
    await expect(cart.getByTestId("cart-subtotal")).toHaveText("$99.00");
    await cart.getByRole("button", { name: "Increase quantity" }).click();
    await expect(cart.getByTestId("cart-subtotal")).toHaveText("$198.00");
    await cart.getByRole("button", { name: "Remove Trail Runner 2" }).click();
    await expect(cart.getByText("Your cart is empty")).toBeVisible();
    // The open drawer hides the rest of the page (toasts included) from the accessibility tree.
    await page.locator("[data-slot=toast] button", { hasText: "Undo" }).click();
    await expect(cart.getByTestId("cart-subtotal")).toHaveText("$198.00");
  });

  test("checkout validates each step and places the order", async ({ page }) => {
    await gotoStore(page);
    await addFirstProduct(page);
    await cartButton(page).click();
    await page.getByRole("dialog", { name: "Shopping cart" }).getByRole("button", { name: "Checkout" }).click();

    const checkout = page.getByTestId("checkout");
    await expect(checkout.getByRole("heading", { name: "Checkout" })).toBeVisible();
    await checkout.getByRole("button", { name: "Continue" }).click();
    await expect(checkout.getByText("Enter your full name")).toBeVisible();
    await expect(checkout.getByRole("textbox", { name: "Full name" })).toHaveAttribute("aria-invalid", "true");
    await expect(checkout.getByRole("textbox", { name: "Full name" })).toBeFocused();
    await expect(checkout.getByRole("tab", { name: "Delivery" })).toBeDisabled();

    await checkout.getByRole("textbox", { name: "Full name" }).fill("Ada Lovelace");
    await checkout.getByRole("textbox", { name: "Email" }).fill("ada@example");
    await checkout.getByRole("textbox", { name: "Street address" }).fill("Rua das Flores 28");
    await checkout.getByRole("textbox", { name: "City" }).fill("Lisbon");
    await checkout.getByRole("textbox", { name: "Postal code" }).fill("1200-195");
    await checkout.getByRole("button", { name: "Continue" }).click();
    await expect(checkout.getByText("Enter a valid email")).toBeVisible();
    await checkout.getByRole("textbox", { name: "Email" }).fill("ada@example.com");
    await checkout.getByRole("button", { name: "Continue" }).click();

    await expect(checkout.getByRole("tab", { name: "Delivery" })).toHaveAttribute("aria-selected", "true");
    await checkout.getByRole("button", { name: "Continue" }).click();
    await expect(checkout.getByText("Choose a delivery date")).toBeVisible();
    await checkout.getByRole("radio", { name: "Store pickup" }).click();
    await checkout.getByRole("switch", { name: "This order is a gift" }).click();
    await expect(checkout.getByText("Gift card image")).toBeVisible();
    await checkout.getByRole("button", { name: "Continue" }).click();

    await expect(checkout.getByRole("tab", { name: "Payment" })).toHaveAttribute("aria-selected", "true");
    await checkout.getByRole("button", { name: "Continue" }).click();
    await expect(checkout.getByText("Enter a 16-digit card number")).toBeVisible();
    await checkout.getByRole("textbox", { name: "Name on card" }).fill("Ada Lovelace");
    await checkout.getByRole("textbox", { name: "Card number" }).fill("4242424242424242");
    await expect(checkout.getByRole("textbox", { name: "Card number" })).toHaveValue("4242 4242 4242 4242");
    await checkout.getByRole("textbox", { name: "Expiry (MM/YY)" }).fill("1229");
    await checkout.getByRole("textbox", { name: "CVC" }).fill("123");
    await checkout.getByRole("button", { name: "Continue" }).click();

    await expect(checkout.getByRole("tab", { name: "Review" })).toHaveAttribute("aria-selected", "true");
    await expect(checkout.getByRole("table", { name: "Order summary" })).toContainText("Trail Runner 2");
    await expect(checkout.getByTestId("order-total")).toHaveText("$104.94");
    await checkout.getByRole("button", { name: "Place order" }).click();
    await expect(checkout.getByText("Please accept the terms")).toBeVisible();
    await checkout.getByRole("checkbox", { name: /I agree to the terms/ }).click();
    await checkout.getByRole("button", { name: "Place order" }).click();
    await expect(page.getByRole("heading", { name: "Thank you, Ada!" })).toBeVisible();
    await page.getByRole("button", { name: "Continue shopping" }).click();
    await expect(cartButton(page)).toHaveAccessibleName("Open cart, 0 items");
  });

  test("shows the cart tour once", async ({ page }) => {
    await gotoStore(page, { tour: true });
    await expect(page.getByRole("heading", { name: "Your cart lives here" })).toBeVisible();
    await page.getByRole("button", { name: "Got it" }).click();
    await expect(page.getByRole("heading", { name: "Your cart lives here" })).toBeHidden();
    expect(await page.evaluate((key) => localStorage.getItem(key), TOUR_KEY)).toBe("1");
  });

  test("has no accessibility violations in light and dark mode", async ({ page }) => {
    await gotoStore(page);
    await expectNoA11yViolations(page);
    await page.getByRole("button", { name: "Toggle dark mode" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expectNoA11yViolations(page);
  });

  test("quick view and checkout dialogs are accessible", async ({ page }) => {
    await gotoStore(page, { theme: "dark" });
    await page.getByRole("button", { name: "Quick view: Halo ANC Headphones" }).click();
    await expect(page.getByRole("dialog", { name: "Halo ANC Headphones" })).toBeVisible();
    await expectNoA11yViolations(page, "[data-testid=quick-view]");
    await page.keyboard.press("Escape");

    await addFirstProduct(page);
    await cartButton(page).click();
    await expectNoA11yViolations(page, "[data-testid=cart]");
    await page.getByRole("dialog", { name: "Shopping cart" }).getByRole("button", { name: "Checkout" }).click();
    await page.getByTestId("checkout").getByRole("button", { name: "Continue" }).click();
    await expectNoA11yViolations(page, "[data-testid=checkout]");
  });
});

test.describe("Store example on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("fits the screen and moves filters into a dialog", async ({ page }) => {
    await gotoStore(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
    await expect(page.getByRole("complementary", { name: "Product filters" })).toBeHidden();

    await page.getByRole("button", { name: /^Filters/ }).click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("checkbox", { name: "Orbit" }).click();
    await dialog.getByRole("button", { name: /^Show \d+ results?$/ }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId("result-count")).toContainText("4 products");

    await page.getByRole("button", { name: "Open store menu" }).click();
    const menu = page.getByRole("dialog", { name: "Store menu" });
    await expect(menu).toBeVisible();
    await menu.getByRole("button", { name: "Audio" }).click();
    await expect(menu).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Audio");
  });

  test("has no accessibility violations on a phone", async ({ page }) => {
    await gotoStore(page);
    await expectNoA11yViolations(page);
  });
});
