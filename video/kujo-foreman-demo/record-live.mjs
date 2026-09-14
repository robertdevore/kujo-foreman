import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "../../../lens/bridge/node_modules/playwright-core/index.mjs";

const project = resolve(import.meta.dirname);
const output = resolve(project, "capture-delivery-4");
await mkdir(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  colorScheme: "dark",
  recordVideo: { dir: output, size: { width: 1920, height: 1080 } },
});
const page = await context.newPage();
const video = page.video();

await page.goto("http://127.0.0.1:4173/new", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(5000);

await page.getByRole("button", { name: /run golden demo/i }).click();
await page.waitForURL(/\/runs\//, { timeout: 120000 });
await page.waitForTimeout(5000);
await page.reload({ waitUntil: "domcontentloaded" });
await page.locator("#human-decision-title").waitFor({ state: "attached", timeout: 120000 });
await page.waitForTimeout(5000);
await page.locator("#human-decision-title").scrollIntoViewIfNeeded();
await page.waitForTimeout(9000);

await page.getByLabel("Authorize this change").check();
await page.waitForTimeout(2500);
await page.getByRole("button", { name: /record decision & continue/i }).click();
await page.locator("#verdict-title").filter({ hasText: /ready to ship/i }).waitFor({ state: "attached", timeout: 120000 });
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(9000);

await page.getByRole("link", { name: /view evidence/i }).click();
await page.getByRole("heading", { name: /evidence timeline/i }).waitFor({ state: "attached", timeout: 120000 });
await page.waitForTimeout(7000);
await page.evaluate(() => window.scrollTo({ top: 850, behavior: "smooth" }));
await page.waitForTimeout(9000);
await page.evaluate(() => window.scrollTo({ top: 1650, behavior: "smooth" }));
await page.waitForTimeout(7000);

await context.close();
await browser.close();
const recordedPath = await video.path();
process.stdout.write(`${recordedPath}\n`);
