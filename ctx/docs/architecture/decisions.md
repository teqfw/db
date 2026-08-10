# Architecture Decisions

- Path: `ctx/docs/architecture/decisions.md`
- Changed: `20260808`

## AD-001 Preserve Legacy Line On Branch v1

Decision: branch `v1` preserves the pre-2.x package at commit `7ce852cd18ea7da8cc3aa2c0d28db9ced9ac7c71`.

Reason: legacy consumers need a stable maintenance line while `main` adopts incompatible runtime composition.

## AD-002 Adopt Source-Attached DI 2.x Contracts

Decision: constructor dependencies use local semantic names and export-scoped `__deps__` metadata.
Named export selection uses the DI 2.x `__Export` syntax.

Rejected: retaining dependency tokens as destructured constructor property names.

Reason: constructor-key parsing belongs to the legacy container and is absent from DI 2.x.

## AD-003 Keep Logical And Physical Models Separate

Decision: DEM/map DTOs remain independent of Knex; conversion produces separate RDB descriptors.

Reason: declarations must remain portable and composable before a connection exists.

## AD-004 Own Rebuild, Not Full Incremental Migration

Decision: `@teqfw/db` owns complete target-structure recreation and bounded data preservation/transfer primitives.
It does not own arbitrary catalog diff, inferred `ALTER` planning, application version history, or deployment cutover.

Reason: relational execution is shared infrastructure, while transition meaning and release policy belong to model owners and the host application.

## AD-005 Treat The DEM As Target State

Decision: DEM fragments and the application map describe the selected target model only.
They do not encode an ordered history of renames or data conversions.

Reason: independent fragments can compose deterministically as desired state, but a desired-state comparison cannot recover semantic intent safely.

## AD-006 Require Explicit Preservation And Evidence

Decision: destructive in-place rebuild requires a durable snapshot or explicit authorization to discard data.
A rebuild produces transfer evidence but does not authorize application cutover or source retirement.

Reason: execution success and operational acceptance are different authority decisions.

## AD-007 Keep Incompatible Transformations External

Decision: transformation behavior may be executed through an explicit contract, but its meaning is supplied by the owning teq-plugin or an external migration orchestrator.

Reason: the persistence package can execute data movement but cannot determine whether a rename, split, merge, or conversion preserves application meaning.

## AD-008 Compile Versioned Inputs Into One Canonical DEM

Decision: unversioned declarations remain DEM v1 compatibility input; explicit `version: 2` selects the new declaration contract.
Both decode into one canonical model before composition, validation, dialect projection, schema planning, or queries.

Rejected: evolving the unversioned DTO in place or maintaining independent v1 and v2 execution pipelines.

Reason: one canonical source of truth preserves compatibility while preventing two validation and execution semantics from drifting.

## AD-009 Enforce Single Ownership And Provenance

Decision: schema-aware composition permits disjoint child union and explicit capability-set union, but each semantic entity, attribute, relation, index, storage binding, default, and generation declaration has one fragment owner.
Trusted source provenance accompanies every canonical node and conflict diagnostic.

Rejected: generic deep merge with scalar overwrite and array concatenation, including last-writer-wins behavior.

Reason: deterministic ordering cannot repair ambiguous authority; provenance and aggregated conflicts are required for distributed model maintenance.

## AD-010 Separate Logical Meaning From Dialect Realization

Decision: logical type, physical storage, default value, and generation policy are separate contracts.
Core and provider registries validate identities and parameters; an explicit selected dialect adapter produces physical descriptors and derived capabilities.

Rejected: expanding a global string enum whose values are invoked as Knex methods.

Reason: PostgreSQL and extension types require physical parameters and capabilities that are neither one logical type nor uniformly supported by other databases.

## AD-011 Make Indexes And Their Lifecycle First-Class

Decision: an index explicitly models kind, method, ordered attribute/expression keys, operator classes, included columns, predicate, validated options, and build phase.
Schema and rebuild plans separate table constraints, relations, data, and late indexes.

Rejected: reducing every index to type plus column names or always building indexes inside table creation.

Reason: provider indexes such as HNSW and IVFFlat have distinct compatibility, tuning, and data-loading behavior.

## AD-012 Use Typed Registered Query Expressions

Decision: Selection v2 uses attribute, bound-value, and registered-call expression nodes.
Core and dialect operator registries define type signatures, contexts, capabilities, and safe compilation; the legacy selection enum decodes to core calls.

Rejected: raw SQL expression nodes and indefinite growth of one closed comparison enum.

Reason: provider operations such as nearest-neighbour distance must remain schema-checked, capability-aware, and parameter-bound through the common API.

## AD-013 Treat Cycles According To Operation Semantics

Decision: compilation records strongly connected relation components.
Separated schema phases support relation cycles, while cyclic transfer requires a named adapter-supported strategy and otherwise fails before data access.

Rejected: log-only cycle detection and globally rejecting every cyclic relation model.

Reason: schema construction and data transfer have different enforcement mechanics; one generic order cannot safely represent both.

## AD-014 Keep PostgreSQL And pgvector Behind One Adapter Boundary

Decision: PostgreSQL physical types, provider indexes, vector operators, and extension preflight are implemented in a PostgreSQL adapter branch inside `@teqfw/db` while it shares the package release and connection lifecycle.
The adapter reports missing pgvector capability but does not install it implicitly.

Rejected: treating `vector` as one additional core enum value or embedding PostgreSQL conditionals throughout generic conversion and query modules.

Reason: storage family, dimension, metric, operator class, method, options, query operators, and runtime extension availability must be validated together.

## AD-015 Use Shared cfg With Host-Owned Named Connections

Decision: `@teqfw/db` reads default and named connection settings from the single `TEQFW_DB` namespace supplied by
`@teqfw/cfg`. Common connection fields use scalar parameters. A per-connection `EXTRA` object carries uncommon Knex
or driver-specific options. The package owns the default `TeqFw_Db_Back_RDb_Connect$`; additional connection tokens,
initialization, and shutdown belong to the host application and use independent transient connector instances.

Rejected: implicit reads from `process.env` or JSON files, separate cfg namespaces per connection, JSON objects for
ordinary credentials, production use of test-only Container registration, and unrestricted runtime Container lookup.

Reason: one package-owned cfg namespace keeps ownership explicit, scalar values remain operationally convenient,
and host-owned DI tokens make every additional connection and its lifecycle visible in composition.

## Deferred CLI Hosting Decision

Status: deferred; it is not part of the accepted rebuild architecture.

The existing proposal assigns argument parsing, help, exit codes, signals, process lifecycle, and cleanup to `@teqfw/cli`, while feature packages contribute parser-neutral command descriptors.
Any future adoption must preserve the rule that commands do not own process termination or use the DI container as a service locator.

## Pending Human Review

Approve package ownership, provider metadata shape, result/error semantics, and host-managed cleanup before replacing the local DB command DTOs and shutdown adapter.
This decision is independent of whether rebuild is invoked through CLI, API, or another host.
