# Product Overview

- Path: `ctx/docs/product/overview.md`
- Changed: `20260808`

This document is paired with `overview.skin.md` and preserves its product meaning.

## Product Identity

`@teqfw/db` is the common relational persistence infrastructure for TeqFW applications.
It accepts logical model fragments owned by the application and its installed teq-plugins, composes them into one target Domain Entity Model (DEM), projects that model to a physical relational structure, and exposes shared data-access and rebuild capabilities.

## Product Mission

Keep relational declarations local to their owning teq-plugins while producing one explicit application-wide target model and one stable relational access layer.
When the target model changes, provide a bounded rebuild path that can recreate a schema or database and transfer compatible data without assuming responsibility for full incremental migration.

## Product Scope

The package owns:

- loading and normalizing distributed DEM fragments;
- resolving external entity references through an application map;
- translating the normalized model to physical RDB schema operations;
- connection and transaction abstractions over Knex;
- low-level and repository-oriented CRUD;
- filtering, sorting, pagination, and count queries;
- dependency-ordered structure creation and removal;
- snapshot export, import, and source-to-target data transfer primitives for rebuild migration.

## Core Lifecycle

A consumer configures database access and namespace roots, loads package model fragments, applies the application map, and obtains one normalized target DEM.
The package derives dependency-ordered relational descriptors from that DEM and can create, remove, or use the resulting structure.

For a rebuild migration, an authorized caller captures or retains source data, creates the target structure in place or in a separately provisioned target, transfers compatible data in dependency order, and verifies the result before the old durable state is discarded.

## Product Boundaries

### In Scope

- PostgreSQL, MySQL/MariaDB, SQLite, MS SQL, and Oracle connectivity supported through Knex and installed drivers.
- JSON declarations for entities, attributes, indexes, relations, package nesting, references, table namespaces, and deprecated entities.
- Explicit transaction participation and automatic transaction wrapping.
- Full recreation of a declared relational structure.
- Data-preserving rebuild through explicit snapshot or source-to-target transfer when the source and target can be mapped without inferred semantics.

### Out of Scope

- Application business rules and authorization.
- A full object-relational mapper, unit of work, or entity identity map.
- Owning database drivers beyond Knex and consumer-installed client packages.
- Discovering arbitrary production drift and automatically generating an incremental `ALTER` plan.
- Inferring renames, splits, merges, type conversions, or values for newly required fields.
- Owning application release sequencing, online cutover, migration history, or rollback policy.

## Current Version Boundary

The 2.x line preserves the functional surface of the legacy package while replacing constructor-key DI declarations with explicit `__deps__` contracts compatible with `@teqfw/di` 2.x.
The legacy implementation remains available on branch `v1`.

## Product Invariants

- Package model fragments remain independently declarable and compose into one normalized model.
- External references are resolved explicitly, never by ambiguous name guessing.
- The normalized DEM describes the target state; it does not encode the history required to infer semantic migrations.
- Physical table names remain derived from configured namespace plus normalized entity path.
- Destructive schema operations respect foreign-key dependency order.
- Data transfer reads and writes modeled tables in dependency order.
- Destructive replacement of durable state requires application or operator authorization and an explicit preservation decision.
- Consumer-supplied transactions are never committed or rolled back by a nested CRUD operation.
- Unsupported fields must not silently enter persisted DTOs.

## Contract Status

The product behavior above is the accepted direction for the 2.x line.
`../code/overview.md` is authoritative for which parts are currently implemented and which remain delivery gaps.

## Documentation Map

- `domain.md` defines the persistence model.
- `roles.md` defines participants.
- `use-cases.md` defines supported outcomes.
- `migration.md` defines the rebuild capability and excluded migration responsibilities.
- `glossary.md` defines stable terms.
