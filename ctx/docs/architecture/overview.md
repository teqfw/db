# Architecture Overview

- Path: `ctx/docs/architecture/overview.md`
- Changed: `20260808`

This document is paired with `overview.skin.md` and preserves its architecture meaning.

## Architecture Role

The architecture separates logical model composition, relational projection, database access, rebuild execution, and external migration orchestration.
Components are linked by `TeqFw_Db_` dependency tokens through explicit `__deps__` metadata.

## Major Areas

- Declaration layer: DTOs for DEM fragments, maps, selections, and RDB objects.
- Composition layer: scans, loads, maps, normalizes, and orders entity declarations.
- Schema layer: converts normalized entities into Knex schema operations.
- Access layer: owns connection, transaction wrappers, CRUD engines, repositories, and query selection.
- Rebuild layer: source preservation, target creation, dependency-ordered transfer, explicit transformation, and result evidence.
- Operations layer: structure lifecycle, import/export, CLI descriptors, and plugin lifecycle adapters.

## Main Flow

```text
package DEM fragments + application map
  -> typed declarations
  -> normalized target DEM
  -> dependency-ordered target RDB descriptors
  -> Knex structure and data operations

source data or durable dump + target descriptors + explicit transformations
  -> rebuild transfer
  -> result evidence
  -> caller-owned acceptance and cutover
```

The normalized DEM contains target state only.
It is not compared with arbitrary production state to infer an incremental migration.

## Integration Boundaries

`@teqfw/di` resolves component graphs.
Knex provides query and schema builders.
Database client packages provide physical connectivity.
Filesystem JSON files provide declarations, maps, configuration, and dumps.
An external migrator or host application supplies migration sequencing, transformation selection, source/target topology, and cutover policy when those concerns are required.

## Architectural Invariants

- DI declarations are source-attached and export-scoped.
- Logical declarations do not depend on Knex objects.
- Connection-specific behavior is behind transaction and connection services.
- Dependency order is computed before structure or transfer operations.
- In-place rebuild requires a durable source snapshot before destructive replacement.
- Parallel rebuild keeps source and target identities distinct until caller-owned acceptance.
- Transfer logic uses explicit mappings or transformations and never infers semantic changes from names alone.
- The rebuild result records failures and processed scope; it does not authorize cutover or source deletion.
- DTO factories create new values and never retain caller-owned mutable input.

## Implementation Boundary

The current 2.x implementation contains the composition, structure recreation, export, import, and transformation-interface foundations.
It does not yet provide a unified source-to-target rebuild service or the complete evidence contract required by the target architecture.

## Reading Map

Read `structure.md`, `behavior.md`, `state.md`, `integration.md`, `constraints.md`, and `decisions.md` for the runtime model.
Read `schema-declaration.md` and `map-declaration.md` for target-model inputs.
