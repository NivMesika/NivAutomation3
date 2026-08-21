/* 
Types.ts contains the TypeScript types for the project - defines the allowed page names and the TestUser fixture shape so navigation and test data are typed end to end.
*/

export type TPage = 'Guardrails' | 'Playground';

export type TestUser = {
    uniqueWord: string;
    customerEmail: string;
    subject: string;
    body: string;
};
