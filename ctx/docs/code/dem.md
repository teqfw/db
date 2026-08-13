# DEM v2 Implementation Mapping

- Path: `ctx/docs/code/dem.md`
- Changed: `20260813`

## Authority And Status

This document maps the accepted architecture in `../architecture/dem/` to source work.
It does not redefine declaration or validation meaning.
The current worktree implements the mapped modules and removes the legacy composition/conversion/ordering executors.
The real PostgreSQL/pgvector and MariaDB opt-in suites pass in the provisioned test environment.

Implement in the delivery order below.

## Identity And Reference Type Implementation Gap

The accepted cognitive model declares `type.id: "core.identity"` and `type.id: "core.ref"`. `identityProfile` resolves `core.identity` to a concrete type plus generation policy; each `core.ref` derives only a compatible concrete type from exactly one relation-resolved `core.identity` target. Both unresolved types are removed before canonical validation and physical projection. Relations and external map entries remain target authority.

Current implementation mismatch: `DecodeV2.mjs` and `MapRefs.mjs` still accept and resolve the obsolete `attr.role` representation, including reference derivation from general relation targets. This documentation-only correction does not change source, schemas, validators, or tests. A separately authorized implementation change must migrate decoding, validation, provenance, canonicalization, and conformance from roles to special logical types, enforce `core.ref` to `core.identity`, and preserve the current generated single-column primary-key materialization and external mapping behavior.

Do not begin PostgreSQL vector DDL by adding `vector` to `src/Back/Enum/Dem/Type/Attr.mjs`; that would bypass the compiler, capability, storage, index, codec, and query contracts.

## Removed Legacy Defect To Target Owner

| Legacy evidence | Former behavior | Target owner |
| --- | --- | --- |
| `src/Shared/Util/Deep.mjs`, `src/Back/Dem/Load/A/Norm.mjs` | Scalars overwrite, arrays concatenate, and origin is lost | `Back/Dem/Compile/A/Compose.mjs` plus provenance DTOs |
| `src/Back/Dto/Dem/Entity/Attr.mjs` | Any string is accepted as an attribute type | Core/provider type registries and `Validate.mjs` |
| `src/Back/RDb/Schema/A/Convert.mjs` | Logical type, generation, and storage are conflated | Dialect `resolveType`, `resolveDefault`, and `resolveGeneration` |
| `src/Back/RDb/Schema/A/Builder.mjs` | Computed Knex methods, ignored string length, and date-default precedence defect | Adapter column executor with resolved descriptor tests |
| `src/Back/RDb/Schema/A/Order.mjs` | Cycles are logged and recursive weights still produce an order | `Graph.mjs` plus operation-specific `Plan.mjs` |
| `src/Back/Dto/Dem/Entity/Index.mjs`, `src/Back/Dto/RDb/Index.mjs` | Index is only type plus attributes/columns | DEM v2 and physical full-index DTOs |
| `src/Shared/Enum/Filter/Func.mjs`, `src/Back/Mod/Selection.mjs` | Closed comparison enum cannot represent distance ordering | Selection v2 decoder, expression registry, and expression compiler |

## Target Source Map

Use these units unless an existing exact package convention requires a same-responsibility rename.
Changing responsibility boundaries requires updating `../architecture/dem/` first.

