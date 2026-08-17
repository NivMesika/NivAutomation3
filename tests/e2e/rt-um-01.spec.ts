import { test } from "../../support/test-base";
import { Priority } from "../../support/test-tags";
import { AuditField } from "../../support/constants/app";

test.describe('Automation Audit — RT-UM-01', () => {
    test.setTimeout(180_000);
    test('Should block a Playground email when Words in User Message matches the body',
        { tag: Priority.High },
        async ({ pages, testUser }) => {
            await pages.navigation.navigateTo('Guardrails');
            await pages.guardrails.validation.validateAutomationAuditVisible();
            await pages.guardrails.addWord(AuditField.wordsInUserMessage, testUser.uniqueWord);
            await pages.guardrails.save();
            await pages.guardrails.validation.validateWordPresent(testUser.uniqueWord);

            await pages.navigation.navigateTo('Playground');
            await pages.playground.validation.validateComposerVisible();
            await pages.playground.fillInbound({
                email: testUser.customerEmail,
                subject: testUser.subject,
                body: testUser.body,
            });
            await pages.playground.sendAsCustomer();
            await pages.playground.validation.validateBlockedByUserMessage(testUser.uniqueWord);
        });

    test.afterEach(async ({ pages, testUser }) => {
        await pages.navigation.navigateTo('Guardrails');
        if (await pages.guardrails.hasWord(testUser.uniqueWord)) {
            await pages.guardrails.removeWord(testUser.uniqueWord);
            await pages.guardrails.save();
        } else {
            await pages.guardrails.discardIfDirty();
        }
    });
});
