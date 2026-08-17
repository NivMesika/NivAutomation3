import { Page, TestInfo } from "@playwright/test";
import { Logger } from "../utils/logger";

export class General {
    public readonly page: Page;
    public readonly testInfo: TestInfo;
    public readonly logger: Logger;

    constructor(page: Page, testInfo: TestInfo) {
        this.page = page;
        this.testInfo = testInfo;
        this.logger = new Logger(this.constructor.name);
    }
}