| Target path | One responsibility |
| --- | --- |
| `src/Back/Dem/Compile.mjs` | Side-effect-free compile orchestration and aggregate failure |
| `src/Back/Dem/Compile/A/DecodeV1.mjs` | Expand unversioned legacy syntax without changing physical meaning |
| `src/Back/Dem/Compile/A/DecodeV2.mjs` | Validate v2 declaration shape and insert canonical defaults |
| `src/Back/Dem/Compile/A/Compose.mjs` | Single-owner semantic insertion and explicit capability-set union |
| `src/Back/Dem/Compile/A/MapRefs.mjs` | Owner-scoped external mapping and host-resolved identity/ref type canonicalization with provenance |
| `src/Back/Dem/Compile/A/Validate.mjs` | Logical type, default, generation, index, and relation validation |
| `src/Back/Dem/Compile/A/Graph.mjs` | Deterministic adjacency, strongly connected components, and topological order |
| `src/Back/Dem/Compile/A/Fingerprint.mjs` | Canonical serialization and versioned deterministic fingerprint |
| `src/Back/Dem/Registry/Core.mjs` | Frozen core type/default/generation/expression definitions |
| `src/Back/Dto/Dem/Compile/Source.mjs` | Trusted source record |
| `src/Back/Dto/Dem/Compile/Diagnostic.mjs` | Structured diagnostic shape |
| `src/Back/Dto/Dem/Compile/Result.mjs` | Immutable successful result |
| `src/Back/Dto/Dem/Compile/Graph.mjs` | Entity graph, order, and cycle components |
| `src/Back/Api/RDb/Dialect.mjs` | Adapter interface JSDoc only |
| `src/Back/RDb/Dialect/Knex.mjs` | Shared safe Knex helpers, identifier/value binding, no dialect decisions |
| `src/Back/RDb/Dialect/Postgresql.mjs` | PostgreSQL core registries, projection, preflight, codecs, and execution |
| `src/Back/RDb/Dialect/Postgresql/PgVector.mjs` | pgvector storage/index/operator registries and value codecs |
| `src/Back/RDb/Dialect/Mysql.mjs` | Existing MySQL/MariaDB behavior expressed as validated adapter entries |
| `src/Back/RDb/Dialect/Sqlite.mjs` | Existing SQLite behavior expressed as validated adapter entries |
| `src/Back/RDb/Schema/A/Plan.mjs` | Phase plan from a successful physical compilation |
| `src/Back/RDb/Schema/A/Builder.mjs` | Execute plan operations only by delegating to selected adapter |
| `src/Shared/Dto/Query/Expression.mjs` | Shared attr/value/call expression DTOs |
| `src/Shared/Dto/Query/Selection.mjs` | Selection v2 DTO |
| `src/Back/Mod/Expression.mjs` | Type-check and compile registered query/index expressions |
| `src/Back/Mod/Selection.mjs` | Decode legacy selection or orchestrate Selection v2 application |

Keep structural DTO classes separate from factories and use export-scoped `__deps__`.
Provider registries are explicit injected values; compiler/executor code must not resolve the DI container dynamically.

## Compile Contract

`TeqFw_Db_Back_Dem_Compile` exposes one async-compatible function-form method:

```js
/**
 * @param {object} input
 * @param {ReadonlyArray<FragmentEnvelope>} input.fragments
 * @param {MapEnvelope} input.mapEnvelope
 * @param {TeqFw_Db_Back_Api_RDb_Dialect} input.adapter
 * @returns {Promise<CompilationResult>}
 * @throws {DemCompilationError}
 */
this.exec = async function ({fragments, mapEnvelope, adapter}) {};
```

The method performs exactly this order:

1. Copy and sort fragment envelopes by `fragmentId`, then `filename`; never mutate input.
2. Decode each parsed input as unversioned v1 or explicit v2 while deriving source pointers from its tree path.
3. Compose semantic nodes with no conflict winner and build provenance.
4. Resolve map entries using relation-owner identity and the trusted map envelope.
5. Validate the complete logical model and canonicalize registered values.
6. Build graph, topological order, and strongly connected components.
7. Ask the selected adapter to resolve all physical types, defaults, generation, indexes, relations, operators used by schema expressions, and derived requirements.
8. Sort diagnostics using the normative order in `../architecture/dem/validation.md`.
9. If any error exists, throw one aggregate error with diagnostics and no usable model/physical fields.
10. Canonically serialize and fingerprint the valid logical/physical target, deep-freeze the result, brand it as successful, and return it with warnings.

The compiler must produce the same canonical value and diagnostic order for all permutations of the same non-conflicting envelope set.

## Successful-Result Enforcement

`Compile.mjs` owns a private `WeakSet` of successful result objects and exposes an injected `assertResult({value})` function to schema, transfer, and query planners.
The function rejects arbitrary DTO-shaped objects.
Freeze nested model, graph, provenance, requirement, physical, and warning values before branding.

Do not expose the `WeakSet`, a forgeable public boolean such as `validated: true`, or a builder API that accepts the old normalized DTO while claiming DEM v2 validation.
During migration, a legacy output facade may be derived from a successful compilation result for old consumers; it is read-only and never becomes an independent source of truth.

## Composition Implementation

`Compose.mjs` walks the decoded schema, not arbitrary objects.
Implement explicit handlers for package, entity, attribute, index, relation, storage, default, generation, and `requires`.

- Structural package handlers create/reuse path containers.
- Semantic handlers call one `claim({canonicalPath, node, source})` helper.
- `claim` records the first source only provisionally; a second distinct owner adds `DEM_COMPOSITION_OWNER_CONFLICT` with both sources and marks the path invalid.
- No invalid path is emitted into a successful model.
- `requires` uses a set keyed by validated capability identity and accumulates source records.
- Arrays are copied as complete values; no handler calls `deep.merge`.

