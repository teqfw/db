# @teqfw/db Product

## Purpose

Provide relational persistence for TeqFW applications whose model is distributed across teq-plugins.

## Mental Model

Teq-plugins declare model fragments.
`@teqfw/db` compiles them into a validated target with provenance, projects it through a dialect adapter, and provides access and rebuild capabilities.

## Scope

Includes:

- DEM compilation, validation, provenance, and dialect-aware projection.
- Transactional access, structure recreation, and rebuild data transfer.

Excludes:

- Application business rules and authorization.
- Inferred incremental migration and application cutover.

## Invariants

- The DEM is target state, not change history.
- External references are resolved explicitly.
- Conflicting ownership, invalid relations, and unsupported capabilities fail before database mutation.
- Logical types remain separate from physical storage and value generation.
- Cycles and dependency order are explicit for structure and transfer operations.
- Nested work never owns a caller-supplied transaction.
- Rebuild migration preserves data only through an explicit snapshot or source-to-target transfer.
- Destructive replacement requires application or operator authority.

## Agent Document

`overview.md`
