# Testing Overview

- Path: `ctx/docs/code/testing.md`
- Changed: `20260808`

## Test Structure

- `test/integration/` — DI graph resolution and database-backed integration.
- `test/mod/` — legacy module behavior retained during migration.
- `test/accept/` — end-to-end persistence scenarios.
- `test/man/` — manual development scenarios not required by the default suite.
- `test/data/` — declarations, maps, and database fixtures.

## Native Test Platform

Tests import suites, cases, and lifecycle hooks from the stable `node:test` API.
The npm scripts invoke the Node.js test runner directly with the files in each layer, without a third-party test framework.
`npm test` runs module, integration, and acceptance layers; `npm run test:manual` remains opt-in.

## Required Verification

- Every source file parses with `node --check`.
- No constructor contains a legacy dependency-token property.
- Every constructor that consumes injected values has a matching export-scoped `__deps__` declaration.
- A DI integration test resolves representative default and named-factory tokens using `@teqfw/di` 2.x.
- Automated tests cover DEM composition, schema ordering/conversion, selection, transaction ownership, CRUD, and connection shutdown to the extent supported without external infrastructure.

These checks describe the current 2.x implementation and do not by themselves satisfy the accepted rebuild contract.

## Database Strategy

Default automated database tests use SQLite so they are deterministic and do not require an external server.
PostgreSQL and MySQL/MariaDB-specific paths require opt-in integration environments.

## Acceptance Rule

The DI 2.x migration is not complete if only source syntax changes.
The test suite must exercise resolution through the DI 2.x container and at least one real Knex database path.

## Rebuild Verification Requirements

A unified rebuild implementation is incomplete until automated tests demonstrate:

- in-place rebuild refuses destructive replacement when preservation is required but no verified snapshot exists;
- explicitly authorized empty recreation remains possible;
- a parallel target can be created without modifying its source;
- rows are transferred in dependency order and engine-specific sequence state is restored where supported;
- explicit transformations are invoked and identified in the result;
- incompatible or failed required rows prevent a successful rebuild result;
- evidence reports target identity, processed tables, row counts, failures, and transaction outcomes;
- an unaccepted target never becomes an implicit source replacement;
- externally supplied source or outer transactions are not committed or rolled back by nested transfer code.

SQLite may provide deterministic acceptance coverage for the generic workflow.
PostgreSQL and MariaDB/MySQL suites are required for their engine-specific sequence, session, and DDL behavior before claiming equivalent rebuild support.

## Boundary Verification

Tests must confirm that core rebuild code does not discover migration versions, infer renames, generate arbitrary incremental `ALTER` plans, perform application cutover, or resolve transformation implementations through an unrestricted container lookup.

## ESM Conformity

`teqfw-esm-validator src --profile base` is a release gate and must report no violations.
Interface publication units declare `@interface` at module level. Concrete behavior is defined through constructor closures rather than prototype methods.
Callable JSDoc contracts mirror actual parameters, DI dependency names, and asynchronous return values.
