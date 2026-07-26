# Architecture Decisions

- Path: `ctx/docs/architecture/decisions.md`
- Changed: `20260726`

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

## Pending Human Review

The exact 2.x public CLI host and application lifecycle integration are not defined by the available DI package.
The persistence operations remain preserved as resolvable modules, but any new cross-package CLI runner contract requires a separate approved integration design.
