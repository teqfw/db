# Code Overview

- Path: `ctx/docs/code/overview.md`
- Changed: `20260808`

## Source Structure

- `src/Back/Api/` — abstract public contracts.
- `src/Back/App/` — higher-level CRUD and transaction orchestration.
- `src/Back/RDb/` — connection, transaction, schema, and legacy CRUD implementation.
- `src/Back/Dem/` — declaration scanning, loading, and normalization.
- `src/Back/Dto/` — backend DTOs and factories.
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
- RDB conversion and ordering modules derive dependency-ordered target descriptors.
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

## Public Surface

The stable logical surface is the `TeqFw_Db_` token namespace plus package metadata that registers it.
Direct source-path imports are implementation-level unless explicitly documented.

No public token for the complete rebuild workflow is documented yet.
Agents must not invent one in downstream documentation or consumer code before the architecture is implemented and verified.
