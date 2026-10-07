---
name: teqfw-db
description: Use this skill when integrating, configuring, using, testing, reviewing, or modifying JavaScript modules that consume @teqfw/db for distributed Data Entity Model (DEM) composition, effective-DEM history, dialect-aware relational access, typed selections, schema lifecycle, or rebuild-oriented data transfer.
---

# @teqfw/db

Use this skill for consumer code that composes or depends on the installed `@teqfw/db` package. Treat the host project's instructions, architecture, data policy, and tests as authoritative.

Choose logical roots from the domain model rather than copying npm package names or DI namespaces. Remove redundant namespace/entity repetition while preserving useful qualifiers, public terminology, and semantic ownership. Make path choices explicitly in declarations; audit collisions and plan compatibility updates before renaming an existing path. Read [DEM path naming](references/usage.md#dem-path-naming) before defining or changing paths.

## Apply

1. Compose the package through the published `TeqFw_Db_` DI namespace; do not import `@teqfw/db/src/**` as a public API.
2. Load `@teqfw/cfg` Sources before resolving database runtime components, initialize each connection explicitly, and let the host own connection lifecycle and driver installation.
3. Compile and assert all trusted DEM fragments and the application map with one selected dialect adapter. Derive the operation plan or query requirements, then let its executor complete connection-specific preflight before database work. For controlled schema changes, retain effective-DEM snapshots and mark an application applied only after catalog validation.
4. Omit application-map `namespace` by default for an exclusively owned database/table space. Select a physical prefix for independent applications sharing that space or another explicit host deployment requirement; composing multiple package fragments does not justify one. Keep fragment logical roots separate, configure every resolver from `compilation.physical.namespace` even when empty, and plan migration/rebuild before changing existing table names. Read [Usage](references/usage.md#application-map-prefix-selection) for selection and migration details.
5. Pass an outer transaction when several operations share one atomic boundary. Nested operations must never finalize caller-owned transactions.
6. Treat rebuild as target reconstruction plus explicit data preservation and evidence. Never infer renames, conversions, incremental migrations, acceptance, cutover, or source deletion.
7. Read the selected references before editing, verify exact tokens and callable shapes against the installed package version, and run the host project's checks.

## Select References

| Consumer task | Read |
| --- | --- |
| Understand package boundaries, authority, or stability | [Concepts](references/concepts.md) |
| Configure DI, connections, DEM compilation, selections, schema, or rebuild | [Usage](references/usage.md) |
| Verify current tokens, callable shapes, and exposure status | [Package API](references/package-api.md) |
| Mount or discover the installed skill | [Distribution](references/distribution.md) |
