# AI Introduction

- Path: `ctx/docs/ai-intro.md`
- Changed: `20260726`

## Purpose

Orient agents to `@teqfw/db` before implementation work.

## Project Type

`@teqfw/db` is a pure JavaScript ESM library for relational persistence in TeqFW applications.

## Problem Space

The package combines distributed Domain Entity Model declarations, maps them to relational tables, manages RDB structure, and provides transaction-aware CRUD and data transfer operations.

## Product Role

The package is the relational persistence layer.
Knex supplies database-driver abstraction.
`@teqfw/di` 2.x supplies token-based runtime composition.

## Primary Audience

TeqFW application developers, package developers declaring persistent entities, and maintainers supervising database compatibility.

## Technology Base

Node.js ESM, JSDoc, Knex, JSON schema declarations, and the TeqFW namespace `TeqFw_Db_`.

## Distinguishing Characteristics

- Database structure is composed from per-package declarations.
- Logical entity paths are separated from physical table names.
- Dependency order controls table creation, removal, export, and import.
- CRUD can join an existing transaction or manage its own transaction.

## What This Project Is Not

It is not an ORM with identity maps or active records.
It does not own application-specific entities, authorization, or business rules.
It does not hide raw Knex access inside transactions.

## Reading Angle

Read `product/overview.md`, `architecture/overview.md`, `environment/configuration.md`, and `code/overview.md`.

## Boundary

This file classifies the project but does not replace lower-level contracts.
