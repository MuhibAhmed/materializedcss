import { expect, test } from "@playwright/test";
import { gotoComponent } from "./utils";

// Chrome paints autofilled fields with an !important light-blue background. theme.css keeps
// the field's own background instead. The Autofill CDP domain needs full Chromium, not the
// headless shell, so this spec opts into the "chromium" channel.
test.use({ channel: "chromium" });

test("autofilled fields keep the transparent Materialize background", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "Uses the Chrome DevTools Autofill domain");
  await gotoComponent(page, "text-field");

  await page.evaluate(() => {
    const cls = document.querySelector("main input")?.className ?? "";
    const form = document.createElement("form");
    form.id = "autofill-form";
    form.innerHTML = ["cc-name", "cc-number", "cc-exp"]
      .map((ac) => `<input id="${ac}" name="${ac}" autocomplete="${ac}" aria-label="${ac}" class="${cls}">`)
      .join("");
    document.querySelector("main")!.prepend(form);
  });

  const cdp = await context.newCDPSession(page);
  const { root } = await cdp.send("DOM.getDocument");
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: "#cc-number" });
  const { node } = await cdp.send("DOM.describeNode", { nodeId });
  await page.focus("#cc-number");
  await cdp.send("Autofill.trigger", {
    fieldId: node.backendNodeId,
    card: { number: "4444444444444444", name: "Test User", expiryMonth: "04", expiryYear: "2030", cvc: "123" },
  });

  const number = page.locator("#cc-number");
  await expect(number).toHaveValue("4444444444444444");
  expect(await number.evaluate((el) => el.matches(":autofill"))).toBe(true);

  const styles = await page.locator("#autofill-form input").evaluateAll((inputs) =>
    inputs.map((el) => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, fill: cs.webkitTextFillColor, fg: getComputedStyle(document.body).color };
    }),
  );
  for (const { bg, fill, fg } of styles) {
    // Fully transparent background (alpha 0), text in the theme foreground color.
    expect(bg).toMatch(/^(transparent|rgba\(.+,\s*0\))$/);
    expect(fill).toBe(fg);
  }
});
