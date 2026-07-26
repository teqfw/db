# Code Overview

- Path: `ctx/docs/code/overview.md`
- Changed: `20260726`

## Source Structure

- `src/Back/Api/` — abstract public contracts.
- `src/Back/App/` — higher-level CRUD and transaction orchestration.
- `src/Back/RDb/` — connection, transaction, schema, and legacy CRUD implementation.
- `src/Back/Dem/` — declaration scanning, loading, and normalization.
- `src/Back/Dto/` — backend DTOs and factories.
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

## Engineering Constraints

- Keep `.mjs` ESM modules and the namespace-to-path mapping.
- Use static imports only for platform modules and third-party packages when token composition provides no application-level benefit.
- Keep DTO structural classes separate from their factories.
- Do not encode dependencies as constructor object keys.
- Preserve transaction ownership and engine-specific behavior.
- Keep declaration formats backward-compatible within the 2.x line unless Human-approved otherwise.

## Public Surface

The stable logical surface is the `TeqFw_Db_` token namespace plus package metadata that registers it.
Direct source-path imports are implementation-level unless explicitly documented.
