# Architecture Integrations

- Path: `ctx/docs/architecture/integration.md`
- Changed: `20260808`

## @teqfw/di 2.x

The `TeqFw_Db_` namespace maps to `src/` with `.mjs` extension.
Each composed export declares dependencies in an export-scoped `__deps__` object.
Named exports use DI specifiers such as `TeqFw_Db_Back_Dto_Dem__Factory$`; as-is default exports use `__default`.
Applications configure namespace roots before the first container resolution.

The current package manifest publishes the legacy-compatible `teqfw.namespaces` form.
New metadata work must target the canonical `teqfw.fw.di.namespaces` schema when the package migration is authorized; documentation must not present the compatibility form as the preferred platform convention.

## Knex

Knex is the database abstraction and query/schema builder.
The connection receives a Knex-compatible configuration.
Driver-specific packages remain consumer/runtime dependencies according to the selected client.

Knex is an execution boundary, not a guarantee that all structure operations are transactional or equally supported across engines.
Rebuild implementation must expose engine limitations instead of claiming atomic rollback where the driver cannot provide it.

## Filesystem

The package reads package model declarations and the root application map from `etc/`.
Local connection configuration and dump filenames are explicit operational inputs.
Export writes a JSON dump; import reads the same logical structure.
A durable dump used for in-place rebuild must be stored outside the physical objects that will be dropped.

## Logging And Configuration

The 2.x composition must not depend on constructor-key injection or the legacy core replacement table.
Logging and application configuration are explicit dependency contracts or call parameters.

## External Migration Orchestrator

An optional external migrator integrates through explicit source, target, transformation, and evidence contracts.
It may use `@teqfw/db` structure and transfer primitives, but it owns version history, transition ordering, application quiescence, cutover, and rollback policy.
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
- Source and target identities remain explicit; a rebuild handler must not discover an arbitrary production database on its own.
- Transformation dependencies are selected through DI or call contracts and never by unrestricted container lookup inside transfer logic.
