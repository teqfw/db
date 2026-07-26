# Architecture Documentation

- Path: `ctx/docs/architecture/AGENTS.md`
- Template Version: `20260702`
- Changed: `20260726`

## Purpose

Translate product intent into stable blocks, flows, state ownership, integrations, constraints, and decisions.

## Level Map

- `overview.md` and `overview.skin.md` — architecture entry point.
- `structure.md` — major runtime blocks.
- `behavior.md` — principal flows and failure behavior.
- `schema-declaration.md` — DEM JSON contract migrated from `doc/schema.md`.
- `map-declaration.md` — map JSON contract migrated from `doc/map.md`.
- `integration.md` — DI, Knex, filesystem, and driver boundaries.
- `state.md` — mutable and durable state ownership.
- `constraints.md` — non-negotiable restrictions.
- `decisions.md` — durable migration decisions.

## Boundary

Do not place source-file inventories, test commands, deployment secrets, or new product requirements here.
