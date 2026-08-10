# Changelog

All notable changes to this package are documented in this file.

## 2.1.0 - 2026-08-10

### Added

- Validated DEM compilation with provenance-aware diagnostics, graph construction, and schema planning.
- Rebuild execution for relational schemas, including deterministic dependency ordering and failure handling.
- PostgreSQL, MySQL, SQLite, and PostgreSQL pgvector dialect adapters.
- Public type declarations and package-owned consumer guidance.

### Changed

- Migrated runtime composition to `@teqfw/di` 2.x export-scoped dependency declarations.
- Replaced the legacy `@teqfw/core` runtime coupling with `@teqfw/cfg` and current TeqFW package contracts.
- Updated CRUD, selection, query, import, export, and transaction infrastructure for the current database model.

### Fixed

- Hardened external database conformance and updated the SQLite dependency security baseline.

### Breaking changes

- Consumers must use the DI 2.x composition model and the current configuration contract.
- The previous legacy implementation remains available only on the `v1` branch.
