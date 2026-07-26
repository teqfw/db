# Architecture Constraints

- Path: `ctx/docs/architecture/constraints.md`
- Changed: `20260726`

## Core Constraints

- Source is pure JavaScript ESM.
- Runtime composition targets `@teqfw/di` 2.x and explicit `__deps__`.
- Knex remains the RDB abstraction.
- The public namespace remains `TeqFw_Db_`.
- JSON declarations remain usable without TypeScript, decorators, reflection, or transpilation.
- PostgreSQL, MySQL/MariaDB, and SQLite behavior covered by existing code must remain; other Knex-supported engines remain conditional on driver behavior.

## Boundary Constraints

The persistence package must not define application entities, authorization, business validation, or deployment secrets.
DTO/schema filtering must not be presented as business validation.

## Change Constraints

Human review is required before:

- removing a documented declaration field or CRUD behavior;
- changing physical table-name derivation;
- changing transaction ownership;
- removing a supported database family;
- adding implicit destructive migration behavior;
- adding a new runtime integration.
