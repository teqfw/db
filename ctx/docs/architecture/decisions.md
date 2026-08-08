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

## Deferred CLI Hosting Decision

Status: deferred; it is not part of the accepted rebuild architecture.

The existing proposal assigns argument parsing, help, exit codes, signals, process lifecycle, and cleanup to `@teqfw/cli`, while feature packages contribute parser-neutral command descriptors.
Any future adoption must preserve the rule that commands do not own process termination or use the DI container as a service locator.

## Pending Human Review

Approve package ownership, provider metadata shape, result/error semantics, and host-managed cleanup before replacing the local DB command DTOs and shutdown adapter.
This decision is independent of whether rebuild is invoked through CLI, API, or another host.
