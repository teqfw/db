# Product Roles

- Path: `ctx/docs/product/roles.md`
- Changed: `20260813`

## Roles

### Application Developer

Owns the application composition: selects the teq-plugins and fragments that form the target schema, maps cross-package dependencies, configures the current target database, and invokes persistence and rebuild services.
It decides whether a deployment uses in-place recreation or a separately provisioned target.
It treats model validation errors as blocking and does not bypass the assembled schema while claiming conformance.

### Package Developer

Is an npm package with a teqfw node in `package.json`. It declares a package-local DEM fragment and its required capabilities and uses the assembled application schema without controlling another package's model nodes or physical storage. `@teqfw/db` is a package developer in this sense too: it supplies `teqfw.db.schema` with `snapshot` and `application`, not a compiler-side exception.
When its model changes incompatibly, it supplies explicit transformation semantics to the host or future migration capability rather than expecting `@teqfw/db` to infer them.

### Operator

Runs capability provisioning, structure initialization, drop, export, import, rebuild, connection shutdown, and database-specific operational preparation.
The operator authorizes destructive steps and confirms that required preservation and verification conditions have been met.

### Possible Migration Orchestrator

If introduced, coordinates application-level incremental or multi-step migrations using database primitives exposed by this package.
Its placement is undecided: it may belong to the db plugin or to a separate plugin. It would own version history, ordering across releases, transformation selection, cutover, retry, and rollback policy.

### Maintainer

Preserves compiler enforcement, provenance, diagnostics, adapter registries, declaration compatibility, transaction invariants, rebuild boundaries, and the public TeqFW namespace.
When adding a dialect feature, the maintainer supplies logical/physical compatibility, capabilities, safe execution, and verification instead of adding an unchecked enum value.

## Authority Boundaries

Only the application or operator authorizes destructive schema recreation, replacement, and data import.
A package declaration may describe its own entities but cannot unilaterally map another package's external references.
An adapter may report or use available capabilities but cannot provision an extension or weaken constraints without explicit application/operator authority.
The core persistence package may execute explicitly requested transformations but cannot invent their meaning.
The maintainer may change implementation while preserving documented product behavior; changes to product boundaries require Human approval.
