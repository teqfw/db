# Product Overview

- Path: `ctx/docs/product/overview.md`
- Changed: `20260813`

This document is paired with `overview.skin.ru.md` and preserves its product meaning.

## Product Identity

`@teqfw/db` manages a distributed schema for related application data.
It accepts schema fragments owned by the host application and its installed teq-plugins, composes them into one validated application-wide target model with provenance, and makes that model available for database creation and data access.

## Product Mission

Keep declarations local to their owning teq-plugins while allowing a host application to assemble one coherent schema from reusable fragments, including explicit relationships between data owned by different packages.
The current implementation targets one application database. The product does not close the possibility of several databases in the future; that is an extension rather than a current contract. `@teqfw/db` proves the ownership and compatibility of the selected fragments before making the target model available to the database and access layers.
When the target model changes, provide a bounded rebuild path that can recreate a schema or database and transfer compatible data without assuming responsibility for full incremental migration.

## Product Scope

The package owns:

- loading, version-decoding, composing, and normalizing distributed DEM fragments supplied by teq-plugins;
- detecting ownership conflicts and retaining source provenance for every canonical semantic node;
- resolving external entity references through an application map;
- validating types, defaults, generation, indexes, relations, dependency cycles, and capabilities;
- making the validated target model available for database projection and schema operations;
- providing data access against the assembled application schema;
- snapshot export, import, and source-to-target data transfer primitives for rebuild migration.
- retaining immutable effective-DEM snapshots and append-only schema-application traces for controlled migration planning and recovery.

## Core Lifecycle

The host application discovers its own and its installed teq-plugin fragments, applies the application-owned map for cross-package dependencies, and requests compilation for the target.
The compiler validates ownership, references, relations, and compatibility before producing the assembled application schema, or returns diagnostics without an executable partial model.
The resulting target model is then projected into the selected database structure and used by the data-access layer.

For a rebuild migration, an authorized caller captures or retains source data, creates the target structure in place or in a separately provisioned target, transfers compatible data in dependency order, and verifies the result before the old durable state is discarded.

## Product Boundaries

### In Scope

- Distributed, versioned declarations of entities, attributes, relations, package ownership, and application mappings.
- Compilation of selected fragments into one canonical target model for the host application.
- Projection of the target model into the one selected database structure supported by the current implementation; additional database targets remain a future extension.
- Data access against the assembled application schema.
- Full recreation and data-preserving rebuild when source and target can be mapped without inferred semantics.

### Out of Scope

- Application business rules and authorization.
- A full object-relational mapper, unit of work, or entity identity map.
- Owning database engines, drivers, or provider capabilities beyond the explicit database contracts.
- Treating an arbitrary database feature as part of the assembled schema without validation and host selection.
- Discovering arbitrary production drift and automatically generating an incremental `ALTER` plan.
- Inferring renames, splits, merges, type conversions, or values for newly required fields.
- Owning application release sequencing, online cutover, migration policy, or rollback policy.

## Product Invariants

- Package model fragments remain independently declarable and compose into one canonical model.
- A host application controls which fragments form its target schema and how cross-package dependencies are mapped.
- The current target is one application database; future support for several databases must keep each physical target explicit rather than creating one implicit shared target.
- The assembled schema makes relations between data owned by different packages explicit.
- A semantic model node has one package owner; conflicting declarations never select a silent winner.
- Provenance connects every canonical semantic node and diagnostic to its trusted fragment source.
- External references are resolved explicitly, never by ambiguous name guessing.
- Invalid references, attributes, relation cardinality, type compatibility, target uniqueness, indexes, and unsupported capabilities fail before execution.
- Logical type, physical storage, value default, and value generation remain separate contracts.
- The canonical DEM describes the target state; it does not encode the history required to infer semantic migrations.
- A package-owned history records which immutable effective DEM was successfully applied; it is audit evidence, not release sequencing, migration planning, cutover, or rollback policy.
- Destructive replacement of durable state requires application or operator authorization and an explicit preservation decision.

## Contract Status

The product behavior above is the accepted direction for the 2.x line.
`../code/overview.md` is authoritative for which parts are currently implemented and which remain delivery gaps.

## Documentation Map

- `domain.md` defines the persistence model.
- `roles.md` defines participants.
- `use-cases.md` defines supported outcomes.
- `migration.md` defines the rebuild capability and excluded migration responsibilities.
- `glossary.md` defines stable terms.
