# Product Glossary

- Path: `ctx/docs/product/glossary.md`
- Changed: `20260808`

## Core Terms

- DEM — Domain Entities Model; a JSON-declarable logical persistence model.
- DEM fragment — the part of the DEM owned by one package.
- normalized DEM — the application-wide model produced after fragment composition and explicit reference mapping.
- target model — the normalized DEM selected for the next physical structure; it contains desired state, not change history.
- map — root-application declaration resolving external references and defining the table namespace.
- entity path — slash-delimited logical identifier such as `/app/user`.
- schema object — runtime contract exposing an entity name, attributes, primary key, and DTO creation.
- RDB object — normalized table, column, index, or relation descriptor used for physical schema operations.
- selection — structured filter, sorting, limit, and offset request.
- outer transaction — transaction supplied by a caller and therefore not committed or rolled back by nested code.
- internal transaction — transaction created and finalized by the called operation.
- deprecated entity — obsolete entity whose physical table is explicitly scheduled for removal.
- dump — durable transferable database contents.
- source structure — the database or schema whose data is preserved during rebuild.
- target structure — the physical structure created from the target model.
- rebuild migration — recreation of a schema or database followed by explicit restoration or transfer of compatible data.
- transformation — caller-supplied logic that maps source rows or engine state to the target representation.
- incremental migration — a versioned sequence of in-place structural or data changes; full support is outside `@teqfw/db`.
- migration orchestrator — an external component or host policy that owns versions, sequencing, cutover, and rollback.

## Naming Principles

Use “DEM” for the logical declaration and “RDB schema” for its physical database projection.
Use “map” only for cross-package reference mapping and table namespace configuration, not for arbitrary JavaScript objects.
Use “rebuild” for the package-owned recreate-and-transfer capability.
Do not call rebuild “incremental migration,” even when only part of the data changes.