Keep `src/Shared/Util/Deep.mjs` only for non-DEM consumers that still require its documented behavior.
Remove it from DEM compiler dependencies after cutover.

## Logical Validation Implementation

Build entity and key registries before validating relations so all endpoints are addressable independent of declaration order.
Then perform these passes:

1. resolve `core.identity` to type plus generation and `core.ref` to type only from exactly one `core.identity` target, then validate type/default/generation and compute logical compatibility signatures;
2. validate index attributes/expressions, primary count, constraint-key shape, and phase;
3. validate relation local and target existence/cardinality;
4. compare positional logical signatures and target ordered unique key for ordinary relations; enforce the `core.ref` to `core.identity` invariant separately;
5. run adapter physical resolution and compare positional physical compatibility;
6. validate physical name uniqueness;
7. build graph and attach cycle provenance.

Continue after an independent failure.
Skip only checks whose inputs are missing or already invalid, and avoid duplicate cascade diagnostics for the same root failure.

Use registry-backed enum casting in DTO factories.
Unknown type, method, operator class, option, default function, generation, and query operator values remain present only long enough to create diagnostics; they never reach a builder.

## Graph And Plan Implementation

`Graph.mjs` uses a deterministic strongly-connected-component algorithm such as Tarjan with entity paths and adjacency lists sorted lexicographically.
Return:

- `entities` — sorted entity paths;
- `edges` — relation-identified directed edges with provenance;
- `topological` — dependency-first order for acyclic components;
- `cycles` — self-loop or multi-entity components with internal relation identities.

`Plan.mjs` does not reuse recursive weights.
It emits phases in this exact order: preflight, tables/key constraints, relations, `afterRelations` indexes, data when requested, `afterData` indexes, verification.
Schema phases accept cycles.
Transfer planning rejects cycles unless the request selects a strategy whose adapter predicate validates every cyclic edge.

## Adapter Implementation Rules

Each adapter is a frozen component with explicit registries and the methods in `../architecture/dem/dialects.md`.
Add `encodeValue({column, value})` and `decodeValue({column, value})` for CRUD, query binding, export, import, and transfer.

- A storage registry entry maps one validated logical signature to one immutable physical descriptor.
- A builder dispatches on adapter-owned registry entries, never declaration strings.
- Identifiers use Knex/driver quoting.
- Data values use bindings or driver values.
- SQL keywords, method names, physical type names, and operator classes come only from frozen allow-list entries.
- Numeric DDL options may be rendered only after integer/range validation when the database cannot bind DDL parameters.
- `preflight` is read-only and returns capability evidence plus diagnostics.
- Provisioning is not an adapter side effect of compile, preflight, schema build, or query.

For basic columns, verify argument forwarding individually: `core.string.length` reaches the Knex string builder; decimal precision/scale remain decimal; date/datetime literal defaults remain literal; only registered current-date/current-timestamp functions use `knex.fn.now()` or adapter-equivalent behavior.

## PostgreSQL pgvector Value Shapes

Use one canonical JavaScript representation per storage family:

- `vector` and `halfvec` — finite `number[]` of exactly `dimensions` items;
- `bit` — a string of exactly `dimensions` characters, each `0` or `1`;
- `sparsevec` — `{dimensions, entries}`, where `entries` is an ascending array of unique `{index, value}` records, indices are one-based within dimensions, and values are finite non-zero numbers.

The codec validates before converting to PostgreSQL text/binding format and reconstructs the same canonical representation on read.
It rejects NaN, infinities, wrong dimensions, duplicate/out-of-order sparse indices, zero sparse entries, and incompatible storage.

pgvector DDL/query compilation follows `../environment/postgresql.md`.
When Knex cannot bind a utility-statement token, obtain the fixed method/type/operator-class text from the registry and format only already-validated numeric options; never interpolate fragment or selection strings.

## Selection v2 Implementation

Decode legacy DTOs into the attr/value/call tree before applying a query.
Do not maintain separate comparison execution logic after cutover.

`Expression.mjs` receives `{expression, entitySchema, adapter, context, knex}` and returns `{logicalType, knexExpression, requirements}` or diagnostics.
Resolve attribute names through the existing query mapping contract.
Infer an untyped value only from a registered operator argument; otherwise require its logical type.

For nearest-neighbour queries:

1. validate vector storage and query value dimensions;
2. resolve distance operator and capability;
3. require ascending order and a positive limit for nearest-neighbour semantics;
4. compile a bound distance expression;
5. apply transaction-local allow-listed execution options;
6. allow exact execution without an approximate index;
7. expose derived distance only under its declared result alias.

