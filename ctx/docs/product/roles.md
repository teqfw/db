# Product Roles

- Path: `ctx/docs/product/roles.md`
- Changed: `20260726`

## Roles

### Application Developer

Configures the connection, owns the root schema map, resolves the DI graph, and invokes persistence services.

### Package Developer

Declares a package-local DEM fragment and uses schema/repository contracts without controlling another package's physical storage.

### Operator

Runs structure initialization, drop, export, import, connection shutdown, and database-specific operational preparation.

### Maintainer

Preserves cross-engine behavior, declaration compatibility, transaction invariants, and the public TeqFW namespace.

## Authority Boundaries

Only the application or operator authorizes destructive schema recreation and data import.
A package declaration may describe its own entities but cannot unilaterally map another package's external references.
The maintainer may change implementation while preserving documented product behavior; changes to product boundaries require Human approval.
