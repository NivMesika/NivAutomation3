import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const AUTH_FILE = path.resolve("playwright/.auth/user.json");
const HOME = "https://guardio.app.getnotch.dev/";

function isSignedInUrl(url) {
  const u = typeof url === "string" ? new URL(url) : url;
  if (!u.hostname.includes("guardio.app.getnotch.dev")) return false;
  if (u.pathname.includes("/login")) return false;
  return true;
}

fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

const browser = await chromium.launch({
  channel: "chrome",
  headless: false,
  ignoreDefaultArgs: ["--enable-automation"],
  args: ["--disable-blink-features=AutomationControlled", "--start-maximized"],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.addInitScript(() => {
  Object.defineProperty(navigator, "webdriver", { get: () => undefined });
});
const page = await context.newPage();

console.log("Sign in with Google in the opened Chrome window. Waiting up to 5 minutes...");
await page.goto(HOME, { waitUntil: "domcontentloaded", timeout: 60_000 });

if (!isSignedInUrl(page.url())) {
  await page.waitForURL(isSignedInUrl, { timeout: 5 * 60 * 1000 });
}

await context.storageState({ path: AUTH_FILE });
console.log(`Saved session to ${AUTH_FILE}`);
await browser.close();
