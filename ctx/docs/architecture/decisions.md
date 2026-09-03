# Architecture Decisions

- Path: `ctx/docs/architecture/decisions.md`
- Changed: `20260813`

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

## AD-004 Provide Rebuild Primitives, Not Full Incremental Migration

Decision: the current `@teqfw/db` implementation provides complete target-structure recreation and bounded data preservation/transfer primitives.
It does not own arbitrary catalog diff, inferred `ALTER` planning, application version history, or deployment cutover.
The product-level owner of rebuild orchestration remains undecided: it may be the db plugin or a separate plugin.

Reason: relational execution is shared infrastructure, while transition meaning and release policy belong to model owners and the host application. The packaging boundary for higher-level orchestration requires further experience.

## AD-005 Treat The DEM As Target State

Decision: DEM fragments and the application map describe the selected target model only.
They do not encode an ordered history of renames or data conversions.

Reason: independent fragments can compose deterministically as desired state, but a desired-state comparison cannot recover semantic intent safely.

## AD-006 Require Explicit Preservation And Evidence

Decision: destructive in-place rebuild requires a durable snapshot or explicit authorization to discard data.
A rebuild produces transfer evidence but does not authorize application cutover or source retirement.

Reason: execution success and operational acceptance are different authority decisions.

## AD-007 Keep Incompatible Transformations External

Decision: transformation behavior may be executed through an explicit contract, but its meaning is supplied by the owning teq-plugin or by the host/future migration orchestration capability.

Reason: the persistence package can execute data movement but cannot determine whether a rename, split, merge, or conversion preserves application meaning.

## AD-008 Require Explicit DEM v2 Inputs

Decision: every declaration and application map explicitly declares `version: 2`; omitted and unsupported versions fail before composition.

Rejected: accepting unversioned input or retaining a v1 compatibility decoder in the evolving v2 line.

Reason: one explicit contract prevents dual validation and execution semantics from drifting. The retained `v1` branch remains the historical reference for consumers who need migration guidance.

## AD-009 Enforce Single Ownership And Provenance

Decision: schema-aware composition permits disjoint child union and explicit capability-set union, but each semantic entity, attribute, relation, index, storage binding, default, and generation declaration has one fragment owner.
Trusted source provenance accompanies every canonical node and conflict diagnostic.

Rejected: generic deep merge with scalar overwrite and array concatenation, including last-writer-wins behavior.

Reason: deterministic ordering cannot repair ambiguous authority; provenance and aggregated conflicts are required for distributed model maintenance.

## AD-010 Derive Every Target-Schema Entity From A DEM Fragment

Decision: every entity in a target RDB schema originates in a selected DEM fragment. `@teqfw/db` supplies the ordinary `teqfw.db.schema` fragment, which declares `snapshot` and `application` for schema history. The host application composes that fragment with all other selected fragments through the normal DEM pipeline.
The compiler owns no semantic entities and does not append declarations, create synthetic fragment envelopes, reserve a special namespace, or apply a special composition, mapping, projection, or transfer rule for platform-supplied fragments.

Rejected: compiler injection of package-owned history entities, a metadata schema outside the DEM, and special composition privileges or restrictions for platform fragments.

Reason: the distributed DEM is the single declarative source of truth for the complete target schema. Ordinary fragment provenance makes ownership visible and keeps all target tables subject to the same validation and projection rules.

## AD-011 Separate Logical Meaning From Dialect Realization

Decision: logical type, physical storage, default value, and generation policy are separate contracts.
Core and provider registries validate identities and parameters; an explicit selected dialect adapter produces physical descriptors and derived capabilities.

Rejected: expanding a global string enum whose values are invoked as Knex methods.

Reason: PostgreSQL and extension types require physical parameters and capabilities that are neither one logical type nor uniformly supported by other databases.

## AD-012 Make Indexes And Their Lifecycle First-Class

Decision: an index explicitly models kind, method, ordered attribute/expression keys, operator classes, included columns, predicate, validated options, and build phase.
Schema and rebuild plans separate table constraints, relations, data, and late indexes.

Rejected: reducing every index to type plus column names or always building indexes inside table creation.

Reason: provider indexes such as HNSW and IVFFlat have distinct compatibility, tuning, and data-loading behavior.

## AD-013 Use Typed Registered Query Expressions

Decision: Selection v2 uses attribute, bound-value, and registered-call expression nodes.
Core and dialect operator registries define type signatures, contexts, capabilities, and safe compilation.

