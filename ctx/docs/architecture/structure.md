# Architecture Structure

- Path: `ctx/docs/architecture/structure.md`
- Changed: `20260808`

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

The composition result is immutable desired-state input to later blocks.
Composition does not inspect a live database or infer transitions from an earlier DEM.

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

## Rebuild Block

The rebuild block is a target architecture composed from bounded roles rather than one implicit migration service:

- source provider — exposes a durable dump or readable source structure;
- target provider — exposes an empty or explicitly replaceable destination;
- target builder — creates the complete target structure from normalized RDB descriptors;
- transfer engine — processes modeled tables in dependency order;
- transformation adapter — performs only explicitly selected source-to-target conversions;
- evidence collector — records processed tables, row counts, failures, transformation identities, and transaction outcomes.

The same connection may serve as source and target only for an authorized in-place rebuild after source data has been preserved outside the objects being replaced.
A parallel rebuild uses distinct source and target connections or independently addressable namespaces.

## External Migration Boundary

An external migrator or host composition root chooses source and target providers, supplies transformations, orders application versions, authorizes destructive steps, evaluates evidence, and performs cutover.
These decisions are injected through explicit contracts; the rebuild block does not resolve the DI container dynamically as a service locator.

## Operations Block

Structure actions load the target model and supervise schema work.
Export/import preserve and restore table rows and PostgreSQL sequences.
Lifecycle actions connect and disconnect.
CLI modules expose command descriptors while leaving process hosting outside the persistence core.

Current operation modules implement parts of the rebuild block separately.
They are not yet a complete implementation of the target rebuild workflow.
