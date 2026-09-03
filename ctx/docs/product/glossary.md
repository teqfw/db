# Product Glossary

- Path: `ctx/docs/product/glossary.md`
- Changed: `20260903`

## Core Terms

- DEM — Data Entity Model; a distributed, JSON-declarable logical target model for one application data schema.
- DEM fragment — the part of the DEM owned by one package.
- fragment root namespace — an optional dot-delimited logical package prefix declared by one DEM fragment; it shortens
  the JSON nesting without being a physical table prefix or an ownership reservation.
- `teqfw.db.schema` — an ordinary DEM fragment supplied by `@teqfw/db`; it declares the platform's `snapshot` and `application` entities.
- DEM v2 — the current explicit declaration and application-map contract; every input declares `version: 2`. It separates logical types, storage, generation, capabilities, indexes, and expressions.
- distributed schema — reusable package-owned fragments that a host application composes into one target schema for related data.
- application schema — the coherent target schema assembled by a host application from its own and selected teq-plugin fragments.
- teq-plugin — an npm package with a teqfw node in `package.json` that can contribute a fragment to an application schema.
- canonical DEM — the application-wide model produced only from decoded DEM fragments and the application map through ownership-safe composition, explicit reference mapping, canonicalization, and logical validation.
- compilation result — the canonical DEM plus provenance, dependency graph, capabilities, physical plan, deterministic fingerprint, and warnings.
- provenance — trusted fragment filename, identity, and source pointer attached to canonical nodes and diagnostics.
- target model — the canonical DEM selected by the host application for its application schema; it contains desired state, not change history.
- map — root-application declaration resolving external references and defining the physical table namespace.
- entity path — slash-delimited logical identifier such as `/app/user`.
- schema object — runtime contract exposing an entity name, attributes, primary key, and DTO creation.
- relation — a declared connection between attributes of entities; application mapping resolves package-external paths without changing target ownership.
- identity and reference policy — host-owned rules for representing system identities and references in the application schema.
- dump — durable transferable database contents.
- source structure — the database or schema whose data is preserved during rebuild.
- target structure — the physical structure created from the target model.
- rebuild migration — recreation of a schema or database followed by explicit restoration or transfer of compatible data.
- transformation — caller-supplied logic that maps source data to the target representation.
- incremental migration — a versioned sequence of in-place structural or data changes; full support is outside `@teqfw/db`.
- migration orchestrator — a possible host or plugin component that would own versions, sequencing, cutover, and rollback; its placement is undecided.

## Naming Principles

Use “DEM” for the logical declaration and “RDB schema” for its physical database projection.
Do not describe a platform-supplied fragment as compiler injection or a special DEM mode. Package ownership describes who supplies a declaration; composition, mapping, projection, and transfer use the same DEM rules for every fragment.
Use “compile” for decode, compose, resolve, validate, and project; do not call generic deep merge composition.
Use “map” only for cross-package reference mapping and table namespace configuration, not for arbitrary JavaScript objects.
Use “rebuild” for the recreate-and-transfer capability currently provided by `@teqfw/db`; do not imply that its higher-level orchestration owner has been decided.
Do not call rebuild “incremental migration,” even when only part of the data changes.
