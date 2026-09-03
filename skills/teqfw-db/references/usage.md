# Usage

## Host Composition

Configure namespace roots before the first Container resolution. Discover the installed package namespace from canonical package metadata when the host supports registry-based composition.

Import supported structural contracts with `import type {...} from '@teqfw/db'`. The same declaration file installs ambient `TeqFw_Db_*` aliases for JSDoc and DI dependency declarations. These compiler-visible names do not change runtime namespace discovery or the stability status of their corresponding DI tokens.

Load selected `@teqfw/cfg` Sources before database runtime components. The default configuration uses `TEQFW_DB__<SETTING>` and a named connection uses `TEQFW_DB__<NAME>_<SETTING>`; use `EXTRA` only for uncommon Knex or driver options.

Resolve a separate transient connection (`TeqFw_Db_Back_RDb_Connect$$`) for every non-default connection, initialize it with the selected immutable configuration, and disconnect it through host lifecycle code. Keep the default singleton for the package default connection.

## DEM Composition

Package attributes use `type.id: "core.identity"` for system identities and `type.id: "core.ref"` for stored references. The host application map owns the single `identityProfile`; packages do not choose its storage representation. A `core.ref` must participate in exactly one relation whose target is the corresponding `core.identity`, receives only that concrete type, and is never generated. Ordinary explicitly typed relations to compatible primary or unique keys remain separate.

Before writing or changing a DEM path, validate every `package` and `entity` key against `^[a-z][a-z0-9]*$`. These keys are lowercase alphanumeric words only: `_`, camelCase, uppercase, whitespace, and hyphens are rejected. This rule is intentionally stricter than the attribute-name rule, so `owner_id` may be an attribute but must not be a package or entity key.

Build a readable physical table name through nested logical packages, rather than encoding separators in a key. For example, `package.pde.package.runtime.package.owner.entity.session` projects to `pde_runtime_owner_session`; it is not valid to write a single `pde_runtime_owner` package. The optional application-map `namespace` is a separate physical prefix, not a replacement for required logical path segments. When a compiler reports an invalid name, correct the declaration at its reported canonical path; do not work around the validation with a physical-name override or by changing an unrelated map setting.

For direct compiler use, supply:

- trusted fragment envelopes containing `declaration`, `filename`, `fragmentId`, and `packageName`;
- one trusted map envelope;
- one dialect adapter selected for the configured connection.

Handle `DemCompilationError` through its structured `diagnostics` and `warnings`. Diagnose by stable code, canonical path, stage, severity, and provenance rather than matching complete English messages. Assert the successful compilation, derive the selected operation plan or query requirements, and let the operation executor run connection-specific preflight before mutation or query execution.

The loader scans the application and installed-package declarations before compilation, including `@teqfw/db`'s published `etc/teqfw.schema.json` fragment. Do not present test-only inputs such as `testDems` or `testMapRoot` as production integration patterns. Direct compiler callers must pass every selected envelope, including the package-owned fragment when schema history is used.

## Entity-to-table access

Keep database access in logical DEM terms: consumer code must use an entity's logical name and must never hardcode a physical table name. The complete host-owned flow is `DEM map` → `compilation.physical.namespace` → connection resolver configuration → transaction `getTableName(entity metadata)` → physical table name.

Loading and compiling DEM declarations does not configure a connection resolver. After a successful load and before any database access through that connection, the host must apply the compiled map namespace explicitly:

```js
const loaded = await demLoad.exec({path: projectRoot, adapter});
connection.setSchemaConfig({prefix: loaded.compilation.physical.namespace});
```

Resolve the table only inside the transaction that will use it, through entity metadata rather than a constructed string:

```js
const table = trx.getTableName({
    getEntityName: () => '@vendor/package/domain/entity',
});
```

The map namespace is a physical prefix, but it is not applied to runtime queries automatically. Configure every connection before creating queries from it; repeat the configuration when the host creates an independent connection. The caller owns a transaction it opens and must commit it on success or roll it back on failure; `getTableName()` neither starts nor finalizes that transaction.

## Selection

Selection v2 accepts registered typed expressions, derived projections, expression ordering, limit, offset, and matching count behavior. Keep user input in value nodes; never concatenate it into SQL. The owning transaction boundary commits or rolls back its own work.

## Schema Lifecycle

Plan schema work from a successful compilation result. Let the schema executor preflight the operation and connection before requesting a mutable schema builder. Preserve phase order: tables and key constraints, relations, data, then late indexes. Drop relations before tables. Detect unsupported transfer cycles before reading or writing rows; use only an explicit strategy supported by the selected dialect.

## Rebuild

Select `parallel` when source and target are distinct. Select `inPlace` only with a verified readable snapshot or explicit discard authorization. Supply stable `sourceId` and `targetId`, connections, a successful target `compilation`, and explicit transformations where structural mapping is insufficient.

Supply an authentic successful `sourceCompilation` whenever the source model, namespace, or physical layout differs from the target. Omit it only when source and target use the same compilation; the implementation otherwise defaults it to the target and uses it to enumerate source tables, validate the source adapter, plan in-place drops, and order reads.

Pass connections under `source` and `target`, not renamed aliases. Identify each transformation with a stable `id` and provide its row function through `exec`:

```js
const transformations = {
    '/report': {
        id: 'report-v1-to-v2',
        exec: ({row}) => ({...row, renamedField: row.oldField}),
    },
};
```

The rebuild executor authenticates both compilation results, derives its schema and transfer plans, and runs source and target preflight before reads or mutations; do not invent a separate generic preflight call.

Treat returned evidence as unaccepted until the caller verifies it. A failed required row or late index makes the rebuild unsuccessful. Preserve an independently readable source or durable snapshot until the host completes acceptance and cutover.

The unified rebuild implementation does not infer incremental migrations, accept the target, perform cutover, or delete the source.

## Effective DEM History

After creating the target structure, record the authentic successful compilation and retain the returned local snapshot ID. Start an application record from the last applied snapshot (or `null` only for first-time creation), then mark it applied only with the same target compilation after catalog validation succeeds:

```js
const history = await container.get('TeqFw_Db_Back_RDb_History$');
const target = await history.recordSnapshot({compilation, connection});
const attempt = await history.startApplication({
    compilation, connection, sourceSnapshotId: previousSnapshotId ?? null, targetSnapshotId: target.id,
});
await history.completeApplication({applicationId: attempt.id, compilation, connection});
```

Use `failApplication()` for an interrupted or rejected started attempt; retry by creating a new application record. `resolveLastApplied()` returns the last successful application and its immutable snapshot for migration planning. A `DemCatalogMismatchError` exposes explicit diagnostics; do not turn it into inferred DDL or transformations. Pass a caller-owned transaction when the history event must share an atomic boundary, and do not finalize that transaction in the history service.
