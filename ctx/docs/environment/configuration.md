# Database Configuration

- Path: `ctx/docs/environment/configuration.md`
- Changed: `20260808`
- Legacy Sources: `README.md`, `doc/config.md`

## Local Node

The logical configuration node is `@teqfw/db`.
Its value is a Knex-compatible configuration object:

```json
{
  "@teqfw/db": {
    "client": "mysql2",
    "connection": {
      "host": "127.0.0.1",
      "user": "application",
      "password": "secret",
      "database": "application"
    }
  }
}
```

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

## Rebuild Configuration Boundary

The current 2.x local configuration contract describes one default connection.
It does not define source/target pairs, snapshot retention, cutover, or incremental migration settings.

The accepted unified rebuild service must receive source identity, target identity, snapshot location, and optional transformation selection through explicit call or DI contracts.
This document does not invent configuration keys before those public contracts exist.
An external migration orchestrator may maintain its own version and deployment configuration outside the `@teqfw/db` node.

## Security Boundary

Examples use placeholders.
Passwords, connection URLs, certificates, and production dump paths are application secrets and stay outside repository context.
Migration evidence may contain table names, counts, and failure details and must be stored according to the application's operational data policy.
