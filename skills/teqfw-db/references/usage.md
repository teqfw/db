# Usage

## Host Composition

Configure namespace roots before the first Container resolution. Discover the installed package namespace from canonical package metadata when the host supports registry-based composition.

Import supported structural contracts with `import type {...} from '@teqfw/db'`. The same declaration file installs ambient `TeqFw_Db_*` aliases for JSDoc and DI dependency declarations. These compiler-visible names do not change runtime namespace discovery or the stability status of their corresponding DI tokens.

Load selected `@teqfw/cfg` Sources before database runtime components. The default configuration uses `TEQFW_DB__<SETTING>` and a named connection uses `TEQFW_DB__<NAME>_<SETTING>`; use `EXTRA` only for uncommon Knex or driver options.

Resolve a separate transient connection (`TeqFw_Db_Back_RDb_Connect$$`) for every non-default connection, initialize it with the selected immutable configuration, and disconnect it through host lifecycle code. Keep the default singleton for the package default connection.

## DEM Composition

For direct compiler use, supply:

- trusted fragment envelopes containing `declaration`, `filename`, `fragmentId`, and `packageName`;
- one trusted map envelope;
- one dialect adapter selected for the configured connection.

Handle `DemCompilationError` through its structured `diagnostics` and `warnings`. Diagnose by stable code, canonical path, stage, severity, and provenance rather than matching complete English messages. Assert the successful compilation, derive the selected operation plan or query requirements, and let the operation executor run connection-specific preflight before mutation or query execution.

The loader can scan application and installed-package declarations before compilation. Do not present test-only inputs such as `testDems` or `testMapRoot` as production integration patterns.

## CRUD And Selection

Provide an entity schema implementing DTO creation, attribute mapping, logical types, entity name, and primary-key metadata. Use the CRUD service for `createOne`, `readOne`, `readMany`, `updateOne`, `updateMany`, `deleteOne`, and `deleteMany`.

Legacy condition objects support equality only. Use Selection v2 for registered typed expressions, derived projections, expression ordering, limit, offset, and matching count behavior. The following named-connection flow keeps two writes and a bound-value query in one caller-owned transaction:

```js
const trx = await reporting.startTransaction();
try {
    const {primaryKey} = await crud.createOne({schema: reportSchema, trx, dto: report});
    await crud.createOne({
        schema: itemSchema,
        trx,
        dto: {...item, reportId: primaryKey.id},
    });
    const {records} = await crud.readMany({
        schema: reportSchema,
        trx,
        selection: {
            version: 2,
            select: [{as: 'display_name', expression: {kind: 'attr', name: 'name'}}],
            where: {
                kind: 'call',
                operator: 'core.eq',
                args: [
                    {kind: 'attr', name: 'name'},
                    {kind: 'value', value: userProvidedName},
                ],
            },
        },
    });
    await trx.commit();
} catch (error) {
    await trx.rollback();
    throw error;
}
```

Keep user input in value nodes; never concatenate it into SQL. Pass a transaction created by the named connection to every standard CRUD call targeting it, including reads. Otherwise the package-default transaction wrapper uses the default connection. Nested CRUD calls return without finalizing the supplied transaction; the owning boundary commits or rolls it back.

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
