# @teqfw/db Architecture

## Purpose

Compile modular declarations into one relational target and provide safe persistence and rebuild mechanisms.

## Mental Model

One pipeline compiles fragments into a validated logical model, provenance, and dialect plan.
The other creates that target and transfers explicitly preservable data.

## Scope

Includes:

- Versioned compilation, capability-aware projection, typed queries, access, and rebuild.
- DI, Knex, driver, filesystem, and external migration-orchestrator boundaries.

Excludes:

- Incremental planning, inferred transformations, cutover, and release policy.
- Source-file-level implementation details.

## Invariants

- DI 2.x dependencies live in export-scoped `__deps__`.
- Logical declarations remain independent from Knex.
- Conflicts, invalid relations, unplanned cycles, and unsupported capabilities fail before side effects.
- Dialect types and operators are supplied through validated adapters, not unchecked enum or SQL values.
- Transaction ownership and operation ordering are explicit.
- Source data is preserved explicitly before in-place replacement.
- A rebuild reports transfer failures and never implies cutover authorization.
- DTO factories do not retain mutable caller input.

## Agent Document

`overview.md`
