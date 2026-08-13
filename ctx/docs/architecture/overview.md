# Architecture Overview

- Path: `ctx/docs/architecture/overview.md`
- Changed: `20260813`

This document is paired with `overview.skin.ru.md` and preserves its architecture meaning.

## Architecture Role

The architecture turns distributed teq-plugin declarations into one host-application schema, then separates logical model compilation, dialect-specific relational projection, typed query compilation, database access, rebuild execution, and migration orchestration. The current implementation realizes the schema in one database; several explicitly selected database targets remain a future extension and are not part of the current contract.
Components are linked by `TeqFw_Db_` dependency tokens through explicit `__deps__` metadata.

## Architectural Shape

- Declaration and composition layers collect trusted plugin fragments and the host application's dependency map.
- Compiler layers validate ownership, references, relations, and logical compatibility, producing the canonical application schema.
- Projection and access layers materialize and use that schema through the selected database boundary.
- Rebuild layers preserve source data, create a target, transfer explicitly compatible data, and produce evidence.
- Host or future migration-plugin orchestration remains a separate ownership decision.

## Main Flow

```text
host-selected teq-plugin DEM fragments + application map + selected adapter
  -> DEM v2 decode
  -> ownership-safe composition + provenance
  -> reference resolution and logical validation
  -> validated canonical DEM + dependency graph
  -> capability-aware physical schema plan
  -> runtime preflight
  -> authorized database structure, data, and schema-bound access operations

canonical application schema + source data or durable dump + explicit transformations
  -> rebuild transfer
  -> result evidence
  -> caller-owned acceptance and cutover
```

The canonical DEM contains target state only.
It is not compared with arbitrary production state to infer an incremental migration.

## Integration Boundaries

`@teqfw/di`, `@teqfw/cfg`, Knex, database drivers, and filesystem declarations are implementation boundaries for the architecture.
Dialect adapters own database-specific projection and capability behavior without turning declaration values into unchecked database operations.
The host application or a future migration plugin may supply migration sequencing, transformation selection, source/target topology, and cutover policy when those concerns are required; ownership of that orchestration is not yet decided.

## Architectural Invariants

- Every semantic declaration node has one fragment owner and trusted provenance.
- The canonical application schema is the source of truth for projection and schema-bound access.
- Logical declarations remain independent of a particular database implementation.
- Compilation fails before side effects when ownership, relation, capability, or compatibility rules fail.
- Physical projection and access use validated adapter and schema contracts.
- Rebuild requires explicit preservation and transformation decisions, reports evidence, and does not authorize cutover.
- The canonical model describes target state, not inferred migration history.

## Implementation Boundary

Current implementation status and verification are maintained in `../code/overview.md` and `../code/testing.md`; this overview defines the architecture rather than repeating delivery reports.

## Terminology

The canonical application schema is the logical canonical DEM. Physical schema plans, runtime schemas, query plans, and DTOs are derived representations of it.

## Reading Map

Read `dem/overview.md` first for the target model and its linked declaration, composition, validation, adapter, index, and query contracts.
Then read `structure.md`, `behavior.md`, `state.md`, `integration.md`, `constraints.md`, and `decisions.md` for the surrounding runtime model.
