/* 
General is the base page object — it owns the Playwright page, testInfo, and a named logger; all feature pages extend it.
*/

import { Page, TestInfo } from "@playwright/test";
import { Logger } from "../utils/logger";

export class General { // Base class for all pages
    public readonly page: Page;
    public readonly testInfo: TestInfo;
    public readonly logger: Logger;

    constructor(page: Page, testInfo: TestInfo) { // Initializes the page, testInfo, and logger
        this.page = page;
        this.testInfo = testInfo;
        this.logger = new Logger(this.constructor.name); // The name of the class is used as the logger name
    }
}
