# Concepts

## Package Role

`@teqfw/db` composes distributed Domain Entity Model (DEM) fragments into one validated target model, projects that model through an explicit relational dialect, and supplies schema, transaction, CRUD, query, and rebuild primitives.

Knex is the database execution boundary. `@teqfw/di` performs runtime linking, and `@teqfw/cfg` supplies an immutable configuration snapshot. Database client packages remain host-selected runtime dependencies.

## Model And Provenance

Each application or package owns its DEM fragment. Compilation decodes supported declaration versions, applies the application map, rejects conflicting semantic ownership, preserves trusted source provenance, validates the logical model, analyzes dependency cycles, derives dialect requirements, and produces a deterministic physical plan and fingerprint.

Compilation is all-or-nothing. Do not execute a partial model after diagnostics. Treat unversioned declarations as legacy DEM v1 input and explicit version `2` as DEM v2; do not extend unversioned semantics.

## Relational Access

The selected connection determines one dialect adapter. Logical types, physical storage, defaults, generation, indexes, expressions, and runtime capabilities stay separate. Capability preflight must finish before dependent schema or query mutations.

CRUD accepts only schema-declared attributes and supports simple or composite keys. Creation normalizes input through `schema.createDto()`, while keys, legacy conditions, and updates reject unknown attributes. Operations can use either an owned or caller-provided transaction. Selection v2 uses schema-approved attributes and registered typed operators with bound values; raw SQL strings are not declaration or selection operators.

## Rebuild Boundary

A rebuild creates a complete target from the canonical DEM and transfers compatible data in dependency order. In-place rebuild requires a verified readable snapshot unless the caller explicitly authorizes data discard. Parallel rebuild keeps source and target identities distinct.

Transformations must be explicit. Evidence reports processed tables, row counts, transformations, late indexes, failures, and transaction outcome, but never authorizes acceptance or cutover. Catalog diffing, inferred renames, arbitrary `ALTER` planning, migration history, rollback policy, and deployment switching stay outside this package.

## Contract Authority

The host project decides product meaning, composition, authorization, lifecycle, and tests. This skill describes the installed package version and does not define TeqFW platform policy.

Canonical `teqfw.fw.di.namespaces` metadata and `TeqFw_Db_` addressing are stable. An individual token is stable consumer API only when package documentation grants that status; resolvability or source-file existence alone is insufficient.
