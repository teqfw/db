# Architecture Behavior

- Path: `ctx/docs/architecture/behavior.md`
- Changed: `20260808`

## Model Composition

The scanner loads the root declaration and installed-package declarations.
Missing declaration or map files produce empty DTOs.
Normalization merges fragments under package paths, applies explicit external-reference mappings, and produces a schema configuration containing namespace and deprecated entities.
The result is the complete target state for the selected package graph.

## Schema Lifecycle

Entities are ordered by relation dependencies.
Drop removes relations before tables and reverses dependency order where necessary.
Create builds tables before adding relations.
Deprecated tables participate in explicit pre-drop ordering.

Schema lifecycle alone does not preserve rows.
A caller selecting destructive recreation must separately select whether data is discarded, snapshotted, or transferred.

## Transactional CRUD

When a caller supplies a transaction, the operation uses it and returns without finalizing it.
Without one, the wrapper starts a transaction, commits on success, rolls back on failure, calls the applicable callback, and rethrows failures.

## Selection

Selection parsing maps only columns approved by the schema/query-builder contract.
It applies nested conditions, comparison functions, sorting, row limit, and row offset to Knex queries.

## Data Transfer

Export reads tables in dependency order, normalizes date-only items, captures PostgreSQL sequences, commits, and writes JSON.
Import reads JSON, applies engine-specific row transformations, inserts in dependency order, restores sequences, and commits.

## In-Place Rebuild

1. Compose and retain the target model identity.
2. Export the source data to a durable location while the source model can still enumerate it.
3. Verify that the snapshot is readable before destructive work begins.
4. Drop and recreate the selected physical structure in dependency-safe phases.
5. Import compatible data and apply only explicitly supplied transformations.
6. Produce transfer evidence and leave acceptance to the caller.

A failed import rolls back its owned transaction where the engine supports that boundary, but it does not reconstruct the previously dropped schema.
Recovery therefore depends on the preserved snapshot and caller-owned retry or rollback procedure.

## Parallel Rebuild

1. Keep the source readable and create a distinct target.
2. Build the complete target structure.
3. Read source tables and write target tables in dependency order.
4. Apply explicit transformations and collect evidence.
5. Leave both source retirement and application cutover to the external orchestrator.

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
The caller remains responsible for retry policy, snapshot retention, acceptance, cutover, and deciding whether destructive operations may be repeated.
