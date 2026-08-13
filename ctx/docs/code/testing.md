# Testing Overview

- Path: `ctx/docs/code/testing.md`
- Changed: `20260813`

## Test Structure

- `test/integration/` — DI graph resolution and database-backed integration.
- `test/mod/` — compiler, adapter, schema, selection, rebuild, and retained compatibility module behavior.
- `test/opt/` — destructive opt-in conformance against disposable PostgreSQL/pgvector and MariaDB/MySQL databases.
- `test/publish/` — npm artifact composition and package-owned consumer-skill publication.
- `test/accept/` — end-to-end persistence scenarios.
- `test/man/` — manual development scenarios not required by the default suite.
- `test/data/` — declarations, maps, and database fixtures.

## Native Test Platform

Tests import suites, cases, and lifecycle hooks from the stable `node:test` API.
The npm scripts invoke the Node.js test runner directly with the files in each layer, without a third-party test framework.
`npm test` runs module, integration, acceptance, and publication layers; `npm run test:manual` remains opt-in.
`npm run test:optin` is the release gate for provisioned PostgreSQL/pgvector and MariaDB/MySQL databases.
It first runs a read-only preflight that requires an explicit ignored project-root `.env`, verifies the selected
server families, confirms that both disposable databases contain no user tables, checks destructive-suite
privileges, and requires pgvector `>= 0.7.0`. The engine-specific destructive suites run only after that preflight
succeeds and can also be invoked through their explicit PostgreSQL and MariaDB scripts.

## Required Verification

- Every source file parses with `node --check`.
- `npm run typecheck` strictly checks the published declaration contract and its representative consumer program.
- Publication tests install the packed layout, type-check named and ambient consumer contracts, and prove that the export map claims neither a runtime root nor public `src/**` subpaths.
- No constructor contains a legacy dependency-token property.
- Every constructor that consumes injected values has a matching export-scoped `__deps__` declaration.
- A DI integration test resolves representative default and named-factory tokens using `@teqfw/di` 2.x.
- DI integration verifies canonical package-metadata discovery for both `TeqFw_Db_` and its production
  `TeqFw_Cfg_` dependency, plus cfg Reader conversion, deep immutability, and malformed structured-value rejection.
- Configuration integration covers the reserved default connection and an independently frozen named connection.
- Opt-in tests load named `pg` and `mariadb` connections from the project-root `.env`; tracked fixtures never contain
  database credentials.
- Automated tests cover DEM composition, schema ordering/conversion, selection, transaction ownership, CRUD, and connection shutdown to the extent supported without external infrastructure.

These checks pass in the current worktree. The separately invoked external-database opt-in release gate also passes
in the provisioned PostgreSQL/pgvector and MariaDB environment.

## DEM v2 Compiler Verification

Add deterministic module suites under `test/mod/Back/Dem/Compile/` matching the compiler units in `dem.md`.
The compiler is incomplete until tests demonstrate:

- unversioned DEM v1 and explicit DEM v2 decode into the documented canonical values;
- unsupported versions and invalid shapes produce stable codes and source pointers;
- every permutation of the same disjoint fragment set produces the same model, provenance shape, diagnostics order, graph, requirements, physical plan, and fingerprint;
- two owners of the same semantic entity, attribute, relation, index, storage, default, or generation produce `DEM_COMPOSITION_OWNER_CONFLICT` with both sources and no winner;
- structural package containers compose only disjoint children;
- capability-set union deduplicates values while retaining every source;
- caller input and source DTOs remain unchanged and the successful result is deeply frozen;
- an arbitrary DTO-shaped object fails successful-result assertion.

Fixture assertions use diagnostic codes, canonical paths, and structured details.
Do not assert full English messages except in a narrow presentation test.

## Logical Validation Matrix

For each error below, include one failing fixture and one nearest valid fixture:

- unknown logical type and invalid type parameters;
- invalid literal/function default, default/generation combination, and `generation.kind: "core.identity"` on a non-integer type;
- unknown local or target relation attribute;
- missing mapped target entity;
- empty and unequal composite relation cardinality;
- positional logical type mismatch and adapter physical mismatch;
- target list absent from primary/unique keys, including an ordinary index and a partial unique index that must not qualify;
- zero or multiple primary keys;
- physical name collision after namespace conversion;
- unsupported storage, method, operator class, option, expression, capability, and deferrability.

One aggregate fixture contains several independent failures and proves that all are returned in deterministic stage/path/code/source order.

## Identity And Reference Type Matrix

The accepted conformance matrix requires that the same package fragment compile under a host-selected identity representation policy; `core.identity` resolves to a concrete type plus generation, and every `core.ref` derives only the mapped `core.identity` target type, never generation or an arbitrary PRIMARY/UNIQUE target. Generated identity primary keys retain provenance, and special-type resolution leaves no unresolved `core.identity` or `core.ref` type in the canonical or physical model. It also requires invalid profiles, ambiguous `core.ref` derivations, and non-identity `core.ref` targets to produce deterministic diagnostics.
Current implementation tests exercise the obsolete role representation; this documentation-only correction does not change them. A separately authorized implementation change must add type-form declarations and update conformance. The SQLite execution suite must verify generated identity primary-key DDL; module conformance must project the same canonical keys and relations through both SQLite and PostgreSQL adapters.

## Legacy Conversion Regression Matrix

The DEM v1 decoder and adapter snapshots must cover every legacy type and option.
In particular:

