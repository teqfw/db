# Product Domain Model

- Path: `ctx/docs/product/domain.md`
- Changed: `20260808`

## Domain Areas

### Model Declaration

A package owns a DEM fragment describing nested packages, entities, logical attributes, optional dialect storage, value defaults and generation, indexes, relations, capabilities, and unresolved external references.
The application owns the map that binds external references to actual entity paths and optionally remaps attribute names.
Unversioned declarations are DEM v1 compatibility input; new declarations use DEM v2.

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


An identity role and a reference role let a reusable package declare key intent without choosing its width or signedness.
The application map owns the identity profile selected for one target model; it supplies the actual logical type and generation policy.
A reference role derives its logical type from its resolved relation target.
The compiler makes those derived values explicit in the canonical DEM before normal type and dialect validation.
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
The root application owns cross-package reference mapping, table namespace, connection configuration, and the decision to recreate or transfer database state.
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
- Primary, unique, and ordinary indexes are explicit.
- Index method, keys or expressions, operator class, predicate, included columns, options, and build phase are explicit when applicable.
- A canonical model contains no unresolved external reference required by a relation.
- Unsupported types, operators, storage, and capabilities fail before execution.
- A cyclic transfer has an explicit supported plan or fails before data access.
- Dump processing follows table dependency order.
- A rebuild never treats a guessed rename or conversion as accepted migration intent.
- Removing a fragment does not by itself authorize destruction of its durable data.
