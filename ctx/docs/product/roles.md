# Product Roles

- Path: `ctx/docs/product/roles.md`
- Changed: `20260904`

## Roles

### Application Developer

Owns the application composition: selects the teq-plugins and fragments that form its effective DEM, assigns complete target DEMs to database targets, declares each target's scope and `read`/`write` access mode, and configures the target connections.
It supplies the migration script and policy for each write target, including whether automatic startup migration is authorized. It treats any target-model or target-catalog mismatch as blocking and does not bypass a target check while claiming conformance.

### Package Developer

Is an npm package with a teqfw node in `package.json`. It declares a package-local DEM fragment and its required capabilities and uses the assembled application schema without controlling another package's model nodes or physical storage. `@teqfw/db` is a package developer in this sense too: it supplies `teqfw.db.schema` with `snapshot` and `application`, not a compiler-side exception.
When its model changes incompatibly, it communicates explicit transformation semantics to the host application rather than expecting `@teqfw/db` to infer them.

### Operator

Runs capability provisioning, structure initialization, drop, export, import, rebuild, connection shutdown, and database-specific operational preparation.
The operator authorizes destructive steps and confirms that required preservation and verification conditions have been met.

### Migration Coordinator

`@teqfw/db` coordinates target compatibility checks at application startup. For an authorized write target that does not match its target DEM, it invokes the application migration script, records and returns evidence, and checks the target again. It does not own transition semantics, migration-policy choice, cutover, or rollback policy.

### Maintainer

Preserves compiler enforcement, provenance, diagnostics, adapter registries, declaration compatibility, transaction invariants, rebuild boundaries, and the public TeqFW namespace.
When adding a dialect feature, the maintainer supplies logical/physical compatibility, capabilities, safe execution, and verification instead of adding an unchecked enum value.

## Authority Boundaries

Only the application or operator authorizes destructive schema recreation, replacement, data import, or automatic startup migration.
A package declaration may describe its own entities but cannot unilaterally map another package's external references.
An adapter may report or use available capabilities but cannot provision an extension or weaken constraints without explicit application/operator authority.
The core persistence package may invoke an authorized application migration script and execute explicitly requested transformations but cannot invent their meaning.
The maintainer may change implementation while preserving documented product behavior; changes to product boundaries require Human approval.
