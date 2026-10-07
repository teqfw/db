# Usage

## Host Composition

Configure namespace roots before the first Container resolution. Discover the installed package namespace from canonical package metadata when the host supports registry-based composition.

Import supported structural contracts with `import type {...} from '@teqfw/db'`. The same declaration file installs ambient `TeqFw_Db_*` aliases for JSDoc and DI dependency declarations. These compiler-visible names do not change runtime namespace discovery or the stability status of their corresponding DI tokens.

Load selected `@teqfw/cfg` Sources before database runtime components. The default configuration uses `TEQFW_DB__<SETTING>` and a named connection uses `TEQFW_DB__<NAME>_<SETTING>`; use `EXTRA` only for uncommon Knex or driver options.

Resolve a separate transient connection (`TeqFw_Db_Back_RDb_Connect$$`) for every non-default connection, initialize it with the selected immutable configuration, and disconnect it through host lifecycle code. Keep the default singleton for the package default connection.

Setup diagnostics include the configured client. SQLite reports its filename;
PostgreSQL and MySQL/MariaDB report database, host, and user even if a SQLite filename
default remains in configuration. Missing or opaque values appear as `(default)`.
Passwords, TLS material, connection URLs, and raw setup errors are excluded from these
logs; initialization still rethrows the original error. Apply the host's secret-handling
policy before logging that error. Successful setup confirms Knex initialization, not
server reachability or authentication.

## DEM Composition

Package attributes use `type.id: "core.identity"` for system identities and `type.id: "core.ref"` for stored references. The host application map owns the single `identityProfile`; packages do not choose its storage representation. A `core.ref` must participate in exactly one relation whose target is the corresponding `core.identity`, receives only that concrete type, and is never generated. Ordinary explicitly typed relations to compatible primary or unique keys remain separate.

Before writing or changing a DEM path, validate every `package` and `entity` key against `^[a-z][a-z0-9]*$`. These keys are lowercase alphanumeric words only: `_`, camelCase, uppercase, whitespace, and hyphens are rejected. This rule is intentionally stricter than the attribute-name rule, so `owner_id` may be an attribute but must not be a package or entity key.

Build a readable logical path through lowercase package segments. A fragment may set a concise declaration-level root, for example:

```json
{
  "version": 2,
  "namespace": "vendor.sales",
  "entity": {"order": {"attr": {}, "index": {}, "relation": {}}},
  "package": {},
  "refs": {},
  "requires": []
}
```

This declares `/vendor/sales/order`; nested `package` entries extend that root. Local relation paths such as `/order` are resolved against the expanded root. External aliases listed in `refs` remain fragment-local and are mapped by the host without root rewriting. The root is logical DEM content and is expanded before composition. It is not inferred from the package name, and it does not reserve a namespace or grant composition privileges. The optional application-map `namespace` is a separate physical table prefix. Physical projection joins all logical path segments with `_`, so the example becomes `vendor_sales_order` without a map prefix. When a compiler reports an invalid name, correct the declaration at its reported canonical path; do not work around validation with a physical-name override or an unrelated map setting.

For direct compiler use, supply:

- trusted fragment envelopes containing `declaration`, `filename`, `fragmentId`, and `packageName`;
- one trusted map envelope;
- one dialect adapter selected for the configured connection.

Handle `DemCompilationError` through its structured `diagnostics` and `warnings`. Diagnose by stable code, canonical path, stage, severity, and provenance rather than matching complete English messages. Assert the successful compilation, derive the selected operation plan or query requirements, and let the operation executor run connection-specific preflight before mutation or query execution.

The loader scans the application and installed-package declarations before compilation, including `@teqfw/db`'s published `etc/teqfw.schema.json` fragment. Do not present test-only inputs such as `testDems` or `testMapRoot` as production integration patterns. Direct compiler callers must pass every selected envelope, including the package-owned fragment when schema history is used.

Identity generation uses the database's native mechanism. The former `allocated`
mode and allocation service are unsupported. Existing databases using that mode need
an explicitly authorized migration/rebuild to native-generated keys; preserve IDs,
relations, and immutable history and restore native sequence state. Declaration edits
alone do not convert columns or drop an existing counter table.

## DEM Path Naming

