# AI Introduction

- Path: `ctx/docs/ai-intro.md`
- Changed: `20260808`

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

The 2.x implementation already deep-merges legacy DEM fragments, recreates basic structure, executes comparison-only selections, and exports/imports modeled data.
The accepted context additionally requires the DEM v2 compiler, provenance, enforced semantic validation, dialect registries/capabilities, full index phases, typed expressions, PostgreSQL pgvector behavior, a unified rebuild workflow, and structured transfer evidence.
Those remain implementation gaps and must not be described as current public APIs.

## Reading Angle

Read `product/overview.md` and `product/migration.md` first.
Then read `architecture/dem/overview.md`, `environment/postgresql.md` when relevant, `environment/rebuild.md`, and `code/dem.md` for the target contract and delivery status.

## Boundary

This file classifies the project but does not replace lower-level contracts.
