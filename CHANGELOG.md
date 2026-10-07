# Changelog

All notable changes to this package are documented in this file.

## 2.4.0 - 2026-10-07

### Requirements

- Require Node.js 22 or newer (previously 20.17) and `@teqfw/di` 2.11 or newer within the 2.x line (previously 2.7).

### Fixed in 2.4.0

- Describe connections using the selected dialect: SQLite logs its filename; server databases log database, host, and user without treating leftover filename settings as SQLite configuration.
- Omit raw connection setup errors from logs to avoid disclosing credentials while preserving the original thrown error.
- Resolve checked-JavaScript contract errors and verify the published declarations against a consumer of the actual npm artifact.

### Documentation

- Clarify when independent applications sharing database space need an application-map prefix; packages contributing to one application do not require an extra prefix.
- Guide concise domain-based DEM names and explicit migration planning for logical path or physical prefix changes.
- Keep compilation access internal to `Schema`; hosts retain the successful loader result for preparation and history operations.

### Development Snapshot Compatibility

- Table-backed identity allocation and the public `Schema.getCompilation()` getter existed only in intermediate development commits after 2.3.0 and are not part of this release.
- Consumers of those snapshots must retain the loader result instead of calling the getter. Databases created with allocated identities require an explicit migration/rebuild to native generation, preserving IDs, foreign keys, and native sequence state; changing the map alone does not convert existing storage.

### Security

- Bind legacy PostgreSQL sequence names and values instead of interpolating SQL, validate sequence values before execution, and restore imported sequences through the active transaction.
- Preserve special JSON keys during fingerprinting and prevent inherited-property merges and prototype mutation.
- Replace the Markdown CLI dependency tree with a direct library runner and an override for the patched KaTeX line.

### Development and Publication

- Bound `@teqfw/log` to 2.x and align Node.js declaration dependencies with Node.js 22.
- Add a verification command, publication checks, Node.js 22/24 CI, and a private vulnerability reporting policy.
- Document agent-operated local npm publication with lifecycle verification; GitHub Actions only verifies changes.
- Inspect a real npm tarball and verify its source syntax, consumer types, closed exports, and runtime DI resolution.
- Remove obsolete scripts that deleted the dependency lockfile and development assets.

## 2.3.0 - 2026-09-03

### Added in 2.3.0

- Added optional lowercase dot-delimited root namespaces for concise DEM fragments.
- Published `teqfw.db.schema` as an ordinary package-owned DEM fragment for immutable schema snapshots and application history.

### Changed

- Expanded fragment roots before composition, resolved local relation paths against the expanded root, and preserved source provenance.
- Simplified the package-owned declaration by omitting empty optional nodes; the compiler handles omitted nodes as empty structures.
- Ensured `etc/teqfw.schema.json` is included in the npm package and clarified the product positioning and integration boundaries in the README.

### Removed in 2.3.0

- Removed the duplicate `RELEASE.md`; `CHANGELOG.md` is now the single release history.

## 2.2.0 - 2026-08-13

### Changed in 2.2.0

- Require explicit `version: 2` for every DEM declaration and application map.
- Reorganized automated verification into unit, integration, acceptance, opt-in, and package layers.
- Replaced the connection `getKnex()` accessor with `getClient()`.

### Removed

- Removed DEM v1 decoding, compatibility facades, and legacy physical projections.
- Removed legacy CRUD, selection DTO, logger facade, and related DI tokens and type aliases.

### Breaking changes in 2.2.0

- Unversioned DEM declarations and maps are no longer accepted.
- Legacy CRUD and selection APIs are no longer available; use the typed v2 query, schema, and rebuild contracts.
- Consumers that need historical behavior can compare the retained `v1` branch with current v2 and prepare their own migration guidance.

## 2.1.1 - 2026-08-10

### Changed in 2.1.1

- Reworked the README with the current package overview, boundaries, installation guidance, and agent-skill usage.

## 2.1.0 - 2026-08-10

### Added in 2.1.0

- Validated DEM compilation with provenance-aware diagnostics, graph construction, and schema planning.
- Rebuild execution for relational schemas, including deterministic dependency ordering and failure handling.
- PostgreSQL, MySQL, SQLite, and PostgreSQL pgvector dialect adapters.
- Public type declarations and package-owned consumer guidance.

### Changed in 2.1.0

- Migrated runtime composition to `@teqfw/di` 2.x export-scoped dependency declarations.
- Replaced the legacy `@teqfw/core` runtime coupling with `@teqfw/cfg` and current TeqFW package contracts.
- Updated CRUD, selection, query, import, export, and transaction infrastructure for the current database model.

### Fixed

- Hardened external database conformance and updated the SQLite dependency security baseline.

### Breaking changes in 2.1.0

- Consumers must use the DI 2.x composition model and the current configuration contract.
- The previous legacy implementation remains available only on the `v1` branch.
