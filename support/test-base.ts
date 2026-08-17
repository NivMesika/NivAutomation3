import { test as base } from "@playwright/test";
import { Pages } from "./pages";
import type { TestUser } from "./utils/types";
import * as utils from "./utils/utils";

export const test = base.extend<{ pages: Pages; testUser: TestUser }>({
    testUser: async ({}, use) => {
        const uniqueWord = `gdpr${utils.generateRandomLetters(5)}`;
        await use({
            uniqueWord,
            customerEmail: utils.generateUniqueEmail('qa.customer'),
            subject: 'Order status please',
            body: `Please process this under ${uniqueWord} immediately.`,
        });
    },
    pages: async ({ page }, use, testInfo) => {
        await use(new Pages(page, testInfo));
    },
});

export { expect } from "@playwright/test";
