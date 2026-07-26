# Product Glossary

- Path: `ctx/docs/product/glossary.md`
- Changed: `20260726`

## Core Terms

- DEM — Domain Entities Model; a JSON-declarable logical persistence model.
- DEM fragment — the part of the DEM owned by one package.
- map — root-application declaration resolving external references and defining the table namespace.
- entity path — slash-delimited logical identifier such as `/app/user`.
- schema object — runtime contract exposing an entity name, attributes, primary key, and DTO creation.
- RDB object — normalized table, column, index, or relation descriptor used for physical schema operations.
- selection — structured filter, sorting, limit, and offset request.
- outer transaction — transaction supplied by a caller and therefore not committed or rolled back by nested code.
- internal transaction — transaction created and finalized by the called operation.
- deprecated entity — obsolete entity whose physical table is explicitly scheduled for removal.

## Naming Principles

Use “DEM” for the logical declaration and “RDB schema” for its physical database projection.
Use “map” only for cross-package reference mapping and table namespace configuration, not for arbitrary JavaScript objects.
