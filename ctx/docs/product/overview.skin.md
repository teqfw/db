# @teqfw/db Product

## Purpose

Provide TeqFW applications with modular, transaction-aware relational persistence.

## Mental Model

Each package declares its piece of the domain entity model.
`@teqfw/db` combines those pieces, resolves explicit mappings, builds one relational schema, and exposes common data operations over Knex.

## Scope

Includes:

- DEM composition and relational schema lifecycle.
- Connection, transaction, CRUD, selection, export, and import capabilities.

Excludes:

- Application business rules and authorization.
- ORM identity maps and implicit production migrations.

## Invariants

- External references are resolved explicitly.
- Foreign-key dependency order governs destructive and transfer operations.
- Nested CRUD never owns a transaction supplied by its caller.
- The `v1` branch preserves the legacy package line.
- The 2.x line targets `@teqfw/di` 2.x.

## Agent Document

`overview.md`
