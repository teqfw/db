# Testing Overview

- Path: `ctx/docs/code/testing.md`
- Changed: `20260903`

Product-level rebuild obligations are defined in [product migration](../product/migration.md); these checks verify their current implementation and runtime evidence.

## Test Structure

- `test/unit/` — isolated component tests with source-relative paths required by `teqfw-platform`; modules without an isolated unit boundary are explicitly excluded in `package.json`.
- `test/integration/` — DI-composed behavior, cross-component compiler and dialect scenarios, and SQLite/Knex execution.
- `test/acceptance/` — complete v2 persistence workflows: compile, create a target, transfer data, and inspect rebuild evidence.
- `test/optin/` — destructive PostgreSQL/pgvector and MariaDB/MySQL conformance against explicitly provisioned disposable databases.
- `test/package/` — packed npm artifact and published declaration-contract tests; its `types/` consumer is checked by `npm run typecheck`.
- `test/manual/` — opt-in development scenarios excluded from the automated gate.
- `test/data/` — tracked fixtures owned by the corresponding test layer.

Tests use `node:test`. `npm test` runs unit, integration, acceptance, and package layers.
`npm run typecheck`, `npm run test:optin`, and `npm run test:manual` are explicit checks.

## Required Verification

- `teqfw-platform .` validates the bidirectional `src/**/*.mjs` ↔ `test/unit/**/*.test.mjs` mapping. Every source module without an isolated unit-test boundary has an exact, reasoned entry in `teqfw.platform.unitTests.exclusions`; grouped behavior tests belong under `test/integration/`.
- Every source file parses with `node --check`.
- `npm run typecheck` checks the published declaration contract and its representative consumer.
- Package tests install the packed layout, type-check named and ambient consumer contracts, and prove that the export map exposes neither a runtime root nor `src/**` subpaths.
- Every constructor that consumes injected values has an export-scoped `__deps__` declaration, and DI integration resolves representative default and named-factory tokens through `@teqfw/di` 2.x.
- SQLite integration covers configuration, connection lifecycle, compiled schema execution, typed Selection v2, transaction ownership, and rebuild evidence.
- SQLite integration covers immutable effective-DEM snapshot deduplication, application state transitions, last-applied resolution, and catalog-mismatch diagnostics.
- The opt-in suite loads named PostgreSQL and MariaDB connections from an ignored project-root `.env`; tracked fixtures never contain credentials.

## DEM v2 Compiler Verification

Every declaration and map fixture has `version: 2`. Unit and integration tests reject omitted or unsupported versions before compilation.
Compiler tests cover deterministic composition and diagnostics, ownership conflicts, deep immutability and result branding, logical types and defaults, identity/reference resolution, mapping provenance, physical-name collisions, graph cycles, index phases, and capability validation. They also prove that every entity in the physical target plan has ordinary fragment provenance, including `snapshot` and `application` from `teqfw.db.schema`, with no compiler-side entity injection.
Fixture assertions use diagnostic codes, canonical paths, and structured details rather than complete English messages.

## Database And Rebuild Verification

SQLite is the deterministic default database. PostgreSQL and MariaDB/MySQL-specific behavior belongs to the opt-in conformance gate.
Schema and rebuild tests prove preflight before mutation, dependency ordering, cycle rejection or an explicit dialect strategy, source/target transaction ownership, preservation before destructive recreation, explicit transformations, late-index outcomes, and structured evidence. Rebuild never implies acceptance, cutover, source deletion, or incremental migration planning.

## ESM Conformity

`teqfw-esm-validator src --profile base` is a release gate. Interface publication units declare `@interface` at module level. Concrete behavior is defined through constructor closures rather than prototype methods. Callable JSDoc contracts mirror actual parameters, DI dependency names, and asynchronous return values.
