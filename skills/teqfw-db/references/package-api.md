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
| `TeqFw_Db_Back_RDb_Identity$` | Allocate explicit identities and reconcile imported counters | Documented consumer allocation token |
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

DEM fragments may provide a lowercase dot-delimited top-level `namespace` to shorten package nesting. The compiler expands
that logical root before composition and resolves local relation paths against it; the application-map `namespace` remains
the independent physical table prefix. External aliases declared in a fragment's `refs` are not rewritten by the root.

Package and entity containers may share a local key, yielding distinct paths such as `/person` and `/person/profile`. Naming guidance is a declaration design decision, not a compiler rename API: compilation preserves every logical path segment in physical projection and does not collapse repetitions. See [DEM path naming](usage.md#dem-path-naming) before changing paths and their consumers.

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

## Identity Allocation API

TeqFw_Db_Back_RDb_Identity$ is an intentionally documented consumer token. Its named
structural contracts are DbIdentity, DbIdentityInput, DbIdentitySyncInput, and
DbIdentityCounterEvidence.

- allocate({compilation, transaction, entity}) returns Promise<number> for one canonical
  entity's allocated identity. All three arguments are required.
- synchronize({compilation, transaction}) returns frozen per-entity counter evidence
  after reconciling imported explicit identities. Both arguments are required.

Compilation must be authentic and successful. An allocated target must include the
ordinary identitycounter entity from the published package fragment; no hidden compiler
injection or runtime table creation occurs. The active caller-owned transaction must
match the compiled supported dialect. Neither call finalizes or retries that transaction.

assertCompilation is an internal executor preflight helper on the current implementation;
it is not an additional stable consumer operation. Other compiler/rebuild implementation
tokens retain their existing exposure status.
