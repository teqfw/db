# Architecture Behavior

- Path: `ctx/docs/architecture/behavior.md`
- Changed: `20260808`

## Model Composition

The scanner loads root and installed-package declarations into trusted source envelopes.
Missing optional declaration or map files retain their documented empty-input behavior.
The decoder expands parsed DEM v1 or v2 input, schema-aware composition rejects conflicting owners, reference mapping retains source/map provenance, and semantic validation aggregates independently detectable errors.
The selected adapter projects a successful canonical model and derives capabilities.
The result is the complete validated target state and physical plan for the selected package graph and dialect.

## Schema Lifecycle

Capability preflight occurs before mutation.
Create builds all tables and target key constraints before relations, so FK cycles do not require recursive weighting.
Data and late indexes execute in their declared phases.
Drop removes relations before tables and uses deterministic graph order where dependencies matter.
Deprecated tables participate in explicit pre-drop ordering.

Schema lifecycle alone does not preserve rows.
A caller selecting destructive recreation must separately select whether data is discarded, snapshotted, or transferred.

## Transactional CRUD

When a caller supplies a transaction, the operation uses it and returns without finalizing it.
Without one, the wrapper starts a transaction, commits on success, rolls back on failure, calls the applicable callback, and rethrows failures.

## Selection

Legacy selection parsing decodes comparison functions to core typed expressions.
Selection v2 maps only schema-approved attributes and registered expressions, validates logical types and adapter capabilities, binds values, and applies filters, derived projections, expression sorting, limit, and offset.
Nearest-neighbour ordering is a registered dialect expression rather than a raw query escape.

## Data Transfer

Export reads tables in dependency order, normalizes date-only items, captures PostgreSQL sequences, commits, and writes JSON.
Import reads JSON, applies engine-specific row transformations, inserts in dependency order, restores sequences, and commits.

## In-Place Rebuild

1. Compose and retain the target model identity.
2. Export the source data to a durable location while the source model can still enumerate it.
3. Verify that the snapshot is readable before destructive work begins.
4. Drop and recreate the selected physical structure in dependency-safe phases.
5. Import compatible data and apply only explicitly supplied transformations.
6. Build `afterData` indexes.
7. Produce transfer evidence and leave acceptance to the caller.

A failed import rolls back its owned transaction where the engine supports that boundary, but it does not reconstruct the previously dropped schema.
Recovery therefore depends on the preserved snapshot and caller-owned retry or rollback procedure.

## Parallel Rebuild

1. Keep the source readable and create a distinct target.
2. Build the complete target structure.
3. Read source tables and write target tables in dependency order.
4. Apply explicit transformations and collect evidence.
5. Build `afterData` indexes and verify them.
6. Leave both source retirement and application cutover to the external orchestrator.

Failure leaves the source authoritative and the incomplete target unaccepted.
The caller decides whether the target is cleaned, inspected, or retried.

## Incompatible Data

When a source row cannot be represented in the target by explicit structural mapping, transfer stops or records the item as failed according to the caller-selected policy.
The core package never guesses a rename, data conversion, or required default.
Transformation failures are migration failures, not silently skipped compatibility issues.

## Incremental Migration Boundary

The package does not compare catalog state with the target DEM to synthesize ordered `ALTER` operations.
Version discovery, multi-step migration history, online dual-write protocols, application cutover, and cross-release rollback belong to an external migration capability.

## Failure And Recovery

Schema and data operations roll back their owned transactions on failure when the selected RDBMS makes the operation transactional.
Missing or malformed JSON outside the documented empty-file cases fails at parsing or DTO conversion.
Ownership conflicts, semantic errors, unsupported capabilities, and unplanned transfer cycles fail before operation side effects and carry structured provenance.
The caller remains responsible for retry policy, snapshot retention, acceptance, cutover, and deciding whether destructive operations may be repeated.
