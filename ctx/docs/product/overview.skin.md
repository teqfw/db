# @teqfw/db Product

## Purpose

Provide the common relational persistence infrastructure for TeqFW applications whose data model is distributed across teq-plugins.

## Mental Model

Each teq-plugin declares its fragment of the application data model.
`@teqfw/db` composes the fragments into one target model, projects it to a relational structure, and supplies shared access and rebuild capabilities.

## Scope

Includes:

- Distributed DEM composition and relational projection.
- Connection, transaction, CRUD, selection, structure recreation, and rebuild-oriented data transfer.

Excludes:

- Application business rules and authorization.
- Automatic incremental schema diff, inferred data transformations, and application migration orchestration.

## Invariants

- The composed DEM is the target structure, not a history of changes.
- External references are resolved explicitly.
- Foreign-key dependency order governs destructive and transfer operations.
- Nested CRUD never owns a transaction supplied by its caller.
- Rebuild migration preserves data only through an explicit snapshot or source-to-target transfer.
- Destructive replacement requires application or operator authority.

## Agent Document

`overview.md`
