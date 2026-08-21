import { chromium } from "playwright";
import fs from "fs";
import path from "path";

/* 
auth.mjs opens headed Chrome, waits for me to leave the login page, then calls context.storageState({ path }) -  
which dumps cookies and localStorage into user.json. The suite loads that file as storageState so tests skip OAuth
*/

const AUTH_FILE = path.resolve("playwright/.auth/user.json"); //the absolute path to the session file
const HOME = "https://guardio.app.getnotch.dev/"; // where login starts

function isSignedInUrl(url) { // check if the url is the sign in page
  const u = typeof url === "string" ? new URL(url) : url;
  if (!u.hostname.includes("guardio.app.getnotch.dev")) return false;
  if (u.pathname.includes("/login")) return false;
  return true;
}

fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true }); // Creates playwright/.auth/ if it doesn’t exist, so the write later won’t fail

const browser = await chromium.launch({ // Launch a real Chrome sessio - not playwright chromium
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

console.log("Sign in with Google in the opened Chrome window. Waiting up to 5 minutes..."); // Wait for your manual login
await page.goto(HOME, { waitUntil: "domcontentloaded", timeout: 60_000 });

if (!isSignedInUrl(page.url())) {
  await page.waitForURL(isSignedInUrl, { timeout: 5 * 60 * 1000 });
}

await context.storageState({ path: AUTH_FILE }); // a Playwright API that saves the session to the file
console.log(`Saved session to ${AUTH_FILE}`);
await browser.close();
