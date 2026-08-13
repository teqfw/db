# Product Domain Model

- Path: `ctx/docs/product/domain.md`
- Changed: `20260813`

## Domain Areas

### Model Declaration

A package owns a DEM fragment describing nested packages, entities, logical attributes, optional dialect storage, value defaults and generation, indexes, relations, capabilities, and unresolved external references.
The application owns the map that binds external references to actual entity paths and optionally remaps attribute names.
DEM declarations and application maps use the explicit v2 contract (`version: 2`).

### Model Composition

Compilation produces one normalized target DEM from independently owned fragments.
Semantic nodes have one owner, structural package containers may compose disjoint children, and generic deep merge is not part of the model.
Trusted fragment provenance is retained separately from logical content.
The target DEM is a desired-state model, not an ordered migration history and not a description of arbitrary physical database drift.

Compilation validates the complete logical model and aggregates diagnostics before returning an executable model.
It does not let a later Knex call discover an unknown type, missing relation endpoint, or ownership conflict.

### Relational Structure

The normalized logical DEM is translated by one selected dialect adapter to tables, columns, constraints, indexes, and foreign keys.
An application-level namespace prefixes physical table names.
Deprecated entities identify obsolete tables and their required drop order.

Logical type, physical storage, default value, and generation policy are distinct.
Database-specific types and indexes declare capabilities that the adapter supports statically and the actual connection proves at runtime.

`core.identity` and `core.ref` are special logical DEM types in the inter-entity addressing protocol, not abbreviations for a SQL column type or auto-increment mechanism.
`core.identity` says that an attribute stores the system identity of its entity; it does not name another entity or select its representation.
`core.ref` says that a local attribute stores the representation of exactly one relation-resolved `core.identity`; it does not identify that target by itself.
The relation is the source of truth for the target, while external application mapping resolves package-external paths without changing ownership.
`identityProfile` is the host-owned policy that defines how logical entity identities and their references are represented in the target application model. Its current DEM v2 structure supplies the canonical type and generation policy used to materialize `core.identity`.
Compilation resolves `core.identity` into an explicit concrete type and generation policy, and resolves `core.ref` into only the compatible concrete type of its resolved identity target. Normal relational and dialect validation then applies without unresolved types.

### Query And Data Access

A schema object describes one persistent entity through its logical path, attributes, primary key, and DTO factory.
Repositories and CRUD engines use that schema with a transaction to create, read, update, delete, count, filter, sort, and paginate records.
Selection v2 uses typed expression nodes and registered core or dialect operators so nearest-neighbour and other provider operations remain schema-checked and parameter-bound.
Legacy comparison selections decode into core expression operators.

### Data Transfer

A database dump contains table rows and, where applicable, PostgreSQL sequence values.
Export and import use dependency order and normalize engine-specific date and sequence representations.

### Rebuild Migration

A rebuild migration replaces one physical realization of the application model with another.
It preserves data through an explicit snapshot or through a source-to-target copy, rather than by mutating every existing object in place.
The core package can move structurally compatible data and invoke explicitly supplied transformation behavior; it cannot infer the business meaning of incompatible changes.

## Core Entities

- DEM fragment — one package-owned model declaration.
- Canonical DEM — the application-wide decoded, composed, resolved, and logically validated model.
- Compilation result — immutable canonical DEM plus provenance, dependency graph, requirements, physical plan, fingerprint, and warnings.
- Provenance — trusted fragment source records attached to canonical paths and diagnostics.
- Map — application-owned external-reference and physical namespace mapping.
- Entity — a logical persistent record type.
- Attribute — a logical typed entity value with separate storage, default, and generation contracts.
- `core.identity` — special logical type for an entity's system-addressable identity.
- `core.ref` — special logical type for a local representation derived from exactly one relation-resolved `core.identity`; it has no generation policy.
- Relation — a foreign-key relation between entity attributes.
- Capability — a namespaced database or extension feature required by a declaration, adapter registry item, or operation.
- Dialect adapter — the owner of physical type, index, query-operator, and runtime capability rules for one database dialect.
- Physical schema plan — phase-ordered descriptors produced from a valid canonical DEM for one adapter.
- Diagnostic — structured error or warning with code, stage, canonical path, provenance, and safe details.
- Schema object — runtime data-access metadata for one entity.
- Typed expression — validated attribute, bound value, or registered operator call used by queries and indexes.
- Selection — filtering, derived projection, expression ordering, limit, offset, and allow-listed execution options.
- Transaction — the atomic database operation boundary.
- Dump — transferable database contents.
- Source structure — the physical structure from which data is preserved during a rebuild.
- Target structure — the newly created physical projection of the normalized target DEM.
- Rebuild migration — structure recreation plus explicit data preservation and restoration.
- Incremental migration — an ordered transition that changes an existing structure or its data in place without full recreation.

## Ownership Principles

Packages own their fragments.
The root application owns cross-package reference mapping, the one target-wide identity representation policy, table namespace, connection configuration, and the decision to recreate or transfer database state.
The core compiler owns canonicalization, validation, provenance, and diagnostics.
The selected dialect adapter owns physical projection rules; the operator owns capability provisioning.
Package developers own the semantics of incompatible changes to data declared by their packages.
The host application or an external migrator owns release sequencing, migration policy, cutover, and final authorization.

## Domain Invariants

- Entity paths are logical and independent of physical table prefixes.
- A semantic entity, attribute, relation, or index has one fragment owner.
- Every canonical semantic node has provenance, while provenance is excluded from model fingerprinting.
- Relation attribute counts must match referenced attribute counts.
- Relation endpoints and attributes exist, positional types are compatible, and target attributes form a declared primary or unique key.
- Every `core.ref` has exactly one relation-resolved `core.identity` target and derives only its concrete type from that target.
- Ordinary relations between explicitly typed attributes remain separate from the identity/reference protocol and may target compatible primary or unique keys.
- Primary, unique, and ordinary indexes are explicit.
- Index method, keys or expressions, operator class, predicate, included columns, options, and build phase are explicit when applicable.
- A canonical model contains no unresolved external reference required by a relation.
- Unsupported types, operators, storage, and capabilities fail before execution.
- A cyclic transfer has an explicit supported plan or fails before data access.
- Dump processing follows table dependency order.
- A rebuild never treats a guessed rename or conversion as accepted migration intent.
- Removing a fragment does not by itself authorize destruction of its durable data.
