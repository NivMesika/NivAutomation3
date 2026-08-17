import { General } from "./general";
import { Page, Locator, expect, test, TestInfo } from "@playwright/test";
import { AuditField, type AuditFieldLabel } from "../constants/app";

export class Guardrails extends General {
    private readonly automationAuditHeading: Locator;
    private readonly headerSaveButton: Locator;
    private readonly discardButton: Locator;
    private readonly deployButton: Locator;
    private readonly confirmChangesTitle: Locator;

    constructor(page: Page, testInfo: TestInfo) {
        super(page, testInfo);
        this.automationAuditHeading = page.getByText('Automation Audit', { exact: true });
        this.headerSaveButton = page.getByRole('button', { name: /^Save$/ }).first();
        this.discardButton = page.getByRole('button', { name: 'Discard' });
        this.deployButton = page.getByRole('button', { name: /Deploy/ });
        this.confirmChangesTitle = page.getByText('Confirm changes', { exact: true });
    }

    private fieldRow(label: AuditFieldLabel): Locator {
        return this.page
            .getByText(label, { exact: true })
            .locator('xpath=ancestor::*[.//textarea][1]');
    }

    private fieldInput(label: AuditFieldLabel): Locator {
        return this.fieldRow(label).locator('textarea').last();
    }

    private chip(word: string): Locator {
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return this.page.locator('div').filter({ hasText: new RegExp(`^${escaped}\\s*×$`) });
    }

    async addWord(label: AuditFieldLabel, word: string): Promise<void> {
        return test.step(`Add '${word}' to ${label}`, async () => {
            const input = this.fieldInput(label);
            await input.scrollIntoViewIfNeeded();
            await input.click();
            await input.fill(word);
            await input.press('Enter');
            await expect(this.chip(word)).toBeVisible();
            this.logger.info(`Added chip '${word}' on ${label}`);
        });
    }

    async removeWord(word: string): Promise<void> {
        return test.step(`Remove chip '${word}'`, async () => {
            await this.chip(word).getByRole('button', { name: '×' }).click();
            await expect(this.chip(word)).toHaveCount(0);
            this.logger.info(`Removed chip '${word}'`);
        });
    }

    async removeWordIfPresent(word: string): Promise<void> {
        if (await this.hasWord(word)) {
            await this.removeWord(word);
        }
    }

    async hasWord(word: string): Promise<boolean> {
        return (await this.chip(word).count()) > 0;
    }

    async save(): Promise<void> {
        return test.step('Save Guardrails draft', async () => {
            await this.headerSaveButton.click();
            await this.confirmChangesTitle.waitFor();
            const confirmModal = this.page
                .locator('div')
                .filter({ hasText: 'Are you sure you want to confirm these changes?' })
                .filter({ has: this.page.getByRole('button', { name: 'Cancel' }) })
                .last();
            const saveResponse = this.page.waitForResponse(
                (response) =>
                    response.url().includes('/dashboard/settings/customization') &&
                    response.request().method() === 'PUT' &&
                    response.ok(),
            );
            await confirmModal.getByRole('button', { name: /^Save$/ }).click();
            await saveResponse;
            await this.confirmChangesTitle.waitFor({ state: 'hidden' });
            await expect(this.deployButton).toBeVisible();
            this.logger.info('Guardrails draft saved');
        });
    }

    async discardIfDirty(): Promise<void> {
        if (await this.discardButton.isVisible().catch(() => false)) {
            await test.step('Discard unsaved Guardrails changes', async () => {
                await this.discardButton.click();
                this.logger.info('Discarded unsaved Guardrails changes');
            });
        }
    }

    validation = {
        validateAutomationAuditVisible: async () => {
            return test.step('Validate Automation Audit is displayed', async () => {
                await expect(this.automationAuditHeading).toBeVisible();
                await expect(this.page.getByText(AuditField.wordsInUserMessage, { exact: true })).toBeVisible();
                this.logger.success('Automation Audit is displayed');
            });
        },
        validateWordPresent: async (word: string) => {
            return test.step(`Validate chip '${word}' is present`, async () => {
                await expect(this.chip(word)).toBeVisible();
                this.logger.success(`Chip '${word}' is present`);
            });
        },
        validateWordAbsent: async (word: string) => {
            return test.step(`Validate chip '${word}' is absent`, async () => {
                await expect(this.chip(word)).toHaveCount(0);
                this.logger.success(`Chip '${word}' is absent`);
            });
        },
    };
}
