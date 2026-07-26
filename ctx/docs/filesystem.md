# Filesystem Structure

- Path: `ctx/docs/filesystem.md`
- Changed: `20260726`

## Purpose

Define root-level repository navigation.

## Root Directories

- `bin/` — development and release shell helpers.
- `ctx/` — authoritative cognitive context.
- `doc/` — legacy public documentation retained during the 2.x migration.
- `src/` — package implementation.
- `test/` — automated and manual verification assets.

## Root Files

- `AGENTS.md` — root ADSM instructions.
- `LICENSE` — Apache 2.0 license.
- `README.md` — npm/GitHub entry documentation.
- `RELEASE.md` — legacy release history.
- `package.json` — npm metadata, dependencies, scripts, and TeqFW namespace registration.
- `package-lock.json` — reproducible npm dependency graph for the 2.x line.

## Scope Rule

This document describes only repository-root entries.
Subdirectory structure belongs in local documentation or `AGENTS.md` files.
