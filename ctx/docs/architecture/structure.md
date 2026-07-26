# Architecture Structure

- Path: `ctx/docs/architecture/structure.md`
- Changed: `20260726`

## Declaration Block

DEM DTOs represent packages, entities, attributes, options, indexes, relations, and references.
Map DTOs represent table namespace and external-reference remapping.
RDB DTOs represent physical tables, columns, indexes, and relations.
Shared selection DTOs represent filters and ordering.

## Composition Block

The scanner locates declaration files in the application and packages.
Loaders parse JSON into DTOs.
Normalization merges fragments and resolves mapped references.
Ordering performs dependency traversal for safe downstream processing.

## Schema Block

Conversion maps DEM types and relations to RDB descriptors.
The builder translates those descriptors to Knex schema calls.
The schema service coordinates foreign-key and table creation/drop phases.

## Access Block

The connection owns the Knex client and creates transactions.
Transactions expose engine predicates, query/schema builders, table-name resolution, and commit/rollback.
The legacy CRUD engine provides positional APIs.
The application CRUD service and repository contract provide parameter-object APIs.
The selection model populates safe Knex clauses through a query-builder mapping contract.

## Operations Block

Structure actions load the model and supervise schema work.
Export/import transfer table rows and PostgreSQL sequences.
Lifecycle actions connect and disconnect.
CLI modules expose command descriptors while leaving process hosting outside the persistence core.
