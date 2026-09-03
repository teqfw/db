# Changelog

All notable changes to this package are documented in this file.

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
