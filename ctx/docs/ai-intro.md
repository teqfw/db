# AI Introduction

- Path: `ctx/docs/ai-intro.md`
- Changed: `20260808`

## Purpose

Orient agents to `@teqfw/db` before implementation work.

## Project Type

`@teqfw/db` is a pure JavaScript ESM infrastructure library for relational persistence in TeqFW applications.

## Problem Space

The package combines Domain Entity Model fragments distributed across teq-plugins into one application target model, projects that model to relational structures, and provides transaction-aware access and rebuild-oriented data transfer.

## Product Role

The package is the common relational persistence layer and owns target-model composition plus basic recreate-and-transfer migration mechanisms.
Knex supplies database-driver abstraction.
`@teqfw/di` 2.x supplies token-based runtime composition.
Full incremental migration planning and application cutover remain external responsibilities.

## Primary Audience

TeqFW application developers, teq-plugin developers declaring persistent entities, operators rebuilding database state, external migration-orchestrator developers, and maintainers supervising database compatibility.

## Technology Base

Node.js ESM, JSDoc, Knex, JSON schema declarations, and the TeqFW namespace `TeqFw_Db_`.

## Distinguishing Characteristics

- Database structure is composed from per-package declarations.
- Logical entity paths are separated from physical table names.
- Dependency order controls table creation, removal, export, and import.
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

The 2.x implementation already composes DEM fragments, recreates structure, and exports/imports modeled data.
The accepted context additionally requires a unified rebuild workflow and structured transfer evidence; those parts remain implementation gaps and must not be described as current public APIs.

## Reading Angle

Read `product/overview.md` and `product/migration.md` first.
Then read `architecture/overview.md`, `environment/rebuild.md`, and `code/overview.md` for refinement and delivery status.

## Boundary

This file classifies the project but does not replace lower-level contracts.
