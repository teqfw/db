# Tests

Tests use the native Node.js test runner and import suites, cases, and hooks from `node:test`.

- `data/` — fixtures for test scenarios.
- `integration/` — DI and database integration tests.
- `accept/` — acceptance tests.
- `man/` — manual development tests.
- `mod/` — module tests.

Run the default automated suite with `npm test`.
Run an individual layer with `npm run test:module`, `npm run test:integration`, or `npm run test:acceptance`.
Manual scenarios are available through `npm run test:manual`.
