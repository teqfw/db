# Architecture Integrations

- Path: `ctx/docs/architecture/integration.md`
- Changed: `20260813`

## @teqfw/di 2.x

The `TeqFw_Db_` namespace maps to `src/` with `.mjs` extension.
Each composed export declares dependencies in an export-scoped `__deps__` object.
Named exports use DI specifiers such as `TeqFw_Db_Back_Dto_Dem__Factory$`; as-is default exports use `__default`.
Applications configure namespace roots before the first container resolution.

The package manifest publishes `TeqFw_Db_` through the canonical `teqfw.fw.di.namespaces` schema.

## Knex

Knex is the database abstraction and query/schema builder.
The connection receives a Knex-compatible configuration.
Driver-specific packages remain consumer/runtime dependencies according to the selected client.

Knex is an execution boundary, not a guarantee that all structure operations are transactional or equally supported across engines.
Rebuild implementation must expose engine limitations instead of claiming atomic rollback where the driver cannot provide it.
Knex generic and `specificType` builders are mechanisms behind adapters; their availability does not make an arbitrary declaration type supported.

## Dialect Adapters

The connection client selects exactly one registered adapter through explicit DI/call contracts.
The adapter contributes logical/storage mappings, default and generation behavior, full index validation/execution, expression operators, capability derivation, and read-only runtime preflight.
The core compiler never treats database names, type strings, index methods, operator classes, or query operators as unchecked Knex methods or SQL.

The PostgreSQL adapter owns PostgreSQL core behavior and the optional pgvector registry branch.
Other database clients retain existing behavior through their own validated adapter entries; Knex connectivity alone is not a support claim.

## Filesystem

The package reads package model declarations and the root application map from `etc/`.
Connection configuration comes from the explicitly bootstrapped `@teqfw/cfg` snapshot; dump filenames remain
explicit operational inputs.
Export writes a JSON dump; import reads the same logical structure.
A durable dump used for in-place rebuild must be stored outside the physical objects that will be dropped.

## Logging And Configuration

The 2.x composition must not depend on constructor-key injection or the legacy core replacement table.
Logging and application configuration are explicit dependency contracts or call parameters. The host registers
the `@teqfw/cfg` namespace from package metadata, selects ordered Sources, and completes the one-shot load before
database runtime starts. `TeqFw_Db_Back_Config$` depends on `TeqFw_Cfg_Reader$`, reads `TEQFW_DB`, converts the raw
fragment to the package-owned Knex shape, and freezes it. Source selection, precedence, and loading remain host
composition responsibilities.

The package owns one default connection token, `TeqFw_Db_Back_RDb_Connect$`. Named connections are host-owned DI
composition: an application provider receives a separate transient `TeqFw_Db_Back_RDb_Connect$$`, publishes it
under an application token, and a host lifecycle component initializes and disconnects it. Every connection stays
in the `TEQFW_DB` cfg namespace; named parameter keys use `<NAME>_` after the `__` separator. Configuration lookup
never resolves or registers a runtime dependency. This keeps connection selection explicit and avoids unrestricted
Container access inside persistence components.

## Migration Orchestration Boundary

The current db package exposes source, target, transformation, and evidence primitives for rebuild.
The host application or a future migration plugin may use them to coordinate version history, transition ordering, application quiescence, cutover, and rollback policy. Whether that coordinator belongs to this db plugin or a separate plugin is undecided.
Teq-plugins may contribute transformations for data they own; contribution discovery and ordering belong to the external migration contract, not to implicit scanning by the persistence core.

## Rebuild Contract Shapes

The architecture requires the following conceptual contracts without prescribing source tokens before implementation:

- rebuild request — identifies the target model or its deterministic description, the explicit source, the explicit target, the preservation decision, and any selected transformation;
- source provider — reads modeled source rows and engine state from a live connection or durable dump without mutating the source;
- target provider — exposes the independently identified destination and its structure/data transaction capabilities;
- transformation adapter — identifies itself and maps explicit source data to one target table or engine-state representation;
- rebuild evidence — records target description, processed tables, source and target row counts, applied transformations, failures, and transaction outcomes.

A target description must be sufficient to distinguish the selected namespace and modeled table set from another rebuild target.
An implementation may use a deterministic fingerprint, but the architecture does not mandate its encoding.
Required transfer failure produces a failed rebuild result.
The result contains evidence for caller evaluation and contains no implicit cutover or source-deletion command.

## Boundary Rules

- New external runtime dependencies require documentation and Human review.
- DI metadata must name logical tokens, never relative source paths.
- Database-driver behavior remains behind Knex and engine predicates.
- Adapter selection is explicit and must agree with the actual connection client.
- Capability preflight is read-only; provisioning is separately authorized.
- Declaration and query values are bound, and no raw SQL node crosses the DEM/selection boundary.
- Source and target identities remain explicit; a rebuild handler must not discover an arbitrary production database on its own.
- Transformation dependencies are selected through DI or call contracts and never by unrestricted container lookup inside transfer logic.