Rejected: raw SQL expression nodes and indefinite growth of one closed comparison enum.

Reason: provider operations such as nearest-neighbour distance must remain schema-checked, capability-aware, and parameter-bound through the common API.

## AD-014 Treat Cycles According To Operation Semantics

Decision: compilation records strongly connected relation components.
Separated schema phases support relation cycles, while cyclic transfer requires a named adapter-supported strategy and otherwise fails before data access.

Rejected: log-only cycle detection and globally rejecting every cyclic relation model.

Reason: schema construction and data transfer have different enforcement mechanics; one generic order cannot safely represent both.

## AD-015 Keep PostgreSQL And pgvector Behind One Adapter Boundary

Decision: PostgreSQL physical types, provider indexes, vector operators, and extension preflight are implemented in a PostgreSQL adapter branch inside `@teqfw/db` while it shares the package release and connection lifecycle.
The adapter reports missing pgvector capability but does not install it implicitly.

Rejected: treating `vector` as one additional core enum value or embedding PostgreSQL conditionals throughout generic conversion and query modules.

Reason: storage family, dimension, metric, operator class, method, options, query operators, and runtime extension availability must be validated together.

## AD-016 Use Shared cfg With Host-Owned Named Connections

Decision: `@teqfw/db` reads default and named connection settings from the single `TEQFW_DB` namespace supplied by
`@teqfw/cfg`. Common connection fields use scalar parameters. A per-connection `EXTRA` object carries uncommon Knex
or driver-specific options. The package owns the default `TeqFw_Db_Back_RDb_Connect$`; additional connection tokens,
initialization, and shutdown belong to the host application and use independent transient connector instances.

Rejected: implicit reads from `process.env` or JSON files, separate cfg namespaces per connection, JSON objects for
ordinary credentials, production use of test-only Container registration, and unrestricted runtime Container lookup.

Reason: one package-owned cfg namespace keeps ownership explicit, scalar values remain operationally convenient,
and host-owned DI tokens make every additional connection and its lifecycle visible in composition.

## AD-017 Resolve Identity And Reference Types In The Host Target

Decision: `core.identity` and `core.ref` are special logical DEM types forming an inter-entity addressing protocol. A package uses `core.identity` when an entity attribute is system-addressable and `core.ref` when a local attribute stores the representation of exactly one relation-resolved `core.identity`; neither type chooses a SQL type or dialect mechanism.
`identityProfile` is the host-owned policy that defines how logical entity identities and their references are represented in one target application model. The current DEM v2 profile structure supplies a concrete type plus generation policy; its default is signed 32-bit `core.integer` plus `generation.kind: "core.identity"` with `byDefault` mode.
`core.identity` resolves through that profile into a concrete type and generation policy. `core.ref` derives only its concrete type from the one mapped `core.identity` target of its relation; the relation remains target authority, and external mapping only resolves package-external paths.
The compiler writes these results into the canonical DEM before normal relation and dialect validation. The current materialization of `core.identity` creates one generated single-column primary key. Ordinary relations between explicitly typed attributes remain a separate mechanism and may use compatible primary or unique targets.

Rejected: requiring independently reusable packages to coordinate concrete identifier storage conventions, making `ref` an alternative foreign-key declaration, allowing `core.ref` to target an arbitrary PRIMARY or UNIQUE attribute, or inferring a type from an undeclared or ambiguous relation.

Reason: packages own reusable entity and relation semantics, whereas the host owns the target database model and therefore identity representation policy. References derive their representation from their actual resolved targets, preserving compatibility across independently developed packages. Keeping the selected policy in the map makes host authority visible, preserves deterministic compilation, and leaves dialect-specific storage and generation differences below the logical DEM layer. Integer width and signedness are current examples of policy choices, not the purpose of the indirection.

## Deferred CLI Hosting Decision

Status: deferred; it is not part of the accepted rebuild architecture.

The existing proposal assigns argument parsing, help, exit codes, signals, process lifecycle, and cleanup to `@teqfw/cli`, while feature packages contribute parser-neutral command descriptors.
Any future adoption must preserve the rule that commands do not own process termination or use the DI container as a service locator.

## Pending Human Review

Approve package ownership, provider metadata shape, result/error semantics, and host-managed cleanup before replacing the local DB command DTOs and shutdown adapter.
This decision is independent of whether rebuild is invoked through CLI, API, or another host.
