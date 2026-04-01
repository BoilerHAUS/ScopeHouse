# Tests

Organize tests around business-critical logic first.

Current priority areas:

- budget calculations
- schedule logic
- scope behavior
- AI parsing and fallbacks
- export flows

## Local Commands

The test runner auto-loads `.env` and `.env.local` before executing the suite.

Before running DB-backed tests locally:

1. `npm run db:start`
2. `npm run db:migrate -- --name local_test_sync`

Run the full suite:

- `npm test`

Run the integration coverage added for authenticated project workflows:

- `npm run test:integration`

Current coverage includes:

- authenticated project workflow integration checks
- protected route guard coverage
- targeted server-side tests for scope, budget, schedule, documents, and change orders
