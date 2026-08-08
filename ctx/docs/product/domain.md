# Product Domain Model

- Path: `ctx/docs/product/domain.md`
- Changed: `20260808`

## Domain Areas

### Model Declaration

A package owns a DEM fragment describing nested packages, entities, attributes, indexes, relations, and unresolved external references.
The application owns the map that binds external references to actual entity paths and optionally remaps attribute names.

### Model Composition

Composition produces one normalized target DEM from independently owned fragments.
The target DEM is a desired-state model, not an ordered migration history and not a description of arbitrary physical database drift.

### Relational Structure

The normalized DEM is translated to tables, columns, indexes, and foreign keys.
An application-level namespace prefixes physical table names.
Deprecated entities identify obsolete tables and their required drop order.

### Data Access

A schema object describes one persistent entity through its logical path, attributes, primary key, and DTO factory.
Repositories and CRUD engines use that schema with a transaction to create, read, update, delete, count, filter, sort, and paginate records.

### Data Transfer

A database dump contains table rows and, where applicable, PostgreSQL sequence values.
Export and import use dependency order and normalize engine-specific date and sequence representations.

### Rebuild Migration

A rebuild migration replaces one physical realization of the application model with another.
It preserves data through an explicit snapshot or through a source-to-target copy, rather than by mutating every existing object in place.
The core package can move structurally compatible data and invoke explicitly supplied transformation behavior; it cannot infer the business meaning of incompatible changes.

## Core Entities

- DEM fragment — one package-owned model declaration.
- Normalized DEM — the application-wide resolved model.
- Map — application-owned external-reference and physical namespace mapping.
- Entity — a logical persistent record type.
- Attribute — a typed entity value.
- Relation — a foreign-key relation between entity attributes.
- Schema object — runtime data-access metadata for one entity.
- Selection — filtering, ordering, limit, and offset request.
- Transaction — the atomic database operation boundary.
- Dump — transferable database contents.
- Source structure — the physical structure from which data is preserved during a rebuild.
- Target structure — the newly created physical projection of the normalized target DEM.
- Rebuild migration — structure recreation plus explicit data preservation and restoration.
- Incremental migration — an ordered transition that changes an existing structure or its data in place without full recreation.

## Ownership Principles

Packages own their fragments.
The root application owns cross-package reference mapping, table namespace, connection configuration, and the decision to recreate or transfer database state.
Package developers own the semantics of incompatible changes to data declared by their packages.
The host application or an external migrator owns release sequencing, migration policy, cutover, and final authorization.

## Domain Invariants

- Entity paths are logical and independent of physical table prefixes.
- Relation attribute counts must match referenced attribute counts.
- Primary, unique, and ordinary indexes are explicit.
- A normalized model contains no unresolved external reference required by a relation.
- Dump processing follows table dependency order.
- A rebuild never treats a guessed rename or conversion as accepted migration intent.
- Removing a fragment does not by itself authorize destruction of its durable data.
