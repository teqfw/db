# Architecture Overview

- Path: `ctx/docs/architecture/overview.md`
- Changed: `20260809`

This document is paired with `overview.skin.md` and preserves its architecture meaning.

## Architecture Role

The architecture separates logical model compilation, dialect-specific relational projection, typed query compilation, database access, rebuild execution, and external migration orchestration.
Components are linked by `TeqFw_Db_` dependency tokens through explicit `__deps__` metadata.

## Major Areas

- Declaration layer: DEM v1 compatibility input, DEM v2 logical declarations, maps, selections, and physical descriptors.
- Compiler layer: trusted fragment envelopes, version decoding, single-owner composition, reference mapping, canonical validation, provenance, graph analysis, and deterministic fingerprinting.
- Dialect layer: type/operator registries, capability derivation and preflight, physical projection, and safe database-specific execution.
- Schema layer: phase-ordered tables, key constraints, relations, data, and late indexes.
- Query layer: typed core and dialect expression operators compiled with bound values.
- Access layer: owns connection, transaction wrappers, CRUD engines, repositories, and query selection.
- Rebuild layer: source preservation, target creation, dependency-ordered transfer, explicit transformation, and result evidence.
- Operations layer: structure lifecycle, import/export, CLI descriptors, and plugin lifecycle adapters.

## Main Flow

```text
trusted package DEM fragments + application map + selected adapter
  -> DEM v1/v2 decode
  -> ownership-safe composition + provenance
  -> resolved and validated canonical DEM + dependency graph
  -> capability-aware physical schema plan
  -> runtime preflight
  -> authorized Knex structure, data, and typed query operations

source data or durable dump + target descriptors + explicit transformations
  -> rebuild transfer
  -> result evidence
  -> caller-owned acceptance and cutover
```

The canonical DEM contains target state only.
It is not compared with arbitrary production state to infer an incremental migration.

## Integration Boundaries

`@teqfw/di` resolves component graphs.
Knex provides query and schema builders.
Database client packages provide physical connectivity.
Filesystem JSON files provide declarations, maps, configuration, and dumps.
Dialect adapters provide registered physical type, index, expression, and capability behavior without turning declaration strings into Knex method names.
An external migrator or host application supplies migration sequencing, transformation selection, source/target topology, and cutover policy when those concerns are required.

## Architectural Invariants

- DI declarations are source-attached and export-scoped.
- Logical declarations do not depend on Knex objects.
- A semantic declaration node has one fragment owner and retains trusted provenance.
- Compilation aggregates structured diagnostics and never exposes an executable partial model.
- Connection-specific behavior is behind transaction, connection, and selected-adapter services.
- Dependency graph and cycles are computed before structure or transfer operations.
- Schema cycles use separated creation phases; transfer cycles require an explicit supported strategy.
- Capability preflight succeeds before the first database mutation or dialect query.
- Logical type, physical storage, default, and generation remain separately inspectable.
- Full indexes and typed expressions use registered identities and contain no declaration-provided raw SQL.
- In-place rebuild requires a durable source snapshot before destructive replacement.
- Parallel rebuild keeps source and target identities distinct until caller-owned acceptance.
- Transfer logic uses explicit mappings or transformations and never infers semantic changes from names alone.
- The rebuild result records failures and processed scope; it does not authorize cutover or source deletion.
- DTO factories create new values and never retain caller-owned mutable input.

## Implementation Boundary

The current worktree implements the compiler, provenance, semantic validation, dialect registries and preflight, full index phases, typed expressions, PostgreSQL pgvector adapter behavior, and unified rebuild evidence described here.
Default SQLite-backed tests, static validation, MariaDB 10.11 conformance, and PostgreSQL/pgvector conformance pass.

## Reading Map

Read `dem/overview.md` first for the target model and its linked declaration, composition, validation, adapter, index, and query contracts.
Then read `structure.md`, `behavior.md`, `state.md`, `integration.md`, `constraints.md`, and `decisions.md` for the surrounding runtime model.