- `number` with neither precision nor scale keeps legacy integer behavior and emits `DEM_V1_AMBIGUOUS_NUMBER`;
- `number` with both precision and scale stays decimal;
- `number` with only one value keeps legacy decimal builder behavior and emits `DEM_V1_PARTIAL_DECIMAL`;
- `id` and `ref` share a logical compatibility signature while adapters preserve and verify their legacy physical forms;
- `json` retains legacy physical behavior;
- `string.options.length` changes the emitted bounded string type;
- a literal `date` default remains literal;
- only legacy `default: "current"` becomes the registered current-date/current-timestamp function;
- an ordinary legacy index uses `legacy.defaultIndex` and matches each adapter's
  previous physical behavior, while DEM v2 rejects that marker;
- integer tiny/unsigned, date-only, enum values, binary length, nullable, comments, actions, and composite keys retain expected physical descriptors;
- legacy filter values `0`, `false`, and the empty string survive conversion.

Run emitted SQL or a real SQLite/PostgreSQL table-catalog assertion where SQL-string snapshots are insufficient.

## Graph And Plan Matrix

Graph tests cover an empty graph, one DAG, one self-reference, one two-entity cycle, several independent cycles, and a cycle with outgoing acyclic dependencies.
Assert deterministic strongly connected components and relation provenance.

Plan tests prove:

- tables and primary/unique constraints precede every relation;
- schema create/drop supports relation cycles without recursive weighting;
- acyclic transfer uses dependency-first order;
- cyclic transfer without a strategy returns `DEM_DEPENDENCY_CYCLE_UNPLANNED` before source reads or target writes;
- `postgresql.deferredConstraints` accepts only cycles whose every internal edge is declared deferred and executes inside one owned transaction;
- `afterRelations` and `afterData` indexes execute in their documented phases;
- an IVFFlat plan outside `afterData` fails compilation;
- required late-index failure produces a failed operation and evidence.

## Selection v2 Matrix

Add shared DTO tests and backend compiler tests for attribute, value, and call nodes.
Cover:

- legacy comparisons, null tests, and nested boolean conditions decoded through core operators;
- the existing null-test fall-through regression so `NULL`/`NOT_NULL` never emit a second comparison with an undefined operator;
- unknown attributes/operators, wrong arity, incompatible argument/result types, and forbidden contexts;
- bound-value behavior with hostile strings proving there is no SQL concatenation;
- filters, derived projection aliases, expression ordering, limit, offset, and count-query removal rules;
- nearest-neighbour ascending order and positive-limit requirements;
- exact vector distance query without an approximate index;
- query execution options limited to adapter allow-lists and one transaction.

## Database Strategy

Default automated database tests use SQLite so they are deterministic and do not require an external server.
PostgreSQL and MySQL/MariaDB-specific paths require opt-in integration environments.

## Acceptance Rule

The DI 2.x migration is not complete if only source syntax changes.
The test suite must exercise resolution through the DI 2.x container and at least one real Knex database path.

## Rebuild Verification Requirements

A unified rebuild implementation is incomplete until automated tests demonstrate:

- in-place rebuild refuses destructive replacement when preservation is required but no verified snapshot exists;
- explicitly authorized empty recreation remains possible;
- a parallel target can be created without modifying its source;
- rows are transferred in dependency order and engine-specific sequence state is restored where supported;
- cyclic rows fail before transfer unless an explicit tested strategy is selected;
- explicit transformations are invoked and identified in the result;
- incompatible or failed required rows prevent a successful rebuild result;
- evidence reports target identity, processed tables, row counts, failures, and transaction outcomes;
- `afterData` index identities, outcomes, and failures are included in evidence;
- an unaccepted target never becomes an implicit source replacement;
- externally supplied source or outer transactions are not committed or rolled back by nested transfer code.

SQLite may provide deterministic acceptance coverage for the generic workflow.
PostgreSQL and MariaDB/MySQL suites are required for their engine-specific sequence, session, and DDL behavior before claiming equivalent rebuild support.

## PostgreSQL And pgvector Matrix

The opt-in PostgreSQL suite is a release requirement before pgvector support is claimed.
It provisions the extension outside the test subject and covers:

- missing-extension and unsupported-version preflight with zero schema/query side effects;
- `vector`, `halfvec`, `bit`, and `sparsevec` physical columns plus canonical codec round trips;
- wrong dimensions, NaN/infinity, malformed bit strings, and invalid sparse entries;
- L2, negative inner product, cosine, L1, Hamming, and Jaccard operator/type combinations;
- every HNSW and IVFFlat storage/operator-class combination listed in `../environment/postgresql.md`;
- rejected cross-matrix combinations and unknown/out-of-range index options;
- HNSW `m`/`ef_construction`, IVFFlat `lists`, transaction-local `ef_search`/`probes`, and no global setting leak;
- index creation after transferred rows, physical catalog agreement, and nearest-neighbour result ordering;
- bound query vectors and quoted generated identifiers.

Approximate-index tests assert structural use and result ordering but do not promise perfect recall.
Exact-scan tests provide deterministic distance correctness.

## Boundary Verification

Tests must confirm that core rebuild code does not discover migration versions, infer renames, generate arbitrary incremental `ALTER` plans, perform application cutover, or resolve transformation implementations through an unrestricted container lookup.

## ESM Conformity

`teqfw-esm-validator src --profile base` is a release gate and must report no violations.
Interface publication units declare `@interface` at module level. Concrete behavior is defined through constructor closures rather than prototype methods.
Callable JSDoc contracts mirror actual parameters, DI dependency names, and asynchronous return values.