Choose logical roots from domain concepts; do not automatically mirror npm package names or DI namespaces. Names must be readable and preserve public domain terminology, rather than merely being as short as possible. These are declaration design rules, not additional compiler validation or automatic rewriting.

| Redundant path | Preferred declaration and path |
| --- | --- |
| `/pde/hub/person/person` | `namespace: "pde.hub"` with `entity.person`: `/pde/hub/person` |
| `/pde/hub/auth/authchallenge` | `namespace: "pde.hub.auth"` with `entity.challenge`: `/pde/hub/auth/challenge` |
| `/pde/hub/auth/authsession` | `namespace: "pde.hub.auth"` with `entity.session`: `/pde/hub/auth/session` |
| `/pde/hub/invite/invitation` | For a single primary Invitation, `namespace: "pde.hub"` with `entity.invitation`: `/pde/hub/invitation` |

When the primary entity repeats the last namespace segment, shorten the declaration root by that segment. Review near-duplicates such as `invite/invitation` as well as exact repetitions. Retain qualifiers that distinguish concepts: `emailidentity`, `access/operator`, and `teqfw.db.schema/snapshot` carry useful meaning.

A same-level entity and package may share a name. For example:

```json
{
  "version": 2,
  "namespace": "pde.hub",
  "entity": {"person": {}},
  "package": {
    "person": {"entity": {"profile": {}}}
  }
}
```

This declares the primary `/pde/hub/person` and related `/pde/hub/person/profile`, projected without a map prefix to `pde_hub_person` and `pde_hub_person_profile`. Add grouping packages only for actual related entities; do not add empty groups speculatively. Shortening a DEM path does not transfer fragment ownership or require renaming npm packages, DI tokens, or domain objects. The compiler preserves every declared path segment; do not implement automatic collapsing, physical overrides, or hidden renames.

Before changing an existing path:

1. Audit all selected fragments and the composed target for semantic ownership conflicts and physical-name collisions. Compile the proposed declarations with the host map and selected adapter.
2. Update local relations, external reference aliases and host maps, query paths, tests, and public/private documentation together. Preserve trusted fragment identity and ownership.
3. For an existing database, provide an explicit authorized migration/rebuild plan covering table data, foreign keys, and schema history. Retain the authentic old source compilation and explicitly map renamed entities. Keep immutable historical snapshots intact and record the new target through the schema-history lifecycle. Editing declarations alone does not rename tables or move data; the compiler and rebuild service do not infer renames.

## Application-map Prefix Selection

Omit `namespace` from the application map when one application exclusively owns the database/table space. A minimal map is:

```json
{"version": 2}
```

Set a physical prefix when independent applications share the same database/table space and require distinct table prefixes. Any other exception needs an explicit host deployment requirement. Do not invent future sharing as a reason to add a prefix. Multiple packages contributing DEM fragments to one application still form one application model and do not justify an application-level prefix.

The fragment's `namespace` remains a logical package root. Without a map prefix, all logical package/entity segments still determine the table name: `/pde/hub/person` becomes `pde_hub_person`. An explicitly required map `namespace: "hub"` would instead produce `hub_pde_hub_person`. Neither choice changes fragment-root semantics. A table prefix controls naming; it does not provide database authorization or security isolation.

Changing, adding, or removing the map prefix changes physical table names. For an existing populated database, require an explicit migration/rebuild plan that preserves source data and verifies the target before cutover. Editing the map alone does not rename tables or migrate data. For rebuild across different prefixes, retain the authentic old `sourceCompilation` and compile the new target separately; see [Rebuild](#rebuild).

## Entity-to-table access

Keep database access in logical DEM terms: consumer code must use an entity's logical name and must never hardcode a physical table name. The complete host-owned flow is `DEM map` → `compilation.physical.namespace` → connection resolver configuration → transaction `getTableName(entity metadata)` → physical table name.

Loading and compiling DEM declarations does not configure a connection resolver. After a successful load and before any database access through that connection, the host must apply the compiled map namespace explicitly, including the empty string produced when the map prefix is omitted. Do not skip initialization based on the prefix's truthiness:

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

Install the successful loader result with `schema.setCompilation({compilation})`.
`schema.getCompilation()` synchronously returns the same immutable, authenticated
result for host schema preparation or history operations. It throws before a valid
compilation has been installed; a rejected replacement preserves the prior result.

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