Count queries retain filters but omit derived projection, ordering, pagination, and execution options that do not affect filtering.

## Delivery Stages

Each stage is a valid operating model and ends with passing tests before the next begins.
Do not enable two mutation paths for one request.

| Stage | Model change | Preserved invariants | Verification | Rollback | New transition risk |
| --- | --- | --- | --- | --- | --- |
| 1. Compiler foundation | Add diagnostics, provenance, registries, decoders, composition, validation, graph, and result branding; production execution remains legacy | Existing v1 runtime behavior; compiler is side-effect free | Fixture compile tests and permutation determinism | Remove unreachable target modules | Shadow compiler may reveal failures not yet enforced |
| 2. V1 compiler cutover | `Back/Dem/Load.mjs` uses compiler for v1 and derives legacy read facade | One canonical model; current public v1 shape remains readable | Existing suite plus physical descriptor/SQL snapshots | Restore legacy loader before any v2 declarations are accepted | Existing ambiguous/conflicting fragments may now fail |
| 3. Adapter/schema cutover | Schema service consumes successful physical plan; old Convert/Order no longer authoritative | Existing v1 physical behavior except documented bug fixes; no partial model execution | SQLite default suite, opt-in PostgreSQL/MySQL, length/default/cycle tests | Restore old schema executor only for v1 fingerprints and empty test databases | DDL differences; never first deploy on irreplaceable state |
| 4. Index phases | Full index DTO and plan phases drive structure/rebuild | Key constraints precede FKs; late index failure fails target | Phase-order and rebuild evidence tests | Disable late-index execution before target acceptance; rebuild target from source | Partial target may contain data without late indexes |
| 5. Selection v2 | Legacy selection decodes to typed expressions; v2 becomes available | Schema-approved attributes and bound values | Legacy query parity, injection rejection, type/arity/count tests | Route legacy requests through retained decoder/compiler version | Query plan/performance changes |
| 6. PostgreSQL pgvector | Enable vector storage/codecs/operators/HNSW/IVFFlat after preflight | Extension is explicit; non-PostgreSQL paths unchanged | Opt-in matrix in `testing.md` and catalog inspection | Remove capability from target DEM and rebuild an unaccepted target | Approximate indexes change recall/performance, not logical exactness |
| 7. Cleanup | Remove DEM dependencies on deep merge, unchecked Convert dispatch, recursive weights, and duplicate legacy query executor | Compiler and adapters are sole source of execution truth | Dependency search, full test suite, ESM validator | Revert cleanup commit while compatibility facade remains | Temporary facade can become permanent if removal criteria are ignored |

Production schema/data rollout is external to these code stages.
Exercise new DDL first on disposable or separately provisioned targets; rollback of destructive in-place DDL depends on the rebuild snapshot, not a code revert.

## Temporary Compatibility Removal Criteria

Remove a legacy execution path only when:

- every unversioned fixture compiles through DecodeV1 with expected physical descriptors;
- no schema, transfer, or query executor accepts an unbranded normalized DTO;
- public compatibility tests pass through the derived facade;
- PostgreSQL/MySQL/SQLite behavior claimed by the package has adapter coverage;
- no source dependency from DEM compilation reaches `deep.merge`;
- Selection legacy tests execute through the expression compiler;
- the removal is called out in release compatibility notes when it changes a public surface.

## Forbidden Shortcuts

- Do not add a declaration type without a logical registry entry, adapter storage rule, capability derivation, codec, and tests.
- Do not expose arbitrary Knex `specificType`, index method, operator class, predicate callback, raw expression, or session setting to JSON callers.
- Do not downgrade a diagnostic to logging to preserve an invalid fixture.
- Do not infer relation compatibility only from equal attribute counts.
- Do not treat an ordinary or partial unique index as a universal FK target key.
- Do not topologically flatten a strongly connected component and call the result safe transfer order.
- Do not build an IVFFlat index before data or report success after a required late-index failure.
- Do not mutate, commit, or roll back a caller-owned outer transaction.

## Definition Of Done

DEM v2 implementation is complete only when every target module responsibility has automated verification, the current v1 suite passes through the compatibility decoder, invalid distributed models fail with deterministic aggregated provenance, all execution paths require a successful result and preflight, PostgreSQL pgvector passes its opt-in matrix, `npm test` and the ESM validator pass, and `src/Back/Dem/` no longer uses generic deep merge as composition.
