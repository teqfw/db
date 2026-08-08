# Environment Overview

- Path: `ctx/docs/environment/overview.md`
- Changed: `20260808`

## Runtime Model

The package runs as Node.js ESM.
The 2.x line targets Node.js 20 or newer to align with `@teqfw/di` 2.x.

## External Dependencies

- `@teqfw/di` 2.x for runtime composition.
- Knex 3.x for query and schema abstraction.
- A client package matching the configured database, such as `pg`, `mysql2`, or `sqlite3`.
- Filesystem access for DEM/map declarations and import/export files.
- Durable storage for rebuild snapshots when in-place replacement must preserve data.

## Supported Database Contexts

The implementation contains explicit behavior for PostgreSQL, MySQL/MariaDB, and SQLite.
Connectivity to MS SQL and Oracle is delegated to Knex and the corresponding installed client.
Structure-alteration and DDL transaction capabilities differ by engine; Knex connectivity does not imply uniform rebuild atomicity.

## Operational Constraints

The application must register namespace roots before the first DI resolution.
Connection credentials and paths are application-owned and must not be committed to this repository.
Schema recreation, drop, and import are destructive operations requiring operator intent.

An in-place rebuild requires snapshot storage outside the schema or database objects that will be replaced.
A parallel rebuild requires independently addressable source and target connections or namespaces.
Application quiescence, cutover, traffic switching, and source retirement are deployment concerns owned outside this package.
