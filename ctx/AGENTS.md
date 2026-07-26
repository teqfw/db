# Cognitive Context

- Path: `ctx/AGENTS.md`
- Template Version: `20260702`
- Changed: `20260726`

## Purpose

This directory is the project cognitive context and follows ADSM conventions.
Use skill `adsm-ctx` for lifecycle, projection, validation, and upgrade work.

## Level Map

- `agent/` — project-local agent and tool materials.
- `assets/` — non-authoritative visual and generated artifacts.
- `docs/` — authoritative project documentation.
- `README.md` — entry note.
- `adsm.json` — context metadata.

## Reading Map

Read `README.md`, then `docs/filesystem.md`, then documentation in product → architecture → environment → code order.

## Boundary

This branch defines project knowledge.
It does not contain runtime source, package artifacts, deployment secrets, or generated dependencies.
