/* 
test-base extends Playwright with fixtures: 
testUser generates isolated run data, pages wires the POM aggregator — so the spec stays focused on steps, not setup.
*/

import { test as base } from "@playwright/test";
import { Pages } from "./pages";
import type { TestUser } from "./utils/types";
import * as utils from "./utils/utils";

export const test = base.extend<{ pages: Pages; testUser: TestUser }>({ // Extends Playwright with fixtures
    testUser: async ({}, use) => { // Generates isolated run data for each test 
        const uniqueWord = `gdpr${utils.generateRandomLetters(5)}`;
        await use({ // Creates a unique word for the test
            uniqueWord,
            customerEmail: utils.generateUniqueEmail('qa.customer'),
            subject: 'Order status please',
            body: `Please process this under ${uniqueWord} immediately.`,
        });
    },
    pages: async ({ page }, use, testInfo) => { // Builds the Pages aggregator for this test’s Playwright page. Same pattern: create → use → tear down
        await use(new Pages(page, testInfo));
    },
});

export { expect } from "@playwright/test";
