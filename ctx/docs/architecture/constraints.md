# Architecture Constraints

- Path: `ctx/docs/architecture/constraints.md`
- Changed: `20260808`

## Core Constraints

- Source is pure JavaScript ESM.
- Runtime composition targets `@teqfw/di` 2.x and explicit `__deps__`.
- Knex remains the RDB abstraction.
- The public namespace remains `TeqFw_Db_`.
- JSON declarations remain usable without TypeScript, decorators, reflection, or transpilation.
- Declarations and application maps explicitly declare `version: 2`; omitted and unsupported versions are rejected before composition.
- PostgreSQL, MySQL/MariaDB, and SQLite behavior covered by existing code must remain; other Knex-supported engines remain conditional on driver behavior.
- The canonical DEM remains a target-state declaration and must not accumulate implicit migration history.
- Rebuild migration remains separable from full incremental migration orchestration.
- Dialect-specific growth occurs through registries and adapters, not an unchecked global enum.

## Boundary Constraints

The persistence package must not define application entities, authorization, business validation, or deployment secrets.
DTO/schema filtering must not be presented as business validation.
The package must not infer business meaning from physical schema differences or silently transform incompatible data.
The package must not silently overwrite fragment owners, concatenate semantic arrays, lose provenance, pass unknown types to Knex, install extensions implicitly, or accept declaration-provided raw SQL.

## DEM Compiler Constraints

- Schema-aware composition replaces generic deep merge for DEM compilation.
- Independent diagnostics are aggregated deterministically before failure.
- Relation endpoints, attributes, cardinality, logical and physical compatibility, and target uniqueness are enforced.
- Graph cycles are returned as model data; unsupported operation cycles fail before side effects.
- Schema, transfer, and query execution accept only a successful compilation result and successful operation preflight.
- Physical column/index descriptors retain logical and physical identities and build phase.
- Database-specific query operators are type-checked and parameter-bound.

## Rebuild Safety Constraints

- An in-place rebuild must not begin destructive replacement before source data has been explicitly preserved or the caller has explicitly authorized data loss.
- A parallel rebuild must not retire or mutate its source as an implicit consequence of target creation.
- Required table-transfer failure prevents a successful rebuild result.
- Required `afterData` index failure prevents a successful rebuild result.
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
