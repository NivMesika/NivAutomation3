export const POLICY_VERSION = process.env.POLICY_VERSION ?? 'e2e-draft-msvp6l995n2q';

export const AUTH_FILE = 'playwright/.auth/user.json';

export const GUARDRAILS_PATH =
    `/config/guardrails?version=${POLICY_VERSION}#automation-audit`;

export const PLAYGROUND_PATH =
    `/conversations/inbox/playground/bJTZxXckWbPLoD8Dmd7sG?updatedAt=last48h&category=Playground&version=${POLICY_VERSION}`;

export const AuditField = {
    emailPatterns: 'Emails patterns to unassign',
    subjects: 'Subjects',
    wordsInUserMessage: 'Words in User Message',
    wordsInAssistantReply: "Words in Assistant's Reply",
    tags: 'Tags',
} as const;

export type AuditFieldLabel = (typeof AuditField)[keyof typeof AuditField];
