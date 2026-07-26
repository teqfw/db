# Testing Overview

- Path: `ctx/docs/code/testing.md`
- Changed: `20260726`

## Test Structure

- `test/integration/` — DI graph resolution and database-backed integration.
- `test/mod/` — legacy module behavior retained during migration.
- `test/accept/` — end-to-end persistence scenarios.
- `test/man/` — manual development scenarios not required by the default suite.
- `test/data/` — declarations, maps, and database fixtures.

## Required Verification

- Every source file parses with `node --check`.
- No constructor contains a legacy dependency-token property.
- Every constructor that consumes injected values has a matching export-scoped `__deps__` declaration.
- A DI integration test resolves representative default and named-factory tokens using `@teqfw/di` 2.x.
- Automated tests cover DEM composition, schema ordering/conversion, selection, transaction ownership, CRUD, and connection shutdown to the extent supported without external infrastructure.

## Database Strategy

Default automated database tests use SQLite so they are deterministic and do not require an external server.
PostgreSQL and MySQL/MariaDB-specific paths require opt-in integration environments.

## Acceptance Rule

The migration is not complete if only source syntax changes.
The test suite must exercise resolution through the DI 2.x container and at least one real Knex database path.

## Known Migration Debt

The functional suite and DI graph pass, but the strict base ESM validator is not yet clean.
The remaining findings concern legacy prototype-based interface/behavior modules and incomplete modern JSDoc contracts; they are not DI resolution or static-import failures.
Resolve this debt, or explicitly accept it for the first 2.x release, before publishing.
