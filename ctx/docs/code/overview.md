# Code Overview

- Path: `ctx/docs/code/overview.md`
- Changed: `20260808`

## Source Structure

- `src/Back/Api/` — abstract public contracts.
- `src/Back/App/` — higher-level CRUD and transaction orchestration.
- `src/Back/RDb/` — connection, transaction, schema, and legacy CRUD implementation.
- `src/Back/Dem/` — declaration scanning, loading, and normalization.
- `src/Back/Dem/Compile/` — target DEM v1/v2 decoding, ownership-safe composition, validation, graph, provenance, and fingerprinting; not yet implemented.
- `src/Back/Dem/Registry/` — target core logical/default/generation/operator registries; not yet implemented.
- `src/Back/Dto/` — backend DTOs and factories.
- `src/Back/RDb/Dialect/` — target per-dialect physical projection, capability preflight, value codecs, and execution adapters; not yet implemented.
- `src/Back/Api/Import/` — replaceable import transformation contract.
- `src/Back/Act/`, `Cli/`, `Plugin/`, and `Process/` — operational entry modules.
- `src/Shared/Dto/`, `Enum/`, and `Util/` — cross-runtime selection contracts.

## DI 2.x Convention

Constructor parameters use local names:

```js
constructor({trxWrapper, selection}) {}
```

Dependencies are declared by export:

```js
export const __deps__ = Object.freeze({
  default: Object.freeze({
    trxWrapper: "TeqFw_Db_Back_App_TrxWrapper$",
    selection: "TeqFw_Db_Back_Mod_Selection$"
  })
});
```

Named factories use `Factory` in `__deps__` and consumers request `Module__Factory$`.
As-is default classes use `Module__default`.

The package manifest currently uses the legacy-compatible `teqfw.namespaces` declaration.
The canonical platform metadata shape is `teqfw.fw.di.namespaces`; changing the manifest requires an explicit package-metadata migration and compatibility verification.

## Architecture Mapping

- DEM scanner, loaders, and normalizer implement target-model composition.
- The target compiler in `dem.md` replaces generic merge as the authoritative composition boundary.
- RDB conversion and ordering modules currently derive basic dependency-ordered descriptors; the target adapter and schema planner replace their unchecked type/index dispatch and log-only cycle behavior.
- RDB schema builder implements complete structure drop and creation.
- Connection, transaction, CRUD, and selection modules implement the persistence access layer.
- CLI export/import modules and the import transformation interface implement separate foundations of rebuild data transfer.

## Implementation Status

### Implemented In 2.x

- distributed DEM loading from the application and installed packages;
- explicit map application and normalized target composition;
- dependency-ordered table descriptor generation;
- destructive structure recreation;
- JSON export and import of modeled tables;
- PostgreSQL sequence handling and selected engine-specific transformations;
- outer-versus-internal transaction ownership for application CRUD.

### Required But Not Yet Unified

- trusted fragment envelopes and DEM v1/v2 decoding into one canonical model;
- single-owner schema-aware composition with provenance and aggregated diagnostics;
- semantic validation of types, defaults, generation, indexes, relation endpoints/cardinality/compatibility/target uniqueness, and cycles;
- dialect adapter registries, capability derivation/preflight, and immutable physical descriptors;
- full index structure and `table`/`afterRelations`/`afterData` schema phases;
- Selection v2 typed expressions and provider query operators;
- PostgreSQL pgvector storage, codecs, indexes, and nearest-neighbour queries;
- one rebuild service with explicit source and target identities;
- durable snapshot verification before destructive in-place recreation;
- direct source-to-target transfer independent of CLI process behavior;
- a structured rebuild evidence result;
- failure semantics in which a required table failure prevents successful completion;
- caller-selected transformation identity and reporting.

### Intentionally External

- catalog diff and automatic incremental DDL planning;
- application migration versions and history;
- semantic transformation discovery and ordering;
- application quiescence, cutover, online dual write, and release rollback.

## Engineering Constraints

- Keep `.mjs` ESM modules and the namespace-to-path mapping.
- Use static imports only for platform modules and third-party packages when token composition provides no application-level benefit.
- Keep DTO structural classes separate from their factories.
- Do not encode dependencies as constructor object keys.
- Preserve transaction ownership and engine-specific behavior.
- Keep rebuild execution independent from application deployment and cutover policy.
- Do not infer migration meaning from target DTO differences.
- Do not report a rebuild as successful after a required table transfer failure.
- Keep declaration formats backward-compatible within the 2.x line unless Human-approved otherwise.
- Treat unversioned input as DEM v1 and explicit version `2` as DEM v2; do not evolve unversioned semantics in place.
- Schema/data/query executors must accept only a successful compiler result and operation preflight.
- Do not route declaration strings to computed Knex method access or raw SQL.

## Public Surface

The stable logical surface is the `TeqFw_Db_` token namespace plus package metadata that registers it.
Direct source-path imports are implementation-level unless explicitly documented.

No public token for the complete rebuild workflow is documented yet.
Agents must not invent one in downstream documentation or consumer code before the architecture is implemented and verified.

The target compiler and adapter module names in `dem.md` are implementation mapping, not a claim that their DI tokens are currently public.
