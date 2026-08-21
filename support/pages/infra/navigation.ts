/* 
Navigation.ts handles the navigation to the different pages of the app so the tests stay DRY and typed.
*/

import { General } from "../general";
import { Page, test, TestInfo } from "@playwright/test";
import type { TPage } from "../../utils/types";
import { GUARDRAILS_PATH, PLAYGROUND_PATH } from "../../constants/app";

export class Navigation extends General { // extends General, so it gets this.page, this.testInfo, and this.logger for free.
    constructor(page: Page, testInfo: TestInfo) {
        super(page, testInfo);
    }

    async navigateTo(page: TPage): Promise<void> { // Navigates to the given page and waits for the page to load
        return test.step(`Navigate to '${page}'`, async () => {
            const path = this.getPath(page);
            this.logger.debug(`Navigating to '${page}' by path: ${path}`);
            await this.page.goto(path);
            await this.page.waitForLoadState('domcontentloaded');

            if (page === 'Guardrails') {
                await this.page.getByText('Automation Audit', { exact: true }).waitFor();
            }
            if (page === 'Playground') {
                await this.page.getByPlaceholder(/mark@meta.com/).waitFor();
            }

            this.logger.info(`Navigated to page: ${page} (${this.page.url()})`);
        });
    }

    private getPath(page: TPage): string { // Maps the page to the corresponding path
        const paths: Record<TPage, string> = {
            Guardrails: GUARDRAILS_PATH,
            Playground: PLAYGROUND_PATH,
        };
        return paths[page];
    }
}
