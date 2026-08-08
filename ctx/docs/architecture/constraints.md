# Architecture Constraints

- Path: `ctx/docs/architecture/constraints.md`
- Changed: `20260808`

## Core Constraints

- Source is pure JavaScript ESM.
- Runtime composition targets `@teqfw/di` 2.x and explicit `__deps__`.
- Knex remains the RDB abstraction.
- The public namespace remains `TeqFw_Db_`.
- JSON declarations remain usable without TypeScript, decorators, reflection, or transpilation.
- PostgreSQL, MySQL/MariaDB, and SQLite behavior covered by existing code must remain; other Knex-supported engines remain conditional on driver behavior.
- The normalized DEM remains a target-state declaration and must not accumulate implicit migration history.
- Rebuild migration remains separable from full incremental migration orchestration.

## Boundary Constraints

The persistence package must not define application entities, authorization, business validation, or deployment secrets.
DTO/schema filtering must not be presented as business validation.
The package must not infer business meaning from physical schema differences or silently transform incompatible data.

## Rebuild Safety Constraints

- An in-place rebuild must not begin destructive replacement before source data has been explicitly preserved or the caller has explicitly authorized data loss.
- A parallel rebuild must not retire or mutate its source as an implicit consequence of target creation.
- Required table-transfer failure prevents a successful rebuild result.
- Destructive cleanup and application cutover remain caller-owned decisions.
- Database-specific non-transactional DDL behavior must be reported rather than hidden behind a generic rollback claim.

## Change Constraints

Human review is required before:

- removing a documented declaration field or CRUD behavior;
- changing physical table-name derivation;
- changing transaction ownership;
- weakening rebuild evidence or preservation requirements;
- removing a supported database family;
- adding implicit destructive migration behavior;
- moving incremental migration planning or application cutover into the package;
- adding a new runtime integration.
