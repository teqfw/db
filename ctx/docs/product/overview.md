# Product Overview

- Path: `ctx/docs/product/overview.md`
- Changed: `20260904`

This document is paired with `overview.skin.ru.md` and preserves its product meaning.

## Product Identity

`@teqfw/db` manages a distributed schema for related application data.
It accepts schema fragments owned by the host application and its installed teq-plugins, composes them into one validated application-wide target model with provenance, and makes that model available for database creation and data access.

## Product Mission

Keep declarations local to their owning teq-plugins while allowing a host application to assemble one coherent schema from reusable fragments, including explicit relationships between data owned by different packages.
An application may use one or more explicitly declared database targets. Each target is a physical database or an independently addressable namespace, has a full or prefix-bounded scope, and is `read` or `write`. `@teqfw/db` proves target compatibility before making the relevant target model available to the database and access layers.
When a write target model changes, provide a standardized, bounded migration path that invokes application-owned transition semantics, verifies the result, and preserves the boundary against inferred incremental migration.

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
The selected set may include the `teqfw.db.schema` fragment supplied by `@teqfw/db`; it declares the platform history entities through the same mechanism as every other fragment. The compiler validates ownership, references, relations, and compatibility before producing the assembled application schema, or returns diagnostics without an executable partial model.
The resulting target model is then projected into the selected database structure and used by the data-access layer.

For a rebuild migration, an authorized caller captures or retains source data, creates the target structure in place or in a separately provisioned target, transfers compatible data in dependency order, and verifies the result before the old durable state is discarded.

## Product Boundaries

### In Scope

- Distributed, versioned declarations of entities, attributes, relations, package ownership, and application mappings.
- Compilation of selected fragments into an effective DEM and the target DEMs assigned to an application's declared database targets.
- Compatibility verification of every target's actual assigned schema area before application work begins.
- Projection of a target DEM into its declared physical database or namespace.
- Data access against the assembled application schema.
- Coordinated execution and verification of application-owned migrations for authorized write targets, including full recreation and data-preserving rebuild when source and target can be mapped without inferred semantics.

### Out of Scope

- Application business rules and authorization.
- A full object-relational mapper, unit of work, or entity identity map.
- Owning database engines, drivers, or provider capabilities beyond the explicit database contracts.
- Treating an arbitrary database feature as part of the assembled schema without validation and host selection.
- Discovering arbitrary production drift and automatically generating an incremental `ALTER` plan.
- Inferring renames, splits, merges, type conversions, or values for newly required fields.
- Inferring application migration policy, renames, splits, merges, semantic conversions, or values for new required fields.
- Cross-target DEM relations or cross-target foreign keys.

## Product Invariants

- Package model fragments remain independently declarable and compose into one canonical model.
- Every target-schema entity originates in a selected DEM fragment; the compiler never injects semantic nodes after composition.
- A host application controls which fragments form its target schema and how cross-package dependencies are mapped.
- Every application database target is explicit and has one declared scope and access mode; several targets never form one implicit shared target.
- A full-scope target describes its complete entrusted schema area; a partial-scope target describes every object in its required prefix and no object outside that prefix.
- `read` verifies but never changes its assigned target area; `write` may change it only through an authorized application-owned migration.
- Every declared target must be compatible before the application begins normal work.
- A DEM relation never crosses database targets.
- The assembled schema makes relations between data owned by different packages explicit.
- A semantic model node has one package owner; conflicting declarations never select a silent winner.
- Provenance connects every canonical semantic node and diagnostic to its trusted fragment source.
- External references are resolved explicitly, never by ambiguous name guessing.
- Invalid references, attributes, relation cardinality, type compatibility, target uniqueness, indexes, and unsupported capabilities fail before execution.
- Logical type, physical storage, value default, and value generation remain separate contracts.
- The canonical DEM describes the target state; it does not encode the history required to infer semantic migrations.
- A write-target history records which immutable effective DEM was successfully applied; it is audit evidence, not proof of the current catalog and not a source of inferred migration semantics.
- Destructive replacement of durable state requires application or operator authorization and an explicit preservation decision.

## Contract Status

The product behavior above is the accepted direction for the 2.x line.
`../code/overview.md` is authoritative for which parts are currently implemented and which remain delivery gaps.

## Documentation Map

- `domain.md` defines the persistence model.
- `targets.md` defines target scope, access modes, and startup compatibility.
- `roles.md` defines participants.
- `use-cases.md` defines supported outcomes.
- `migration.md` defines the rebuild capability and excluded migration responsibilities.
- `glossary.md` defines stable terms.
