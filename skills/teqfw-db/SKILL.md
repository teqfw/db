---
name: teqfw-db
description: Use this skill when integrating, configuring, using, testing, reviewing, or modifying JavaScript modules that consume @teqfw/db for distributed DEM composition, dialect-aware relational access, transaction-aware CRUD, typed selections, schema lifecycle, or rebuild-oriented data transfer.
---

# @teqfw/db

Use this skill for consumer code that composes or depends on the installed `@teqfw/db` package. Treat the host project's instructions, architecture, data policy, and tests as authoritative.

## Apply

1. Compose the package through the published `TeqFw_Db_` DI namespace; do not import `@teqfw/db/src/**` as a public API.
2. Load `@teqfw/cfg` Sources before resolving database runtime components, initialize each connection explicitly, and let the host own connection lifecycle and driver installation.
3. Compile and assert all trusted DEM fragments and the application map with one selected dialect adapter. Derive the operation plan or query requirements, then let its executor complete connection-specific preflight before database work.
4. Pass an outer transaction when several operations share one atomic boundary. Nested CRUD and transfer operations must never finalize caller-owned transactions.
5. Treat rebuild as target reconstruction plus explicit data preservation and evidence. Never infer renames, conversions, incremental migrations, acceptance, cutover, or source deletion.
6. Read the selected references before editing, verify exact tokens and callable shapes against the installed package version, and run the host project's checks.

## Select References

| Consumer task | Read |
| --- | --- |
| Understand package boundaries, authority, or stability | [Concepts](references/concepts.md) |
| Configure DI, connections, DEM compilation, CRUD, selections, or rebuild | [Usage](references/usage.md) |
| Verify current tokens, callable shapes, and exposure status | [Package API](references/package-api.md) |
| Mount or discover the installed skill | [Distribution](references/distribution.md) |
