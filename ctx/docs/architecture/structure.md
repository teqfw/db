# Architecture Structure

- Path: `ctx/docs/architecture/structure.md`
- Changed: `20260813`

## Declaration Block

Explicit DEM v2 DTOs are the only declaration input.
DEM v2 declaration values represent packages, entities, logical attributes, dialect storage, defaults, generation, full indexes, relations, capabilities, and references.
Map DTOs represent table namespace and external-reference remapping.
Compilation-result DTOs represent canonical model, provenance, diagnostics, dependency graph, requirements, fingerprint, and physical plan.
Physical DTOs represent tables, logical/physical columns, constraints, complete indexes, and relations.
Selection v2 DTOs represent typed expressions, projections, filters, ordering, pagination, and allow-listed execution options.

## Composition Block

The scanner locates declaration files and creates trusted immutable source envelopes.
The decoder validates and canonicalizes DEM v2 input values.
Schema-aware composition enforces one owner per semantic node and resolves mapped references while retaining provenance.
Logical validation checks declarations and builds a graph with strongly connected components.

The compilation result is immutable desired-state input to later blocks.
Compilation does not inspect a live database, infer transitions from an earlier DEM, or select a winner for conflicting owners.

`@teqfw/db` supplies the ordinary `teqfw.db.schema` fragment, which declares the `snapshot` and `application` entities. When selected by the host, the scanner discovers it and composition retains its normal provenance; the compiler does not add it or any other semantic node.
It preserves the existing physical-plan fingerprint for execution binding and derives a separate logical effective-DEM fingerprint from the canonical model only.

## Schema Block

The selected dialect adapter resolves logical types, defaults, generation, indexes, relations, and expressions into physical descriptors and derived capabilities.
Runtime preflight checks those capabilities on the actual connection.
The schema planner separates tables/key constraints, relations, data, and late indexes.
Builders execute only resolved descriptors through adapter allow-lists and parameter bindings.

## Query Block

The expression registry defines core and provider operators with arity, input/output types, allowed contexts, capabilities, and compiler identity.
The query compiler resolves schema attributes, validates values and dimensions, and compiles identifiers and values through Knex.
The selection component accepts typed Selection v2 expression nodes.

## Access Block

The connection owns the Knex client and creates transactions.
Transactions expose engine predicates, query/schema builders, table-name resolution, and commit/rollback.
Persistence workflows use compiled schemas, typed selections, and rebuild components; the package does not retain a legacy CRUD facade.
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

The host composition root or a future migration plugin may choose source and target providers, supply transformations, order application versions, authorize destructive steps, evaluate evidence, and perform cutover. The ownership of this orchestration is not yet decided.
These decisions are injected through explicit contracts; the rebuild block does not resolve the DI container dynamically as a service locator.

## Schema History Block

The history service records the logical effective model and provenance through the `snapshot` entity of `teqfw.db.schema`, deduplicated by its logical fingerprint.
It owns append-only application records and validates a claim of `applied` against the selected connection's projected tables and columns before making that record authoritative.
It never produces an ALTER plan, transformation, cutover decision, or rollback action from a mismatch.

## Operations Block

Structure actions load the target model and supervise schema work.
Export/import preserve and restore table rows and PostgreSQL sequences.
Lifecycle actions connect and disconnect.
CLI modules expose command descriptors while leaving process hosting outside the persistence core.

The current operation layer exposes compiler-backed schema actions and one unified rebuild facade over explicit planning, transfer, transformation, transaction, and evidence roles.
The current low-level rebuild primitives remain in the db package; product-level deployment orchestration and cutover ownership remain undecided.
