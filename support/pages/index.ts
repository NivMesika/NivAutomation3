/* 
Pages.ts is the entry point for the pages object. allows you to instantiate all the pages at once by saying 'pages' in the test.
*/

import { Page, TestInfo } from "@playwright/test";
import { Navigation } from "./infra/navigation";
import { Guardrails } from "./guardrails";
import { Playground } from "./playground";

export class Pages {
    public readonly navigation: Navigation;
    public readonly guardrails: Guardrails;
    public readonly playground: Playground;

    constructor(page: Page, testInfo: TestInfo) {
        this.navigation = new Navigation(page, testInfo);
        this.guardrails = new Guardrails(page, testInfo);
        this.playground = new Playground(page, testInfo);
    }
}
