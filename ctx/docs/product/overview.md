# Product Overview

- Path: `ctx/docs/product/overview.md`
- Changed: `20260726`

## Product Identity

`@teqfw/db` is the TeqFW relational persistence package.
It lets an application and its installed packages declare their portions of a shared relational model and use that model through common schema, transaction, CRUD, query-selection, export, and import capabilities.

## Product Mission

Keep relational persistence declarations modular at package boundaries while producing one consistent application database and one stable access model across supported RDBMS engines.

## Product Scope

The package owns:

- loading and normalizing distributed DEM fragments;
- resolving external entity references through an application map;
- translating the normalized model to physical RDB schema operations;
- connection and transaction abstractions over Knex;
- low-level and repository-oriented CRUD;
- filtering, sorting, pagination, and count queries;
- dependency-ordered structure lifecycle and data transfer.

## Core Lifecycle

A consumer configures a database connection and namespace roots, loads package model fragments, normalizes them with the application map, creates or inspects the relational structure, then performs transactional data operations.
Export reads tables in dependency order; import restores them in the same safe order.

## Product Boundaries

### In Scope

- PostgreSQL, MySQL/MariaDB, SQLite, MS SQL, and Oracle connectivity supported through Knex and installed drivers.
- JSON declarations for entities, attributes, indexes, relations, package nesting, references, table namespaces, and deprecated entities.
- Explicit transaction participation and automatic transaction wrapping.

### Out of Scope

- Application business rules and authorization.
- A full object-relational mapper, unit of work, or entity identity map.
- Owning database drivers beyond Knex and consumer-installed client packages.
- Automatically inventing schema migrations from arbitrary production drift.

## Current Version Boundary

The 2.x line preserves the functional surface of the legacy package while replacing constructor-key DI declarations with explicit `__deps__` contracts compatible with `@teqfw/di` 2.x.
The legacy implementation remains available on branch `v1`.

## Product Invariants

- Package model fragments remain independently declarable and compose into one normalized model.
- External references are resolved explicitly, never by ambiguous name guessing.
- Physical table names remain derived from configured namespace plus normalized entity path.
- Destructive schema operations respect foreign-key dependency order.
- Consumer-supplied transactions are never committed or rolled back by a nested CRUD operation.
- Unsupported fields must not silently enter persisted DTOs.

## Documentation Map

- `domain.md` defines the persistence model.
- `roles.md` defines participants.
- `use-cases.md` defines supported outcomes.
- `glossary.md` defines stable terms.
