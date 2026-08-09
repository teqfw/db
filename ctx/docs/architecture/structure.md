# Architecture Structure

- Path: `ctx/docs/architecture/structure.md`
- Changed: `20260809`

## Declaration Block

DEM v1 DTOs represent compatibility input.
DEM v2 declaration values represent packages, entities, logical attributes, dialect storage, defaults, generation, full indexes, relations, capabilities, and references.
Map DTOs represent table namespace and external-reference remapping.
Compilation-result DTOs represent canonical model, provenance, diagnostics, dependency graph, requirements, fingerprint, and physical plan.
Physical DTOs represent tables, logical/physical columns, constraints, complete indexes, and relations.
Selection v2 DTOs represent typed expressions, projections, filters, ordering, pagination, and allow-listed execution options.

## Composition Block

The scanner locates declaration files and creates trusted immutable source envelopes.
The decoder translates DEM v1 or v2 into canonical input values.
Schema-aware composition enforces one owner per semantic node and resolves mapped references while retaining provenance.
Logical validation checks declarations and builds a graph with strongly connected components.

The compilation result is immutable desired-state input to later blocks.
Compilation does not inspect a live database, infer transitions from an earlier DEM, or select a winner for conflicting owners.

## Schema Block

The selected dialect adapter resolves logical types, defaults, generation, indexes, relations, and expressions into physical descriptors and derived capabilities.
Runtime preflight checks those capabilities on the actual connection.
The schema planner separates tables/key constraints, relations, data, and late indexes.
Builders execute only resolved descriptors through adapter allow-lists and parameter bindings.

## Query Block

The expression registry defines core and provider operators with arity, input/output types, allowed contexts, capabilities, and compiler identity.
The query compiler resolves schema attributes, validates values and dimensions, and compiles identifiers and values through Knex.
The legacy selection decoder maps the closed comparison contract into core expression nodes.

## Access Block

The connection owns the Knex client and creates transactions.
Transactions expose engine predicates, query/schema builders, table-name resolution, and commit/rollback.
The legacy CRUD engine provides positional APIs.
The application CRUD service and repository contract provide parameter-object APIs.
The selection model populates safe Knex clauses through the typed expression and query-builder mapping contracts.

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

The current operation layer exposes compiler-backed schema actions and one unified rebuild facade over explicit planning, transfer, transformation, transaction, and evidence roles.
External deployment orchestration and cutover remain outside the package.
