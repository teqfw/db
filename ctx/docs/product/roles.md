# Product Roles

- Path: `ctx/docs/product/roles.md`
- Changed: `20260808`

## Roles

### Application Developer

Configures connections, owns the root schema map, selects the dialect adapter, resolves the DI graph, and invokes persistence and rebuild services.
It decides whether a deployment uses in-place recreation or a separately provisioned target.
It treats compile and preflight errors as blocking and does not bypass them with raw Knex schema work while claiming DEM conformance.

### Package Developer

Declares a package-local DEM fragment and its required capabilities and uses schema/repository contracts without controlling another package's model nodes or physical storage.
When its model changes incompatibly, it supplies explicit transformation semantics to an external migration workflow rather than expecting `@teqfw/db` to infer them.

### Operator

Runs capability provisioning, structure initialization, drop, export, import, rebuild, connection shutdown, and database-specific operational preparation.
The operator authorizes destructive steps and confirms that required preservation and verification conditions have been met.

### Migration Orchestrator

Coordinates application-level incremental or multi-step migrations outside `@teqfw/db`.
It owns version history, ordering across releases, transformation selection, cutover, retry, and rollback policy while using database primitives exposed by this package.

### Maintainer

Preserves compiler enforcement, provenance, diagnostics, adapter registries, declaration compatibility, transaction invariants, rebuild boundaries, and the public TeqFW namespace.
When adding a dialect feature, the maintainer supplies logical/physical compatibility, capabilities, safe execution, and verification instead of adding an unchecked enum value.

## Authority Boundaries

Only the application or operator authorizes destructive schema recreation, replacement, and data import.
A package declaration may describe its own entities but cannot unilaterally map another package's external references.
An adapter may report or use available capabilities but cannot provision an extension or weaken constraints without explicit application/operator authority.
The core persistence package may execute explicitly requested transformations but cannot invent their meaning.
The maintainer may change implementation while preserving documented product behavior; changes to product boundaries require Human approval.
