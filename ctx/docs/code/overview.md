# Code Overview

- Path: `ctx/docs/code/overview.md`
- Changed: `20260810`

## Source Structure

- `src/Back/Api/` — abstract public contracts.
- `src/Back/App/` — higher-level CRUD and transaction orchestration.
- `src/Back/RDb/` — connection, transaction, schema, and legacy CRUD implementation.
- `src/Back/Dem/` — trusted declaration scanning and compiler-backed loading.
- `src/Back/Dem/Compile/` — DEM v1/v2 decoding, ownership-safe composition, validation, graph, provenance, and fingerprinting.
- `src/Back/Dem/Registry/` — frozen core logical/default/generation/operator registries.
- `src/Back/Dto/` — backend DTOs and factories.
- `src/Back/RDb/Dialect/` — per-dialect physical projection, capability preflight, value codecs, and execution adapters.
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

The package manifest uses the canonical `teqfw.fw.di.namespaces` declaration.

The package also publishes `types.d.ts` through `package.json#types` and a type-only root export. This compiler entrypoint exposes supported structural contracts and ambient DI aliases without creating a JavaScript root entrypoint or changing namespace discovery. Ambient visibility does not make an implementation token stable public API.

`src/Back/Config.mjs` resolves `TeqFw_Cfg_Reader$`, reads the `TEQFW_DB` raw namespace, converts common scalar fields
and optional structured `EXTRA`, and freezes the resulting Knex configuration. It does not select cfg Sources or load files; those
operations belong to the host composition root before configuration-consuming runtime is resolved.
`Config.get()` selects unprefixed parameters from `TEQFW_DB`; `Config.get(name)` selects `<NAME>_` parameters from
the same namespace and caches one deeply frozen typed value per connection name. Common fields are converted without
JSON; optional `EXTRA` objects carry specialized Knex or driver-specific settings.

## Architecture Mapping

- DEM scanner and loader feed trusted envelopes to the compiler, which is the authoritative composition boundary.
- The compiler in `dem.md` replaces generic merge with ownership-safe composition and provenance.
- Dialect adapters and the schema planner replace unchecked conversion and recursive ordering.
- RDB schema builder implements complete structure drop and creation.
- Connection, transaction, CRUD, and selection modules implement the persistence access layer.
- CLI export/import modules and the import transformation interface implement separate foundations of rebuild data transfer.

## Implementation Status

### Implemented In The Current Worktree

- distributed DEM loading from the application and installed packages;
- versioned DEM v1/v2 compilation, map application, ownership, provenance, validation, graph analysis, and branding;
- dialect-selected physical projection and read-only capability preflight;
- phase-ordered tables, constraints, relations, data, and late indexes;
- Selection v2 typed expressions plus the legacy selection decoder;
- PostgreSQL pgvector storage, codecs, operators, HNSW/IVFFlat registries, and execution options;
- parallel and guarded in-place rebuild with transformation and failure evidence;
- verified-snapshot restore, transaction ownership, and PostgreSQL generated-state restoration;
- JSON export and import of modeled tables.

### Verification Status

- The module, DI integration, acceptance, syntax, and ESM-validator gates pass locally.
- The real MariaDB opt-in suite passes against MariaDB 10.11, including DDL, rebuild, generated values, late indexes, and cyclic schema creation.
- The real PostgreSQL opt-in suite passes with pgvector `0.8.6`, including storage, codecs, distances, approximate indexes, rebuild, sequence restoration, transaction-local options, and cyclic transfer.

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
