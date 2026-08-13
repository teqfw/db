# DEM Architecture Documentation

- Path: `ctx/docs/architecture/dem/AGENTS.md`
- Template Version: `20260702`
- Changed: `20260808`

## Purpose

Define the complete target contract for declaring, composing, validating, projecting, and querying a DEM.

## Reading Order

1. `overview.md` — model layers and compiler boundary.
2. `declaration.md` — explicit DEM v2 and map JSON contracts.
3. `composition.md` — ownership, conflict, determinism, and provenance rules.
4. `validation.md` — staged validation, diagnostics, and cycle handling.
5. `dialects.md` — capability and adapter contracts.
6. `indexes.md` — index semantics and build phases.
7. `queries.md` — typed expression and nearest-neighbour query contracts.

## Boundary

These documents define accepted target architecture, including behavior not yet implemented.
Keep logical meaning independent from Knex and individual databases.
Put runtime prerequisites in `../../environment/` and source mapping in `../../code/`.
Do not weaken a validation rule to match current implementation behavior; record the implementation gap downstream.
