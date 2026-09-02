# Concepts

## Package Role

`@teqfw/db` composes distributed Domain Entity Model (DEM) fragments into one validated target model, projects that model through an explicit relational dialect, and supplies schema, transaction, typed-query, and rebuild primitives.

Knex is the database execution boundary. `@teqfw/di` performs runtime linking, and `@teqfw/cfg` supplies an immutable configuration snapshot. Database client packages remain host-selected runtime dependencies.

## Model And Provenance

Each application or package owns its DEM fragment. Compilation decodes supported declaration versions, applies the application map, rejects conflicting semantic ownership, preserves trusted source provenance, validates the logical model, analyzes dependency cycles, derives dialect requirements, and produces a deterministic physical plan and fingerprint.

Compilation is all-or-nothing. Do not execute a partial model after diagnostics. Every declaration and application map must explicitly declare `version: 2`; omitted and unsupported versions are rejected.

## Effective DEM History

Every successful compilation includes package-owned `schema.snapshot` and `schema.application` service entities. `compilation.effective.fingerprint` identifies the canonical dialect-independent effective DEM; `compilation.fingerprint` remains the physical-plan identity and is not interchangeable with it.

The history service deduplicates immutable snapshots by the effective fingerprint and preserves canonical model provenance with content-derived source revisions. A schema application is append-only: `started` becomes either `applied` or `failed`, and a completed record is never rewritten. Only `applied` establishes the last applied snapshot.

Before marking an attempt applied, the service checks the active connection catalog against the supplied target compilation and returns explicit table/column diagnostics on mismatch. It does not derive DDL, transformations, cutover, or recovery actions.

## Relational Access

The selected connection determines one dialect adapter. Logical types, physical storage, defaults, generation, indexes, expressions, and runtime capabilities stay separate. Capability preflight must finish before dependent schema or query mutations.

Typed Selection v2 uses schema-approved attributes and registered operators with bound values; raw SQL strings are not declaration or selection operators. Schema and rebuild operations preserve explicit transaction ownership.

## Rebuild Boundary

A rebuild creates a complete target from the canonical DEM and transfers compatible data in dependency order. In-place rebuild requires a verified readable snapshot unless the caller explicitly authorizes data discard. Parallel rebuild keeps source and target identities distinct.

Transformations must be explicit. Evidence reports processed tables, row counts, transformations, late indexes, failures, and transaction outcome, but never authorizes acceptance or cutover. Catalog diffing, inferred renames, arbitrary `ALTER` planning, migration history, rollback policy, and deployment switching stay outside this package.

## Contract Authority

The host project decides product meaning, composition, authorization, lifecycle, and tests. This skill describes the installed package version and does not define TeqFW platform policy.

Canonical `teqfw.fw.di.namespaces` metadata and `TeqFw_Db_` addressing are stable. An individual token is stable consumer API only when package documentation grants that status; resolvability or source-file existence alone is insufficient.
