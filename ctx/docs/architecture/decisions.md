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

## Proposed CLI Contract

Status: proposal for Human review; implementation is not authorized yet.

- A dedicated `@teqfw/cli` package owns argument parsing, help output, exit codes, signals, and process lifecycle.
- Feature packages publish explicit command-provider tokens through `teqfw.providers.cli` package metadata; the host loads every namespace root before resolving providers.
- A provider returns an immutable ordered list of descriptors and startup fails on duplicate command IDs.
- A descriptor contains a stable ID, path segments, descriptions, parser-neutral arguments/options, `execute(context)`, and optional `cleanup()`.
- The execution context contains parsed arguments, parsed options, and an `AbortSignal`; it never exposes the DI container as a service locator.
- The host validates input before execution, maps thrown operational errors to exit codes, owns `try/finally`, and invokes `cleanup()` exactly once. Commands never terminate the process or stop the application directly.

## Pending Human Review

Approve package ownership, provider metadata shape, result/error semantics, and host-managed cleanup before replacing the local DB command DTOs and shutdown adapter.
