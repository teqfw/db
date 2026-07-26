# Architecture Integrations

- Path: `ctx/docs/architecture/integration.md`
- Changed: `20260726`

## @teqfw/di 2.x

The `TeqFw_Db_` namespace maps to `src/` with `.mjs` extension.
Each composed export declares dependencies in an export-scoped `__deps__` object.
Named exports use DI specifiers such as `TeqFw_Db_Back_Dto_Dem__Factory$`; as-is default exports use `__default`.
Applications configure namespace roots before the first container resolution.

## Knex

Knex is the database abstraction and query/schema builder.
The connection receives a Knex-compatible configuration.
Driver-specific packages remain consumer/runtime dependencies according to the selected client.

## Filesystem

The package reads package model declarations and the root application map from `etc/`.
Local connection configuration and dump filenames are explicit operational inputs.
Export writes a JSON dump; import reads the same logical structure.

## Logging And Configuration

The 2.x composition must not depend on constructor-key injection or the legacy core replacement table.
Logging and application configuration are explicit dependency contracts or call parameters.

## Boundary Rules

- New external runtime dependencies require documentation and Human review.
- DI metadata must name logical tokens, never relative source paths.
- Database-driver behavior remains behind Knex and engine predicates.
