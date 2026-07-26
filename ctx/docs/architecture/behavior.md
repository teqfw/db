# Architecture Behavior

- Path: `ctx/docs/architecture/behavior.md`
- Changed: `20260726`

## Model Composition

The scanner loads the root declaration and installed-package declarations.
Missing declaration or map files produce empty DTOs.
Normalization merges fragments under package paths, applies explicit external-reference mappings, and produces a schema configuration containing namespace and deprecated entities.

## Schema Lifecycle

Entities are ordered by relation dependencies.
Drop removes relations before tables and reverses dependency order where necessary.
Create builds tables before adding relations.
Deprecated tables participate in explicit pre-drop ordering.

## Transactional CRUD

When a caller supplies a transaction, the operation uses it and returns without finalizing it.
Without one, the wrapper starts a transaction, commits on success, rolls back on failure, calls the applicable callback, and rethrows failures.

## Selection

Selection parsing maps only columns approved by the schema/query-builder contract.
It applies nested conditions, comparison functions, sorting, row limit, and row offset to Knex queries.

## Data Transfer

Export reads tables in dependency order, normalizes date-only items, captures PostgreSQL sequences, commits, and writes JSON.
Import reads JSON, applies engine-specific row transformations, inserts in dependency order, restores sequences, and commits.

## Failure And Recovery

Schema and data operations roll back their owned transactions on failure.
Missing or malformed JSON outside the documented empty-file cases fails at parsing or DTO conversion.
The caller remains responsible for retry policy and for deciding whether destructive operations may be repeated.
