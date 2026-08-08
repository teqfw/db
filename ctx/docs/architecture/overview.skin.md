# @teqfw/db Architecture

## Purpose

Compose modular entity declarations into one relational target and provide safe persistence and rebuild mechanisms.

## Mental Model

The package has two related pipelines.
One composes a target relational model; the other creates that target and transfers explicitly preservable data into it.

## Scope

Includes:

- Declaration, composition, relational projection, access, and rebuild blocks.
- DI, Knex, driver, filesystem, and external migration-orchestrator boundaries.

Excludes:

- Incremental diff planning, semantic migration inference, application cutover, and release policy.
- Source-file-level implementation details.

## Invariants

- DI 2.x dependencies live in export-scoped `__deps__`.
- Logical declarations remain independent from Knex.
- Transaction ownership and dependency-safe operation ordering are explicit.
- Source data is preserved explicitly before in-place replacement.
- A rebuild reports transfer failures and never implies cutover authorization.
- DTO factories do not retain mutable caller input.

## Agent Document

`overview.md`
