# Product Domain Model

- Path: `ctx/docs/product/domain.md`
- Changed: `20260904`

## Domain Areas

### Model Declaration

A Data Entity Model (DEM) is a distributed declarative description of an application data schema. A teq-plugin is an npm package with a teqfw node in `package.json`. It owns a DEM fragment describing packages, entities, attributes, relations, and unresolved external references.
The host application selects its own and installed plugin fragments, then owns the map that binds cross-package references to actual entity paths and optionally remaps attribute names.
DEM declarations and application maps use the explicit v2 contract (`version: 2`).

### Model Composition

Compilation produces one normalized application schema from independently owned fragments; declaration details and database-specific projection are defined by the architecture. The compiler only processes the selected fragments and application map: it does not add entities or any other semantic nodes after composition.
Semantic nodes have one owner, structural package containers may compose disjoint children, and generic deep merge is not part of the model.
Trusted fragment provenance is retained separately from logical content.
The target DEM is the desired state of the assembled application schema, not an ordered migration history and not a description of arbitrary physical database drift.

Compilation validates the complete logical model and aggregates diagnostics before returning a usable application schema.

### Database Targets

An application assigns one or more complete target DEMs to explicit database targets. A target is a physical database or an independently addressable namespace in one. It has a physical scope and an access mode. Full scope has no table-name prefix and describes the complete schema area entrusted to the application. Partial scope has a prefix and describes all modeled objects inside that prefix; objects outside it are not part of the target model.

`read` verifies its target DEM against the actual assigned area but never changes it. `write` verifies the area and may change it through an authorized, application-owned migration. No DEM relation crosses target boundaries. The physical structure in each target is a consequence of its target DEM and is selected by the host application through the database adapter.
Logical meaning remains distinct from physical storage and value generation. Identity and reference declarations express addressing intent; the host application supplies their representation policy.

### Query And Data Access

A data-access schema describes the entities, attributes, keys, and relations of the assembled application schema.
Access operations use that schema to create, read, update, delete, and select records without inventing relationships outside the declared model.

### Data Transfer

A database dump contains transferable application data. Export and import preserve the modeled data needed by the rebuild capability.

### Rebuild Migration

A rebuild migration replaces one physical realization of the application model with another.
It preserves data through an explicit snapshot or through a source-to-target copy, rather than by mutating every existing object in place.
The core package can move structurally compatible data and invoke explicitly supplied transformation behavior; it cannot infer the business meaning of incompatible changes.

### Effective DEM History

Each write target retains an immutable applied-state history. `@teqfw/db` supplies the ordinary DEM fragment `teqfw.db.schema`; its `snapshot` entity owns an immutable target-effective-DEM snapshot identified locally by `id` and globally comparable by a logical content fingerprint, and its `application` entity owns the application history records.
Each snapshot retains the canonical dialect-independent model and trusted provenance with package identifiers and immutable content revisions.
An append-only schema-application record links the last known applied source snapshot to a requested target snapshot and moves only from `started` to terminal `applied` or `failed`. Only an `applied` record establishes the last logical model accepted for that write target. Read targets retain no such history.

## Core Entities

- DEM fragment — one package-owned model declaration.
- Data Entity Model (DEM) — the distributed declarative model of one target application data schema.
- `teqfw.db.schema` — the DEM fragment supplied by `@teqfw/db`; it declares the `snapshot` and `application` entities used for schema history.
- teq-plugin — an npm package with a teqfw node in `package.json` that contributes a DEM fragment.
- Application schema — the coherent effective schema assembled by a host application from its own and selected teq-plugin fragments.
- database target — a physical database or independently addressable namespace assigned a target DEM, scope, and access mode by one application.
- target DEM — the complete selected part of an application's effective DEM assigned to one database target.
- Canonical DEM — the decoded, composed, resolved, and logically validated model of the application schema.
- Compilation result — immutable canonical DEM plus provenance, validation outcome, and the information needed to realize the application schema.
- Provenance — trusted fragment source records attached to canonical paths and diagnostics.
- Map — application-owned external-reference and physical namespace mapping.
- Entity — a logical persistent record type.
- Attribute — a logical typed entity value with separate storage, default, and generation contracts.
- Relation — a foreign-key relation between entity attributes.
- Diagnostic — structured error or warning connected to a model location and its fragment provenance.
- effective-DEM snapshot — an immutable, deduplicated canonical logical model retained in the target database.
- schema application — an append-only record of one request to make a snapshot the applied database state.

## Ownership Principles

Packages own their fragments.
The host application owns fragment selection, target assignment, target scope and access declarations, cross-package reference mapping, identity representation policy, database configuration, and the decision to recreate or transfer database state.
The core compiler owns canonicalization, validation, provenance, and diagnostics.
Package developers own the semantics of incompatible changes to data declared by their packages.
The host application owns transition semantics, migration policy, cutover, and final authorization. `@teqfw/db` standardizes startup verification, records target evidence, and invokes an authorized application migration script; it does not choose the script's business strategy.

## Domain Invariants

- Entity paths are logical and independent of physical names.
- A semantic entity, attribute, relation, or index has one fragment owner.
- Every canonical semantic node has provenance.
- Every entity in a target RDB schema originates in one selected DEM fragment; the compiler never injects a semantic node.
- Every target DEM is complete for its declared physical scope; all modeled objects in a partial target use its prefix.
- A target is read-only or writable by explicit declaration, not by an inferred connection capability.
- Every application target is compatible before normal application work begins.
- A relation and its endpoints belong to one database target.
- Relation endpoints and attributes exist and are compatible.
- A canonical model contains no unresolved external reference required by a relation.
- Unsupported model requirements fail before execution.
- A rebuild never treats a guessed rename or conversion as accepted migration intent.
- Removing a fragment does not by itself authorize destruction of its durable data.
- Completed snapshots and schema applications are never rewritten; recovery and retry create another application record.
