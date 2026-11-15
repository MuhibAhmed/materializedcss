import { expect, type Locator, type Page, test } from "@playwright/test";

import { expectNoA11yViolations, gotoComponent, preview } from "./utils";

const file = (name: string, mimeType = "text/plain"): { name: string; mimeType: string; buffer: Buffer } => ({
  name,
  mimeType,
  buffer: Buffer.from(`contents of ${name}`),
});

/** Drops files onto a FileInput root using a synthetic DataTransfer. */
async function dropFiles(page: Page, target: Locator, files: Array<{ name: string; type: string }>): Promise<void> {
  const transfer = await page.evaluateHandle((list) => {
    const dt = new DataTransfer();
    for (const item of list) dt.items.add(new File([`contents of ${item.name}`], item.name, { type: item.type }));
    return dt;
  }, files);
  await target.dispatchEvent("dragenter", { dataTransfer: transfer });
  await target.dispatchEvent("dragover", { dataTransfer: transfer });
  await target.dispatchEvent("drop", { dataTransfer: transfer });
}

test.describe("FileInput", () => {
  test.beforeEach(async ({ page }) => {
    await gotoComponent(page, "file-input");
  });

  test("the native input is named by the button and label and lists the picked file", async ({ page }) => {
    const scope = preview(page, "file-input-demo");
    const native = scope.locator('[data-slot="file-input-native"]');
    await expect(native).toHaveAccessibleName("File Attachment");
    await native.setInputFiles(file("report.txt"));
    await expect(scope.locator('[data-slot="file-input-path"]')).toHaveValue("report.txt");
  });

  test("keyboard: the hidden input is focusable, mirrors focus on the button and opens the picker", async ({ page }) => {
    const scope = preview(page, "file-input-demo");
    const native = scope.locator('[data-slot="file-input-native"]');
    await native.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(native).toBeFocused();
    const button = scope.locator('[data-slot="file-input-button"]');
    expect(await button.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
    const chooser = page.waitForEvent("filechooser");
    await page.keyboard.press("Space");
    await (await chooser).setFiles(file("notes.txt"));
    await expect(scope.locator('[data-slot="file-input-path"]')).toHaveValue("notes.txt");
  });

  test("clicking the button or the path field opens the picker", async ({ page }) => {
    const scope = preview(page, "file-input-demo");
    let chooser = page.waitForEvent("filechooser");
    await scope.locator('[data-slot="file-input-button"]').click();
    await (await chooser).setFiles(file("a.txt"));
    await expect(scope.locator('[data-slot="file-input-path"]')).toHaveValue("a.txt");
    chooser = page.waitForEvent("filechooser");
    await scope.locator('[data-slot="file-input-path"]').click();
    await (await chooser).setFiles(file("b.txt"));
    await expect(scope.locator('[data-slot="file-input-path"]')).toHaveValue("b.txt");
  });

  test("multiple files, clear button and onFilesChange", async ({ page }) => {
    const scope = preview(page, "file-input-multiple");
    const native = scope.locator('[data-slot="file-input-native"]');
    await native.setInputFiles([file("one.txt"), file("two.txt"), file("three.txt")]);
    await expect(scope.locator('[data-slot="file-input-path"]')).toHaveValue("one.txt, two.txt, three.txt");
    await expect(scope.getByText("3 files selected")).toBeVisible();
    await scope.getByRole("button", { name: "Clear selected files" }).click();
    await expect(scope.locator('[data-slot="file-input-path"]')).toHaveValue("");
    await expect(scope.getByText("Or drop files here")).toBeVisible();
    await expect(native).toBeFocused();
  });

  test("drag and drop adds files and respects accept", async ({ page }) => {
    const multiple = preview(page, "file-input-multiple");
    await dropFiles(page, multiple.locator('[data-slot="file-input"]'), [
      { name: "x.txt", type: "text/plain" },
      { name: "y.png", type: "image/png" },
    ]);
    await expect(multiple.locator('[data-slot="file-input-path"]')).toHaveValue("x.txt, y.png");
    await expect(multiple.locator('[data-slot="file-input"]')).not.toHaveAttribute("data-drag-over", "true");

    const accept = preview(page, "file-input-accept");
    const photo = accept.locator('[data-slot="file-input"]').first();
    await dropFiles(page, photo, [{ name: "doc.txt", type: "text/plain" }]);
    await expect(photo.locator('[data-slot="file-input-path"]')).toHaveValue("");
    await dropFiles(page, photo, [{ name: "me.png", type: "image/png" }]);
    await expect(photo.locator('[data-slot="file-input-path"]')).toHaveValue("me.png");
  });

  test("error and disabled states", async ({ page }) => {
    const scope = preview(page, "file-input-accept");
    const contract = scope.getByLabel("Contract", { exact: false }).and(scope.locator('[data-slot="file-input-native"]'));
    await expect(contract).toHaveAttribute("aria-invalid", "true");
    await expect(contract).toHaveAccessibleDescription("A signed PDF is required");
    const disabled = scope.locator('[data-slot="file-input-native"][disabled]');
    await expect(disabled).toHaveCount(1);
    await expect(scope.locator('[data-slot="file-input-button"][data-disabled]')).toHaveCSS("pointer-events", "none");
  });

  test("submits files with a form, enforces required and resets", async ({ page }) => {
    const scope = preview(page, "file-input-form");
    const output = scope.getByRole("status", { name: "Submitted values" }).or(scope.locator("output"));
    await scope.getByRole("button", { name: "Upload" }).click();
    await expect(output).toHaveText("");
    const native = scope.locator('[data-slot="file-input-native"]');
    expect(await native.evaluate((el) => (el as HTMLInputElement).validity.valueMissing)).toBe(true);
    await native.setInputFiles([file("a.pdf", "application/pdf"), file("b.pdf", "application/pdf")]);
    await scope.getByRole("button", { name: "Upload" }).click();
    await expect(output).toHaveText(JSON.stringify({ documents: ["a.pdf", "b.pdf"] }));
    await scope.getByRole("button", { name: "Reset" }).click();
    await expect(scope.locator('[data-slot="file-input-path"]')).toHaveValue("");
  });

  test("has no serious accessibility violations", async ({ page }) => {
    await expectNoA11yViolations(page, "[data-doc-content]");
  });
});
