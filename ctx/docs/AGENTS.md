# Project Documentation

- Path: `ctx/docs/AGENTS.md`
- Template Version: `20260702`
- Changed: `20260808`

## Purpose

This branch contains authoritative project-facing documentation.

## Reading Order

Read `product/`, then `architecture/`, then `environment/`, then `code/`.
Use `ai-intro.md` for orientation and `filesystem.md` only for root-level navigation.

Product and architecture documents may define accepted behavior not yet implemented.
Environment and code documents must identify delivery gaps explicitly and must not present target contracts as current APIs.

## Documentation Rules

- Ordinary `*.md` files are agent-facing operational documents.
- `*.skin.md` files are human-facing semantic projections paired by basename.
- Read a matching skin before changing its agent document.
- Put non-authoritative generated or visual artifacts under `ctx/assets/**`.
- Preserve accepted meaning and escalate contradictions upstream.
- Keep rebuild migration distinct from full incremental migration throughout all four levels.
