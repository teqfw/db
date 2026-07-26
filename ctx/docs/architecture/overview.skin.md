# @teqfw/db Architecture

## Purpose

Turn modular logical entity declarations into safe relational structure and data operations.

## Mental Model

The package is a pipeline.
It loads and normalizes declarations, derives dependency-ordered relational descriptors, then delegates physical work to Knex through explicit connection and transaction boundaries.

## Scope

Includes:

- Declaration, composition, schema, access, and operational blocks.
- DI, Knex, driver, and filesystem integration boundaries.

Excludes:

- Application business behavior.
- Source-file-level implementation details.

## Invariants

- DI 2.x dependencies live in export-scoped `__deps__`.
- Logical declarations remain independent from Knex.
- Transaction ownership is explicit.
- Dependency order precedes destructive and transfer operations.
- DTO factories do not retain mutable caller input.

## Agent Document

`overview.md`
