# Filesystem Structure

- Path: `ctx/docs/filesystem.md`
- Changed: `20261007`

## Purpose

Define root-level repository navigation.

## Root Directories

- `.github/` — CI verification configuration; npm publication is operated locally by the agent.
- `bin/` — development verification helpers, including the Markdown lint runner.
- `ctx/` — authoritative cognitive context.
- `etc/` — package-owned DEM and map assets published for host discovery.
- `skills/` — version-matched package-owned consumer guidance published with the npm artifact.
- `src/` — package implementation.
- `test/` — automated and manual verification assets.

## Root Files

- `.markdownlint.json` — Markdown validation rules aligned with sibling TeqFW packages.
- `AGENTS.md` — root ADSM instructions.
- `LICENSE` — Apache 2.0 license.
- `README.md` — npm/GitHub entry documentation.
- `SECURITY.md` — vulnerability reporting, trust boundaries, and publication security policy.
- `package.json` — npm metadata, dependencies, scripts, and TeqFW namespace registration.
- `package-lock.json` — reproducible npm dependency graph for the 2.x line.
- `jsconfig.json` — strict checked-JavaScript and declaration consumer compiler configuration.
- `types.d.ts` — type-only root contract and ambient `TeqFw_Db_` vocabulary.

## Scope Rule

This document describes only repository-root entries.
Subdirectory structure belongs in local documentation or `AGENTS.md` files.
