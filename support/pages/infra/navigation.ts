import { General } from "../general";
import { Page, test, TestInfo } from "@playwright/test";
import type { TPage } from "../../utils/types";
import { GUARDRAILS_PATH, PLAYGROUND_PATH } from "../../constants/app";

export class Navigation extends General {
    constructor(page: Page, testInfo: TestInfo) {
        super(page, testInfo);
    }

    async navigateTo(page: TPage): Promise<void> {
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

    private getPath(page: TPage): string {
        const paths: Record<TPage, string> = {
            Guardrails: GUARDRAILS_PATH,
            Playground: PLAYGROUND_PATH,
        };
        return paths[page];
    }
}
