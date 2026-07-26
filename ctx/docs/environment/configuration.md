# Database Configuration

- Path: `ctx/docs/environment/configuration.md`
- Changed: `20260726`
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

## Security Boundary

Examples use placeholders.
Passwords, connection URLs, certificates, and production dump paths are application secrets and stay outside repository context.
