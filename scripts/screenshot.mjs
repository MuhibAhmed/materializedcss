// Usage: node scripts/screenshot.mjs <url-or-path> <out.png> [light|dark] [width] [height] [full=0|1] [selector]
// Takes a screenshot of a docs page (optionally of one element) for visual review.
import { chromium } from "@playwright/test";

const [target, out, theme = "light", width = "1280", height = "900", full = "0", selector] = process.argv.slice(2);
if (!target || !out) {
  console.error("usage: node scripts/screenshot.mjs <url-or-path> <out.png> [light|dark] [width] [height] [full] [selector]");
  process.exit(1);
}
const url = target.startsWith("http") ? target : `http://localhost:3000${target}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) }, colorScheme: theme });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
if (selector) await page.locator(selector).first().screenshot({ path: out });
else await page.screenshot({ path: out, fullPage: full === "1" });
await browser.close();
console.log(`saved ${out}`);
