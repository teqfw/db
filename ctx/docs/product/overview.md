# Product Overview

- Path: `ctx/docs/product/overview.md`
- Changed: `20260813`

This document is paired with `overview.skin.ru.md` and preserves its product meaning.

## Product Identity

`@teqfw/db` is the common relational persistence infrastructure for TeqFW applications.
It accepts logical model fragments owned by the application and its installed teq-plugins, compiles them into one validated target Domain Entity Model (DEM) with provenance, projects that model through an explicit database-dialect adapter, and exposes shared data-access and rebuild capabilities.

## Product Mission

Keep relational declarations local to their owning teq-plugins while producing one explicit application-wide target model whose ownership, compatibility, and database requirements are proven before execution, plus one stable relational access layer.
When the target model changes, provide a bounded rebuild path that can recreate a schema or database and transfer compatible data without assuming responsibility for full incremental migration.

## Product Scope

The package owns:

- loading, version-decoding, composing, and normalizing distributed DEM fragments;
- detecting ownership conflicts and retaining source provenance for every canonical semantic node;
- resolving external entity references through an application map;
- validating types, defaults, generation, indexes, relations, dependency cycles, and capabilities;
- translating the normalized logical model through a selected dialect adapter to physical RDB schema operations;
- connection and transaction abstractions over Knex;
- low-level and repository-oriented CRUD;
- typed filtering, projection, sorting, pagination, count, and registered dialect query expressions;
- dependency-ordered structure creation and removal;
- snapshot export, import, and source-to-target data transfer primitives for rebuild migration.

## Core Lifecycle

A consumer configures database access and namespace roots, loads package model fragments, applies the application map, and selects the adapter for the configured connection.
Packages can declare system identities with the `core.identity` logical type and local references to exactly one such identity with `core.ref`, while relations declare the concrete target mapping.
The application map supplies the one target-wide `identityProfile`; compilation resolves `core.identity` into a concrete logical type plus generation policy and `core.ref` into only the compatible type of its resolved identity target before ordinary relational and dialect validation.
The compiler either returns one immutable canonical DEM, physical plan, provenance map, requirements, graph, and deterministic fingerprint or returns aggregated diagnostics with no executable partial model.
Before database work, the adapter confirms that required runtime capabilities are available.
The package then executes the phase-ordered physical plan or typed query.

For a rebuild migration, an authorized caller captures or retains source data, creates the target structure in place or in a separately provisioned target, transfers compatible data in dependency order, and verifies the result before the old durable state is discarded.

## Product Boundaries

### In Scope

- PostgreSQL, MySQL/MariaDB, SQLite, MS SQL, and Oracle connectivity supported through Knex and installed drivers.
- Versioned JSON declarations for entities, logical attributes, physical storage bindings, value defaults and generation, full indexes, relations, capabilities, package nesting, references, table namespaces, and deprecated entities.
- Compatibility decoding of unversioned DEM v1 declarations into the canonical model.
- Dialect adapters and capability preflight for database-specific types, indexes, and query operators.
- PostgreSQL vector storage and nearest-neighbour behavior when the PostgreSQL adapter and pgvector runtime capability are selected.
- Explicit transaction participation and automatic transaction wrapping.
- Full recreation of a declared relational structure.
- Data-preserving rebuild through explicit snapshot or source-to-target transfer when the source and target can be mapped without inferred semantics.

### Out of Scope

- Application business rules and authorization.
- A full object-relational mapper, unit of work, or entity identity map.
- Owning database drivers beyond Knex and consumer-installed client packages.
- Treating all Knex-supported database-specific types or indexes as automatically supported by the DEM.
- Installing database extensions or changing server capabilities without separate caller authority.
- Discovering arbitrary production drift and automatically generating an incremental `ALTER` plan.
- Inferring renames, splits, merges, type conversions, or values for newly required fields.
- Owning application release sequencing, online cutover, migration history, or rollback policy.

## Current Version Boundary

The 2.x line preserves the functional surface of the legacy package while replacing constructor-key DI declarations with explicit `__deps__` contracts compatible with `@teqfw/di` 2.x.
The legacy implementation remains available on branch `v1`.

## Product Invariants

- Package model fragments remain independently declarable and compose into one canonical model.
- A semantic model node has one package owner; conflicting declarations never select a silent winner.
- Provenance connects every canonical semantic node and diagnostic to its trusted fragment source.
- External references are resolved explicitly, never by ambiguous name guessing.
- Invalid references, attributes, relation cardinality, type compatibility, target uniqueness, indexes, and unsupported capabilities fail before execution.
- Logical type, physical storage, value default, and value generation remain separate contracts.
- The canonical DEM describes the target state; it does not encode the history required to infer semantic migrations.
- Physical table names remain derived from configured namespace plus normalized entity path.
- Destructive schema operations respect foreign-key dependency order.
- Data transfer reads and writes modeled tables in dependency order.
- A cyclic transfer requires an explicit supported strategy; cycle detection is never log-only behavior.
- Database-specific query expressions use registered typed operators and bound values, never declaration-provided raw SQL.
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
