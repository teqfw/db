# Cognitive Context

- Path: `ctx/README.md`
- Template Version: `20260623`
- Changed: `20260808`

`ctx/` contains the durable product, architecture, environment, and code context for `@teqfw/db`.

The central product model is a distributed Data Entity Model (DEM) compiled from teq-plugin fragments into one validated target with provenance, schema-bound access, and rebuild capability. Every target-schema entity originates in a selected fragment; compiler stages do not inject semantic nodes. The current implementation targets one database; multiple database targets remain future work.
Full incremental migration remains outside the package boundary.

Start with `AGENTS.md` and `docs/ai-intro.md`.
Use `docs/filesystem.md` for repository navigation.
Read `agent/` only for repository-local agent or tool material.
