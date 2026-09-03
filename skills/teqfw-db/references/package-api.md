# Package API

## Exposure Rules

`@teqfw/db` publishes a type-only root export through `types.d.ts`. It has no JavaScript root entrypoint. Consume runtime behavior through TeqFW DI tokens registered by `package.json#teqfw.fw.di.namespaces`; do not import `@teqfw/db/src/**` as a supported public API.

Named root declarations describe supported consumer data contracts. Ambient `TeqFw_Db_*` aliases provide the version-matched vocabulary used by JSDoc and DI declarations. Type visibility does not promote an implementation token to stable API and does not authorize a direct source import.

The namespace metadata maps `TeqFw_Db_` to `./src` with `.mjs`. This addressing contract does not make every resolvable token a stable consumer API.

## Current Token Inventory

| Token | Current role | Exposure note |
| --- | --- | --- |
| `TeqFw_Db_Back_Config$` | Return immutable default or named Knex configuration with `get(name?)` | Documented consumer configuration token |
| `TeqFw_Db_Back_RDb_Connect$` | Default singleton connection | Documented default connection token |
| `TeqFw_Db_Back_RDb_Connect$$` | Create an independent transient connection | Documented named-connection composition token |
| `TeqFw_Db_Back_Dem_Compile$` | Compile trusted DEM envelopes with one adapter | Current implementation token; not automatically a stable public API |
| `TeqFw_Db_Back_RDb_Rebuild$` | Execute bounded evidence-producing rebuild | Current implementation token; not yet a documented stable public token |
| `TeqFw_Db_Back_RDb_History$` | Record and verify effective-DEM history | Documented schema-history token |

The suffix `$` requests the normal DI lifecycle; `$$` requests a transient instance. Configure `@teqfw/di` namespace roots before the first resolution.

## Current Callable Shapes

Configuration:

```js
const config = await container.get('TeqFw_Db_Back_Config$');
const defaultKnexConfig = config.get();
const reportingKnexConfig = config.get('reporting');
```

Connection:

```js
const connection = await container.get('TeqFw_Db_Back_RDb_Connect$$');
await connection.init(knexConfig);
// Use the initialized connection, then release it through host lifecycle code.
await connection.disconnect();
```

Compiler:

```js
const compilation = await compile.exec({adapter, fragments, mapEnvelope});
compile.assertResult({value: compilation});
```

The standard DEM loader discovers the package-owned `teqfw.db.schema` fragment from the installed package's `etc/teqfw.schema.json`. Direct compiler callers must provide that trusted fragment envelope themselves when they need the `snapshot` and `application` history entities; compilation never injects it.

The current rebuild callable shape is:

```text
exec({
    mode, compilation, sourceCompilation?, source, target, sourceId, targetId,
    snapshot?, authorizeDiscard?, transformations?, sourceTransaction?,
    targetTransaction?, cycleStrategy?
})
```

`sourceCompilation` may default to the target only when both describe the same physical model; supply an authentic successful source compilation when the source model, namespace, or layout differs. The rebuild token is not yet a documented stable public token.

Schema history uses the documented `TeqFw_Db_Back_RDb_History$` token. Its principal calls are `recordSnapshot({compilation, connection, transaction?})`, `startApplication({compilation, connection, sourceSnapshotId?, targetSnapshotId, transaction?})`, `completeApplication({applicationId, compilation, connection, transaction?})`, `failApplication(...)`, `resolveLastApplied(...)`, and read-only `validateCatalog({compilation, connection})`.

## Verification Rule

Before editing consumer code, verify exact metadata, token dependencies, callable shapes, and behavior in the installed package. Do not infer public support from a deep path, test fixture, or class name alone.
