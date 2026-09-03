# Architecture Constraints

- Path: `ctx/docs/architecture/constraints.md`
- Changed: `20260903`

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

## JSDoc Type Information

JSDoc is the structural type layer of the checked JavaScript codebase and is part of each module's executable contract. Type annotations must describe the values that the module actually accepts and returns; they must not be weakened merely to satisfy TypeScript, `teqfw-esm-validator`, or an incomplete intermediate implementation.

For every new or changed annotation, choose the narrowest honest type in this order:

1. a literal or primitive type such as `string`, `number`, or `boolean`;
2. an explicit union or optional form when the value has a bounded set of alternatives;
3. a package-owned named structural alias in `types.d.ts` when a shape is known, reused, crosses a module boundary, or represents a domain/DEM stage contract;
4. `object` when the value is intentionally opaque but is known to be an object and no fields are inspected;
5. `unknown` at an untrusted or genuinely dynamic ingress, followed immediately by runtime validation and narrowing;
6. `any` only as a documented, smallest-scope exception for an irreducibly dynamic external boundary or compatibility shim.

The preferred destination is a named `TeqFw_Db_*` structural alias. `any` is not a default, a placeholder, a shortcut for an unfinished shape, or a validator workaround. It is forbidden for package-owned domain data, DEM declarations, compiler results, physical descriptors, query contracts, and successful public API results. `@returns {any}` must not be used to hide an unknown result shape, and a failing type check must not be repaired by broadening a type to `any`.

When a value changes shape across a pipeline, define separate named aliases for the stages instead of allowing one broad value to flow through them. In particular, decoded fragments, composed canonical DEM, mapped/resolved DEM, validated model, and physical plan are different contracts. Open JSON maps should use an explicit map shape and remain validated before field access. Third-party or Knex values may be adapted at the smallest boundary and must be normalized into a package-owned type immediately.

Every new or changed `any` requires an inline reason in the change review and an entry in the repository's exception allowlist. The allowlist is temporary and ratcheted down; it must identify the exact boundary, why a narrower primitive, named alias, `object`, or `unknown` is impossible, and where normalization occurs. `@ts-nocheck`, generic aliases used to conceal source contracts, and validator-driven type erasure are not acceptable substitutes for a real contract.

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
