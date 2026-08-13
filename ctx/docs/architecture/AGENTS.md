# Architecture Documentation

- Path: `ctx/docs/architecture/AGENTS.md`
- Template Version: `20260702`
- Changed: `20260808`

## Purpose

Translate product intent into stable blocks, flows, state ownership, integrations, constraints, and decisions.

## Level Map

- `overview.md` and `overview.skin.ru.md` — architecture entry point and Russian supervision projection.
- `dem/` — versioned declarations, compiler, provenance, validation, adapters, indexes, and typed queries.
- `structure.md` — major runtime blocks.
- `behavior.md` — composition, access, structure, and rebuild flows with failure behavior.
- `integration.md` — DI, Knex, filesystem, and driver boundaries.
- `state.md` — mutable and durable state ownership.
- `constraints.md` — non-negotiable restrictions.
- `decisions.md` — durable architecture decisions and explicitly deferred questions.

## Boundary

Refine only outcomes already accepted at the product level.
Do not place source-file inventories, test commands, deployment secrets, or new product requirements here.
Preserve `dem/` as the authoritative nested model branch; do not flatten its contracts into implementation documents.
