# Tests

Tests use the native Node.js test runner and import suites, cases, and hooks from `node:test`.

- `unit/` — isolated component tests following the source-relative `teqfw-platform` mapping; explicit exclusions are declared in the package manifest.
- `integration/` — DI-composed and cross-component behavior tests, including SQLite/Knex execution.
- `acceptance/` — end-to-end v2 persistence workflows from compiled DEM through schema/rebuild evidence.
- `optin/` — destructive conformance against disposable PostgreSQL/pgvector and MariaDB/MySQL databases.
- `package/` — packed-artifact and published type-contract checks; `package/types/` is the representative TypeScript consumer.
- `manual/` — opt-in development scenarios, excluded from the default suite.
- `data/` — tracked fixtures and test helpers for the corresponding test layers.

`npm test` runs unit, integration, acceptance, and package tests. Use `npm run test:unit`,
`npm run test:integration`, `npm run test:acceptance`, or `npm run test:package` for an individual
automated layer. `npm run typecheck`, `npm run test:optin`, and `npm run test:manual` are explicit
checks. The opt-in suite requires the provisioned disposable database environment described in the
project context.
