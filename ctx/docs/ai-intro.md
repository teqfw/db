# AI Introduction

- Path: `ctx/docs/ai-intro.md`
- Changed: `20260809`

## Purpose

Orient agents to `@teqfw/db` before implementation work.

## Project Type

`@teqfw/db` is a pure JavaScript ESM infrastructure library for relational persistence in TeqFW applications.

## Problem Space

The package compiles Domain Entity Model fragments distributed across teq-plugins into one validated application target model with provenance, projects that model through a selected relational-dialect adapter, and provides transaction-aware access and rebuild-oriented data transfer.

## Product Role

The package is the common relational persistence layer and owns target-model compilation, dialect/capability-aware projection, typed relational queries, plus basic recreate-and-transfer migration mechanisms.
Knex supplies database-driver abstraction.
`@teqfw/di` 2.x supplies token-based runtime composition.
Full incremental migration planning and application cutover remain external responsibilities.

## Primary Audience

TeqFW application developers, teq-plugin developers declaring persistent entities, operators rebuilding database state, external migration-orchestrator developers, and maintainers supervising database compatibility.

## Technology Base

Node.js ESM, JSDoc, Knex, versioned JSON schema declarations, dialect adapters, and the TeqFW namespace `TeqFw_Db_`.

## Distinguishing Characteristics

- Database structure is composed from per-package declarations.
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

The current worktree implements explicit DEM v2 compilation, provenance, enforced semantic validation, dialect registries and capabilities, full index phases, typed expressions, PostgreSQL pgvector behavior, unified rebuild, and structured transfer evidence.
These implementation tokens are not automatically a new documented public API.
The external conformance gate now passes against PostgreSQL with pgvector `0.8.6` and MariaDB 10.11 in the provisioned test environment.

## Reading Angle

Read `product/overview.md` and `product/migration.md` first.
Then read `architecture/dem/overview.md`, `environment/postgresql.md` when relevant, `environment/rebuild.md`, and `code/dem.md` for the target contract and delivery status.

## Boundary

This file classifies the project but does not replace lower-level contracts.
