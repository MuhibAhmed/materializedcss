import { expect, test, type Locator, type Page } from "@playwright/test";

import { expectNoA11yViolations } from "./utils";

/** Open the homepage and wait for the demos to hydrate. */
async function gotoHome(page: Page): Promise<void> {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.waitForLoadState("networkidle");
}

/** A demo card in the mosaic, found by its heading. */
function demoCard(page: Page, title: string): Locator {
  return page.locator("[data-slot=mosaic] [data-slot=card]", {
    has: page.getByRole("heading", { name: title, exact: true }),
  });
}

function examples(page: Page): Locator {
  return page.getByRole("region", { name: "Live examples" });
}

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await gotoHome(page);
  });

  test("renders the hero with one h1, the tagline and the stack badges", async ({ page }) => {
    await expect(page.locator("h1")).toHaveCount(1);
    const hero = page.getByRole("region", { name: /Material Design components/ });
    await expect(hero.getByRole("heading", { level: 1 })).toHaveText("Material Design components you can own.");
    await expect(hero).toContainText("Materialize's Material Design, rebuilt for React 19, Tailwind CSS v4 and TypeScript.");
    const badges = hero.getByRole("list", { name: "Built with" }).getByRole("listitem");
    await expect(badges).toHaveText(["React 19", "Tailwind v4", "TypeScript", "Radix", "MIT"]);
    await expect(hero.locator("[data-slot=install-command]")).toContainText("npx materializedcss init");
  });

  test("copies the install command", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const install = page.locator("[data-slot=install-command]");
    await install.getByRole("button", { name: "Copy to clipboard" }).click();
    await expect(install.getByRole("button", { name: "Copied" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("npx materializedcss init");
  });

  test("Get started goes to the docs", async ({ page }) => {
    await page.getByRole("link", { name: "Get started" }).click();
    await expect(page).toHaveURL(/\/docs$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Introduction");
  });

  test("Browse components opens the first component page", async ({ page }) => {
    await page.getByRole("link", { name: "Browse components" }).click();
    await expect(page).toHaveURL(/\/docs\/components\/[a-z-]+$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("sign-in form validates and fires a toast on submit", async ({ page }) => {
    const form = page.getByRole("form", { name: "Sign in" });
    await form.getByRole("button", { name: "Sign in" }).click();
    // Native constraint validation blocks the empty form.
    await expect(page.getByText("Signed in as")).toHaveCount(0);
    await form.getByLabel("Email").fill("ada@example.com");
    await form.getByLabel("Password").fill("analytical");
    const remember = form.getByRole("checkbox", { name: "Keep me signed in" });
    await expect(remember).toBeChecked();
    await remember.click();
    await expect(remember).not.toBeChecked();
    await form.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator("[data-slot=toast]", { hasText: "Signed in as ada@example.com" })).toBeVisible();
  });

  test("inbox badges clear when marked read", async ({ page }) => {
    const inbox = examples(page).getByRole("list", { name: "Inbox" });
    await expect(inbox.locator("[data-slot=badge]")).toHaveCount(3);
    await expect(inbox.locator("[data-slot=badge]").first()).toHaveText("3new");
    const markRead = inbox.getByRole("button", { name: "Mark all read" });
    await markRead.click();
    await expect(inbox.locator("[data-slot=badge]")).toHaveCount(0);
    await expect(markRead).toBeDisabled();
  });

  test("tabs switch panels with the mouse and the keyboard", async ({ page }) => {
    const tabs = examples(page).getByRole("tablist", { name: "Tabs features" });
    await tabs.getByRole("tab", { name: "Keyboard" }).click();
    await expect(examples(page).getByRole("tabpanel")).toContainText("Arrow keys move between tabs");
    await page.keyboard.press("ArrowRight");
    await expect(tabs.getByRole("tab", { name: "RTL" })).toHaveAttribute("aria-selected", "true");
    await expect(examples(page).getByRole("tabpanel")).toContainText('dir="rtl"');
  });

  test("settings: switch, select and range respond", async ({ page }) => {
    const card = demoCard(page, "Settings");
    const digest = card.getByRole("switch", { name: "Weekly digest" });
    await expect(digest).toHaveAttribute("aria-checked", "false");
    await card.getByText("Weekly digest").click();
    await expect(digest).toHaveAttribute("aria-checked", "true");

    const select = card.getByRole("combobox", { name: /Sync frequency/ });
    await select.click();
    await page.getByRole("option", { name: "Once a day" }).click();
    await expect(select).toContainText("Once a day");

    const thumb = card.getByRole("slider", { name: "Alert volume" });
    await thumb.focus();
    await page.keyboard.press("ArrowRight");
    await expect(thumb).toHaveAttribute("aria-valuenow", "61");
    await expect(card).toContainText("61%");
  });

  test("chips input adds a tag and filter chips toggle", async ({ page }) => {
    const card = demoCard(page, "New post");
    const input = card.getByLabel("Tags", { exact: true });
    await input.click();
    await input.pressSequentially("Vite");
    await page.keyboard.press("Enter");
    await expect(card.locator("[data-slot=chips-input] [role=listitem]", { hasText: "Vite" })).toHaveCount(1);
    const advanced = card.getByRole("button", { name: "Advanced" });
    await advanced.click();
    await expect(advanced).toHaveAttribute("aria-pressed", "true");
    await expect(card.getByRole("button", { name: "Intermediate" })).toHaveAttribute("aria-pressed", "false");
  });

  test("card reveal opens and closes with Escape, returning focus", async ({ page }) => {
    const trigger = examples(page).getByRole("button", { name: /Alpine lodge/ });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(examples(page).getByRole("button", { name: "Close" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  test("snackbar buttons show toasts with actions", async ({ page }) => {
    const card = demoCard(page, "Snackbars");
    await card.getByRole("button", { name: "Archive" }).click();
    const toast = page.locator("[data-slot=toast]", { hasText: "Conversation archived" });
    await expect(toast).toBeVisible();
    await toast.getByRole("button", { name: "Undo" }).click();
    await expect(page.locator("[data-slot=toast]", { hasText: "Conversation restored" })).toBeVisible();
  });

  test("upload demo runs to completion", async ({ page }) => {
    const card = demoCard(page, "Uploads");
    await card.getByRole("button", { name: "Restart upload" }).click();
    const bar = card.getByRole("progressbar", { name: "Photo upload" });
    await expect(bar).toHaveAttribute("aria-valuenow", "12", { timeout: 10_000 });
    await expect(card).toContainText("Upload complete");
    await expect(card.getByRole("button", { name: "Upload again" })).toBeEnabled();
  });

  test("calendar selects a day", async ({ page }) => {
    const card = examples(page).locator("[data-slot=card]", { has: page.locator("[data-slot=calendar]") });
    await card.getByRole("gridcell", { name: / 15, \d{4}$/ }).click();
    await expect(card.locator("output")).not.toHaveText("none");
    await expect(card.locator("output")).toContainText("15");
  });

  test("lists the improvements over Materialize", async ({ page }) => {
    const section = page.getByRole("region", { name: "Improvements over Materialize" });
    await expect(section).toBeVisible();
    await expect(section.getByRole("heading", { level: 3 })).toHaveCount(9);
    await expect(section.getByRole("heading", { level: 4 })).toHaveCount(4);
    for (const text of ["iOS select", "clipped", "ResizeObserver", "autofill", "CVE-2019-11002", "Escape", "focus traps", "scroll"]) {
      await expect(section).toContainText(text);
    }
    await expect(section.getByRole("link", { name: "Select docs" })).toHaveAttribute("href", "/docs/components/select");
  });

  test("theme customizer recolors the page live", async ({ page }) => {
    const section = page.getByRole("region", { name: "Make it yours" });
    const before = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--primary").trim());
    await section.getByRole("radiogroup", { name: "Primary" }).getByRole("radio", { name: "indigo" }).click();
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()))
      .not.toBe(before);
    await section.getByRole("button", { name: "Reset to default" }).click();
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()))
      .toBe(before);
  });

  test("footer credits Materialize and links to the docs", async ({ page }) => {
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Materialize" })).toHaveAttribute("href", "https://materializecss.com");
    const nav = footer.getByRole("navigation", { name: "Footer" });
    await expect(nav.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs");
    await expect(nav.getByRole("link", { name: "CLI" })).toHaveAttribute("href", "/docs/cli");
    await expect(nav.getByRole("link", { name: /Components/ })).toHaveAttribute("href", /\/docs\/components\//);
  });

  test("has no serious accessibility violations in light mode", async ({ page }) => {
    await expectNoA11yViolations(page);
  });

  test("has no serious accessibility violations in dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expectNoA11yViolations(page);
  });
});

test.describe("Homepage on a 360px phone", () => {
  test.use({ viewport: { width: 360, height: 780 } });

  test("has no horizontal overflow", async ({ page }) => {
    await gotoHome(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
    const wide = await page.evaluate(() =>
      Array.from(document.querySelectorAll("main *, footer *"))
        .filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
        .filter((el) => !el.closest("[data-slot=card-reveal], [inert], [aria-hidden=true], pre, .overflow-auto, [role=tablist]"))
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`),
    );
    expect(wide).toEqual([]);
  });
});
