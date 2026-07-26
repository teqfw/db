# Architecture Overview

- Path: `ctx/docs/architecture/overview.md`
- Changed: `20260726`

## Architecture Role

The architecture separates logical model composition, relational projection, database access, and operational orchestration.
Components are linked by `TeqFw_Db_` dependency tokens through explicit `__deps__` metadata.

## Major Areas

- Declaration layer: DTOs for DEM fragments, maps, selections, and RDB objects.
- Composition layer: scans, loads, maps, normalizes, and orders entity declarations.
- Schema layer: converts normalized entities into Knex schema operations.
- Access layer: owns connection, transaction wrappers, CRUD engines, repositories, and query selection.
- Operations layer: structure lifecycle, import/export, CLI descriptors, and plugin lifecycle adapters.

## Main Flow

JSON fragments → typed DTOs → normalized DEM → dependency-ordered RDB descriptors → Knex schema/data operations.

## Integration Boundaries

`@teqfw/di` resolves component graphs.
Knex provides query and schema builders.
Database client packages provide physical connectivity.
Filesystem JSON files provide declarations, maps, configuration, and dumps.

## Architectural Invariants

- DI declarations are source-attached and export-scoped.
- Logical declarations do not depend on Knex objects.
- Connection-specific behavior is behind transaction and connection services.
- Dependency order is computed before structure or transfer operations.
- DTO factories create new values and never retain caller-owned mutable input.

## Reading Map

Read `structure.md`, `behavior.md`, `schema-declaration.md`, `map-declaration.md`, `integration.md`, `state.md`, `constraints.md`, and `decisions.md`.
