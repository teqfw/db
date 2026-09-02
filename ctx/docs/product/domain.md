# Product Domain Model

- Path: `ctx/docs/product/domain.md`
- Changed: `20260813`

## Domain Areas

### Model Declaration

A teq-plugin is an npm package with a teqfw node in `package.json`. It owns a DEM fragment describing packages, entities, attributes, relations, and unresolved external references.
The host application selects its own and installed plugin fragments, then owns the map that binds cross-package references to actual entity paths and optionally remaps attribute names.
DEM declarations and application maps use the explicit v2 contract (`version: 2`).

### Model Composition

Compilation produces one normalized application schema from independently owned fragments; declaration details and database-specific projection are defined by the architecture.
Semantic nodes have one owner, structural package containers may compose disjoint children, and generic deep merge is not part of the model.
Trusted fragment provenance is retained separately from logical content.
The target DEM is the desired state of the assembled application schema, not an ordered migration history and not a description of arbitrary physical database drift.

Compilation validates the complete logical model and aggregates diagnostics before returning a usable application schema.

### Database Realization

The current implementation realizes the assembled logical schema in one selected database. Several explicitly selected databases remain a possible future realization and must not be assumed by current access or rebuild contracts.
The physical structure is a consequence of the logical schema and is selected by the host application through the database adapter.
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

The package owns an immutable effective-DEM snapshot identified locally by `id` and globally comparable by a logical content fingerprint.
Each snapshot retains the canonical dialect-independent model and trusted provenance with package identifiers and immutable content revisions.
An append-only schema-application record links the last known applied source snapshot to a requested target snapshot and moves only from `started` to terminal `applied` or `failed`.
Only an `applied` record establishes the database's last applied logical model.

## Core Entities

- DEM fragment — one package-owned model declaration.
- teq-plugin — an npm package with a teqfw node in `package.json` that contributes a DEM fragment.
- Application schema — the coherent target schema assembled by the host application from its own and selected plugin fragments.
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
The host application owns fragment selection, cross-package reference mapping, identity representation policy, database configuration, and the decision to recreate or transfer database state.
The core compiler owns canonicalization, validation, provenance, and diagnostics.
Package developers own the semantics of incompatible changes to data declared by their packages.
The host application owns release sequencing, migration policy, cutover, and final authorization unless a future migration plugin takes over an explicitly defined part of that work.

## Domain Invariants

- Entity paths are logical and independent of physical names.
- A semantic entity, attribute, relation, or index has one fragment owner.
- Every canonical semantic node has provenance.
- Relation endpoints and attributes exist and are compatible.
- A canonical model contains no unresolved external reference required by a relation.
- Unsupported model requirements fail before execution.
- A rebuild never treats a guessed rename or conversion as accepted migration intent.
- Removing a fragment does not by itself authorize destruction of its durable data.
- Completed snapshots and schema applications are never rewritten; recovery and retry create another application record.
