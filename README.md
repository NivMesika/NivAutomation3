# NivAutomation3

Playwright + TypeScript E2E for Guardio **Automation Audit** (Guardrails → Playground).

The catalog of cases is in [TEST_SUITE.md](TEST_SUITE.md). Only **RT-UM-01** is automated.

## Setup

```bash
npm ci
cp .env.example .env
npm run auth    # headed Chrome: sign in with Google, then the session is saved locally
```

Google blocks Playwright's bundled Chromium. `npm run auth` uses real Chrome. The session file `playwright/.auth/user.json` is gitignored — do not commit it.

## Running

```bash
npm run headed      # visible Chrome; HTML report opens when the run finishes
npm run headless    # Chrome, no window; HTML report opens when the run finishes
npm run report      # reopen the last HTML report
npm run typecheck
```

The HTML report is the reviewer view: pass/fail, `test.step` timeline, screenshot, and (on failure) a Playwright trace. Terminal output is the list reporter. `npm run report` serves `playwright-report/` if the window was closed.

## Project structure

```
tests/e2e/rt-um-01.spec.ts                     RT-UM-01
support/test-base.ts                           fixtures: pages, testUser
support/pages/index.ts                         Pages aggregator
support/pages/general.ts                       base page object
support/pages/infra/navigation.ts              Guardrails / Playground URLs
support/pages/guardrails.ts                    Automation Audit chips + Save
support/pages/playground.ts                    Email composer / Send as customer
support/constants/                             URLs, field labels
support/utils/                                 types, generators, logger
```
