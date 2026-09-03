# AI Introduction

- Path: `ctx/docs/ai-intro.md`
- Changed: `20260903`

## Purpose

Orient agents to `@teqfw/db` before implementation work.

## Project Type

`@teqfw/db` is a pure JavaScript ESM infrastructure library for assembling and using distributed application schemas in TeqFW applications.

## Problem Space

The package compiles Data Entity Model (DEM) fragments distributed across teq-plugins into one validated application schema with provenance, projects that schema into the host application's selected database structure, and provides schema-bound access and rebuild-oriented data transfer. Every target-schema entity originates in a selected fragment; the compiler never adds a semantic entity after composition.

## Product Role

The package owns distributed schema compilation, dialect/capability-aware realization, schema-bound data access, and bounded recreate-and-transfer migration mechanisms.
Knex supplies database-driver abstraction.
`@teqfw/di` 2.x supplies token-based runtime composition.
Full incremental migration planning and application cutover remain external responsibilities.

## Primary Audience

TeqFW application developers, teq-plugin developers declaring persistent entities, operators rebuilding database state, possible future migration-plugin developers, and maintainers supervising database compatibility.

## Technology Base

Node.js ESM, JSDoc, Knex, versioned JSON schema declarations, dialect adapters, and the TeqFW namespace `TeqFw_Db_`.

JSDoc is the checked structural contract of this JavaScript package. Before changing an annotation, inspect the actual value flow and the matching aliases in `types.d.ts`. Prefer a primitive or bounded union, then a named `TeqFw_Db_*` alias for a known, reused, domain, or DEM-stage shape; use `object` only for a known opaque object and `unknown` only at a dynamic ingress followed by validation. Do not introduce `any` to make `tsc` or `teqfw-esm-validator` pass, and do not weaken an exact namespace alias to a generic placeholder. A validator limitation is handled with a named structural alias or a validator fix. Any unavoidable `any` must be smallest-scope, documented, allowlisted, and normalized immediately at the external boundary.

## Distinguishing Characteristics

- Application database structure is composed from reusable per-package declarations.
- Semantic node ownership conflicts and invalid cross-fragment contracts fail with aggregated source provenance.
- Logical types, physical storage, defaults, generation, capabilities, and index lifecycle are separate.
- Logical entity paths are separated from physical table names.
- Dependency graphs and explicit cycle strategies control structure and transfer planning.
- Typed expression registries extend the common query API without raw SQL declaration nodes.
- CRUD can join an existing transaction or manage its own transaction.
- Rebuild migration preserves data through an explicit snapshot or source-to-target transfer.
- Incompatible transformations, version history, and cutover are caller-owned.

## What This Project Is Not

It is not an ORM with identity maps or active records.
It does not own application-specific entities, authorization, or business rules.
It does not hide raw Knex access inside transactions.
It does not infer incremental migrations from catalog drift or target-model differences.
It does not orchestrate application releases or switch production traffic.

## Current Delivery Boundary

The current worktree implements explicit DEM v2 compilation, provenance, enforced semantic validation, dialect registries and capabilities, full index phases, typed expressions, PostgreSQL pgvector behavior, unified rebuild, structured transfer evidence, and ordinary discovery of the package-owned `teqfw.db.schema` fragment.
These implementation tokens are not automatically a new documented public API.
The external conformance gate now passes against PostgreSQL with pgvector `0.8.6` and MariaDB 10.11 in the provisioned test environment.

## Reading Angle

Read `product/overview.md` and `product/migration.md` first.
Then read `architecture/dem/overview.md`, `environment/postgresql.md` when relevant, `environment/rebuild.md`, and `code/dem.md` for the target contract and delivery status.

## Boundary

This file classifies the project but does not replace lower-level contracts.
