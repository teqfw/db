# Product Glossary

- Path: `ctx/docs/product/glossary.md`
- Changed: `20260813`

## Core Terms

- DEM — Domain Entities Model; a JSON-declarable logical target persistence model.
- DEM fragment — the part of the DEM owned by one package.
- DEM v1 — the unversioned legacy declaration accepted through compatibility decoding.
- DEM v2 — the explicit versioned declaration separating logical types, storage, generation, capabilities, indexes, and expressions.
- canonical DEM — the application-wide model produced after decoding, ownership-safe composition, explicit reference mapping, canonicalization, and logical validation.
- compilation result — the canonical DEM plus provenance, dependency graph, capabilities, physical plan, deterministic fingerprint, and warnings.
- provenance — trusted fragment filename, identity, and source pointer attached to canonical nodes and diagnostics.
- target model — the canonical DEM selected for the next physical structure; it contains desired state, not change history.
- map — root-application declaration resolving external references and defining the table namespace.
- entity path — slash-delimited logical identifier such as `/app/user`.
- schema object — runtime contract exposing an entity name, attributes, primary key, and DTO creation.
- logical type — database-independent value meaning and parameters.
- storage binding — adapter-owned physical realization of a logical type for one dialect.
- generation — database-side policy for creating an omitted attribute value, distinct from type and default.
- capability — namespaced feature that an adapter supports and an actual connection may or may not provide.

- `core.identity` — special logical DEM type for the system-addressable identity of its entity. The current materialization creates a generated single-column primary key through the host-selected profile.
- `core.ref` — special logical DEM type for a local representation derived from exactly one relation-resolved `core.identity`. It does not name the target, declare a foreign key by itself, or receive a generation policy.
- relation — the semantic declaration that identifies a reference target and its attribute positions; application mapping resolves package-external paths without changing target ownership.
- identity profile — the host-owned policy defining how logical entity identities and their references are represented in one target application model. The current DEM v2 profile structure contains the concrete type and generation policy used to materialize `core.identity`; `core.ref` derives only the compatible concrete type from its resolved identity target.
- dialect adapter — registry and execution boundary for physical types, indexes, query operators, and capability preflight.
- RDB object — validated physical table, column, index, or relation descriptor used for schema operations.
- typed expression — schema-checked attribute, bound value, or registered operator call.
- selection — structured filter, derived projection, expression sorting, limit, offset, and execution-option request.
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
Use “compile” for decode, compose, resolve, validate, and project; do not call generic deep merge composition.
Use “map” only for cross-package reference mapping and table namespace configuration, not for arbitrary JavaScript objects.
Use “rebuild” for the package-owned recreate-and-transfer capability.
Do not call rebuild “incremental migration,” even when only part of the data changes.
