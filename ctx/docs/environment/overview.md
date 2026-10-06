# Environment Overview

- Path: `ctx/docs/environment/overview.md`
- Changed: `20261006`

## Runtime Model

The package runs as Node.js ESM.

The selected database must grant the package-owned schema-history tables the same create, read, insert, and update privileges required by normal schema lifecycle operations.
Catalog validation is read-only and verifies projected table and column presence before a history record can become `applied`.
The 2.x line targets Node.js 22 or newer to align with the current development-toolchain requirements.

## External Dependencies

- `@teqfw/di` 2.x for runtime composition.
- `@teqfw/cfg` 2.x for the explicitly bootstrapped raw configuration snapshot.
- Knex 3.x for query and schema abstraction.
- A client package matching the configured database, such as `pg`, `mysql2`, or `sqlite3`.
- One `@teqfw/db` dialect adapter matching the configured Knex client.
- Filesystem access for DEM/map declarations and import/export files.
- Durable storage for rebuild snapshots when in-place replacement must preserve data.

## Supported Database Contexts

The implementation contains explicit behavior for PostgreSQL, MySQL/MariaDB, and SQLite.
Connectivity to MS SQL and Oracle is delegated to Knex and the corresponding installed client.
Structure-alteration and DDL transaction capabilities differ by engine; Knex connectivity does not imply uniform rebuild atomicity.

The accepted target architecture does not equate connectivity with support for every native type, index, expression, or extension.
Each selected adapter publishes static support and checks runtime availability before dependent operations.
PostgreSQL pgvector behavior additionally requires the `vector` extension in the target database; see `postgresql.md`.

## Operational Constraints

The application must register namespace roots before the first DI resolution, select cfg Sources, and await the
one-shot cfg load before resolving database runtime components.
Connection credentials and paths are application-owned and must not be committed to this repository.
Schema recreation, drop, and import are destructive operations requiring operator intent.
Extension installation and server-setting changes are separately authorized operations and are never implicit schema-build side effects.

An in-place rebuild requires snapshot storage outside the schema or database objects that will be replaced.
A parallel rebuild requires independently addressable source and target connections or namespaces.
Application quiescence, cutover, traffic switching, and source retirement are deployment concerns owned outside this package.

## Allocated Identity Prerequisites

Allocated mode requires the selected package-owned identitycounter table to exist
through the normal authorized schema lifecycle. Existing installations must explicitly
migrate to the extended package fragment; selecting a mode never creates a hidden
allocator table. The account requires SELECT, INSERT, and UPDATE on the modeled
counter table and SELECT on the allocated entity table for high-water reconciliation.
MariaDB/MySQL tables must use a transaction-capable engine such as InnoDB.

Keep allocations and dependent inserts inside one active transaction. PostgreSQL and
InnoDB can report deadlock or serialization errors; SQLite can report SQLITE_BUSY or
SQLITE_BUSY_SNAPSHOT. The caller decides whether to retry the entire transaction.
The allocator never finalizes or retries the caller's transaction. Different SQLite
writers serialize; a read snapshot cannot always be upgraded to a writer.

Current integer codecs use exact JavaScript numbers: signed 32-bit allocation ends at
2147483647; supported 64-bit allocation ends at Number.MAX_SAFE_INTEGER. Exhaustion
and unsafe driver-returned values fail explicitly.
