import { General } from "./general";
import { Page, Locator, expect, test, TestInfo } from "@playwright/test";
import { POLICY_VERSION } from "../constants/app";
import { Messages } from "../constants/messages";

export class Playground extends General {
    private readonly customerEmailInput: Locator;
    private readonly sendAsCustomerButton: Locator;
    private readonly messageEditor: Locator;
    private readonly policyVersionInput: Locator;
    private readonly subjectInput: Locator;
    private readonly reasonsHeading: Locator;
    private readonly messageNotSentLabel: Locator;
    private readonly automationAuditCause: Locator;
    private readonly blockedIcon: Locator;
    private readonly policyFailed: Locator;
    private readonly aiAgentLabel: Locator;

    constructor(page: Page, testInfo: TestInfo) {
        super(page, testInfo);
        this.customerEmailInput = page.getByPlaceholder(/mark@meta.com/);
        this.sendAsCustomerButton = page.getByRole('button', { name: /Send as customer/i });
        this.messageEditor = page.locator('.ql-editor').first();
        this.policyVersionInput = page.getByPlaceholder('Search Policy Version');
        this.subjectInput = page
            .getByText('Subject', { exact: true })
            .locator('xpath=following::input[1]');
        this.reasonsHeading = page.getByText(Messages.reasonsMessageWasntSent, { exact: true });
        this.messageNotSentLabel = page.getByText(Messages.messageNotSent, { exact: true });
        this.automationAuditCause = page.getByText(Messages.automationAuditCause, { exact: true });
        this.blockedIcon = this.reasonsHeading
            .locator('xpath=ancestor::*[.//svg[@fill="#E7000B"]][1]')
            .locator('svg[fill="#E7000B"]')
            .first();
        this.policyFailed = page.getByRole('heading', { name: 'Policy Failed', exact: true });
        this.aiAgentLabel = page.getByText('AI-agent', { exact: true });
    }

    async setChannelEmail(): Promise<void> {
        return test.step('Set channel to Email', async () => {
            const chatSelect = this.page.locator('input.MuiSelect-nativeInput[value="WebUIChat"]');
            if (await chatSelect.count()) {
                await chatSelect.locator('xpath=ancestor::div[contains(@class,"MuiInputBase")][1]').click();
                await this.page.getByRole('listbox').getByRole('option', { name: /^Email$/ }).click();
            }
            await expect(this.page.locator('input.MuiSelect-nativeInput[value="WebUIEmail"]')).toBeAttached();
            this.logger.info('Channel set to Email');
        });
    }

    async setPolicyVersion(): Promise<void> {
        return test.step(`Set policy version to ${POLICY_VERSION}`, async () => {
            await this.policyVersionInput.click();
            await this.policyVersionInput.fill(POLICY_VERSION);
            await this.page.getByRole('option').filter({ hasText: POLICY_VERSION }).first().click();
            await expect(this.policyVersionInput).toHaveValue(POLICY_VERSION);
            this.logger.info(`Policy version set to ${POLICY_VERSION}`);
        });
    }

    async fillInbound(options: { email: string; subject: string; body: string }): Promise<void> {
        return test.step('Fill Playground inbound email', async () => {
            await this.customerEmailInput.fill(options.email);
            await this.setChannelEmail();
            await this.setPolicyVersion();
            await expect(this.page.getByText('Subject', { exact: true })).toBeVisible();
            await this.subjectInput.fill(options.subject);
            await this.messageEditor.click();
            await this.messageEditor.fill(options.body);
            this.logger.info('Filled customer email, subject and body');
        });
    }

    async sendAsCustomer(): Promise<void> {
        return test.step('Send as customer', async () => {
            await expect(this.sendAsCustomerButton).toBeEnabled();
            await this.sendAsCustomerButton.click();
            await this.page.waitForURL(/\/conversations\/inbox\/(?!playground)/);
            this.logger.info(`Sent Playground message (${this.page.url()})`);
        });
    }

    validation = {
        validateComposerVisible: async () => {
            return test.step('Validate the Playground composer is displayed', async () => {
                await expect(this.customerEmailInput).toBeVisible();
                await expect(this.sendAsCustomerButton).toBeVisible();
                this.logger.success('Playground composer is displayed');
            });
        },
        validateBlockedByUserMessage: async (word: string) => {
            return test.step(`Validate the Playground message was blocked (${word})`, async () => {
                await expect(this.reasonsHeading.or(this.policyFailed).or(this.aiAgentLabel)).toBeVisible({
                    timeout: 60_000,
                });

                if (await this.reasonsHeading.isVisible()) {
                    await expect(this.blockedIcon).toBeVisible();
                    await expect(this.messageNotSentLabel).toBeVisible();
                    await expect(this.automationAuditCause).toBeVisible();
                    this.logger.success(`Blocked by Automation Audit (word '${word}')`);
                    return;
                }

                const message = await this.policyFailed.isVisible()
                    ? `Words in User Message '${word}' was configured, but the message was not blocked (Policy Failed, no X).`
                    : `Words in User Message '${word}' was configured, but the message was not blocked (AI-agent replied, no X).`;
                this.logger.error(message);
                throw new Error(message);
            });
        },
    };
}
