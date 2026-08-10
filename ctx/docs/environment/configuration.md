# Database Configuration

- Path: `ctx/docs/environment/configuration.md`
- Changed: `20260810`
- Legacy Sources: `README.md`, `doc/config.md`

## cfg Namespace

`@teqfw/db` depends on `@teqfw/cfg` and owns the `TEQFW_DB` configuration namespace. The host selects ordered cfg
Sources and awaits `TeqFw_Cfg_Loader$.load()` during bootstrap before resolving database runtime components.
`@teqfw/db` never reads `process.env`, a dotenv file, or `cfg/local.json` implicitly.

- `TEQFW_DB__CLIENT` — Knex client name;
- `TEQFW_DB__HOST`, `PORT`, `USER`, `PASSWORD`, and `DATABASE` — network connection fields;
- `TEQFW_DB__FILENAME` and `SOCKET_PATH` — file or socket connection fields;
- `TEQFW_DB__SEARCH_PATH` — comma-separated PostgreSQL search path;
- `TEQFW_DB__USE_NULL_AS_DEFAULT` — boolean, `0`/`1`, or `false`/`true`/`no`/`yes` string;
- `TEQFW_DB__VERSION` — version for a non-standard PostgreSQL-compatible server;
- `TEQFW_DB__EXTRA` — object or JSON string containing uncommon Knex or driver-specific options.

`EXTRA.connection` is shallow-merged with the common connection fields. Explicit common parameters take precedence
over conflicting `EXTRA` properties. Other `EXTRA` properties are forwarded as Knex top-level configuration.

For example, a dotenv Source may provide:

```dotenv
TEQFW_DB__CLIENT=mysql2
TEQFW_DB__HOST=127.0.0.1
TEQFW_DB__USER=application
TEQFW_DB__PASSWORD=secret
TEQFW_DB__DATABASE=application
TEQFW_DB__EXTRA='{"pool":{"min":1,"max":4}}'
```

An Object Source may provide `EXTRA` as a raw object and `SEARCH_PATH` as an array instead of strings.
The package converts and deeply freezes its typed Knex configuration on first access. The cfg Store remains the
owner of the immutable raw application snapshot, and Reader projections remain detached input.

## Default And Named Connections

The reserved name `default` maps to the `TEQFW_DB` namespace and is returned by
`TeqFw_Db_Back_Config$.get()` or `.get('default')`. The package singleton
`TeqFw_Db_Back_RDb_Connect$` is the default connection initialized by the database startup component.

A named connection remains in the same `TEQFW_DB` namespace. Its normalized name prefixes each parameter after the
cfg `__` separator. Names contain alphanumeric segments separated by hyphens or underscores; lookup is
case-insensitive and hyphens normalize to underscores. For example:

```dotenv
TEQFW_DB__REPORTING_CLIENT=pg
TEQFW_DB__REPORTING_DATABASE=reporting
TEQFW_DB__REPORTING_EXTRA='{"pool":{"min":1,"max":4}}'
```

The host reads it through `TeqFw_Db_Back_Config$.get('reporting')`. Named connections accept the same parameter
suffixes as default, prefixed with `<NAME>_`.

Configuration does not itself create a connection or a DI token. For each named connection, the host defines an
application-owned singleton provider backed by a distinct `TeqFw_Db_Back_RDb_Connect$$` instance and initializes it
from the corresponding named configuration during host startup. The host also owns shutdown of that instance.
Container `register()` is test-only and must not be used for this production composition.

## Supported Knex Fields

The package forwards client configuration to Knex.
Common fields include:

- `client`;
- `connection.database`;
- `connection.filename` and `connection.flags` for SQLite;
- `connection.host`, `port`, `socketPath`, `user`, and `password`;
- `searchPath` for PostgreSQL;
- `useNullAsDefault`;
- `version` for a non-standard PostgreSQL-compatible server.

Consult the selected Knex/client documentation for additional supported options.

The configured client also selects the matching dialect adapter.
Adapter selection must agree with the actual connection during runtime preflight; an explicit mismatch fails before schema, transfer, or dialect-query work.

DEM capability requirements and PostgreSQL extension presence are model/runtime state, not connection secrets and not arbitrary new configuration keys.
Until a public adapter-selection override is implemented and documented, agents must not invent one.

## Rebuild Configuration Boundary

The current 2.x `TEQFW_DB` configuration contract describes one default connection and zero or more named
connections. A connection name does not assign rebuild roles. The contract does not define source/target pairs,
snapshot retention, cutover, or incremental migration settings.

The accepted unified rebuild service must receive source identity, target identity, snapshot location, and optional transformation selection through explicit call or DI contracts.
This document does not invent configuration keys before those public contracts exist.
An external migration orchestrator may maintain its own version and deployment configuration outside the `@teqfw/db` node.

## Security Boundary

Examples use placeholders.
Passwords, connection URLs, certificates, and production dump paths are application secrets and stay outside repository context.
Migration evidence may contain table names, counts, and failure details and must be stored according to the application's operational data policy.
Capability evidence may include server, extension, and adapter versions but must not contain credentials or full connection strings.
