# PostgreSQL And pgvector Runtime

- Path: `ctx/docs/environment/postgresql.md`
- Changed: `20260809`

## Status

This document defines runtime requirements for the PostgreSQL adapter.
The current worktree implements the adapter, read-only capability preflight, pgvector schema model, codecs, indexes, and typed vector queries.
Module conformance passes, but release-level runtime conformance is not yet established because the current environment lacks usable opt-in PostgreSQL credentials; support must not be claimed complete until `npm run test:optin` passes.

## Adapter Selection

A PostgreSQL Knex client selects the PostgreSQL adapter through the connection/composition contract.
Before dependent work, preflight verifies that the connection is PostgreSQL and that the compiled adapter identity matches it.
Client aliases and exact Knex metadata used for this selection must be verified against the installed Knex version during implementation.

The adapter supports PostgreSQL core types only through explicit registry entries.
PostgreSQL arrays, ranges, multiranges, network, full-text, geometric, user-defined, and other native types are not automatically supported merely because PostgreSQL or Knex accepts them.
Each added family requires a logical/provider type entry, storage rules, capabilities, query behavior where applicable, and tests.

## pgvector Capability

All pgvector storage, indexes, and distance queries derive the requirement `postgresql.extension.vector`.
Read-only preflight checks `pg_extension` for extension name `vector`, records the installed version, and validates every requested registry feature against that version.

If the extension is absent or too old for a requested feature, preflight returns `DEM_CAPABILITY_UNAVAILABLE` before DDL or query execution.
The schema builder does not run `CREATE EXTENSION`.
An authorized operator provisions the extension once in each target database and reruns preflight.

The adapter must not hard-code limits from a newer pgvector release for an older installed release.
Version-specific storage dimension, index dimension, option, and operator support belongs to adapter registry data and tests.

The initial registry baseline is pgvector `>= 0.7.0` because the declared
storage-family and metric matrix depends on features introduced by that
release.
Preflight rejects an older installed version whenever the compiled model
requires pgvector.
Supporting a narrower or older feature set requires a separately versioned
registry and its own conformance tests; it is not inferred at runtime.

## Vector Storage Matrix

| DEM logical value | PostgreSQL storage | Physical form | Required compatibility |
| --- | --- | --- | --- |
| Dense float vector | `vector` | `vector(dimensions)` | `element: "float"`, `sparse: false` |
| Dense float vector with half-precision storage | `halfvec` | `halfvec(dimensions)` | `element: "float"`, `sparse: false`; precision loss is explicit in storage |
| Dense bit vector | `bit` | `bit(dimensions)` | `element: "bit"`, `sparse: false` |
| Sparse float vector | `sparsevec` | `sparsevec(dimensions)` | `element: "float"`, `sparse: true` |

Dimensions come from `core.vector.params.dimensions` and are included in the physical descriptor.
The adapter validates positive dimensions, storage compatibility, installed-version limits, bound query-vector dimensions, and import values before execution.
It never stores a vector as JSON as fallback.

## Distance Operators

The adapter registers these logical query operations and compiles them to pgvector operators only after type validation:

| Registry operation | pgvector operator | Accepted storage |
| --- | --- | --- |
| `postgresql.pgvector.l2Distance` | `<->` | `vector`, `halfvec`, `sparsevec` |
| `postgresql.pgvector.negativeInnerProduct` | `<#>` | `vector`, `halfvec`, `sparsevec` |
| `postgresql.pgvector.cosineDistance` | `<=>` | `vector`, `halfvec`, `sparsevec` |
| `postgresql.pgvector.l1Distance` | `<+>` | `vector`, `halfvec`, `sparsevec` |
| `postgresql.pgvector.hammingDistance` | `<~>` | `bit` |
| `postgresql.pgvector.jaccardDistance` | `<%>` | `bit` |

Nearest-neighbour ordering uses ascending distance plus a positive limit.
The negative-inner-product name is intentional: the pgvector operator returns the negative value to support ascending index scans.
All query vector values use bindings and dimension validation.

## Approximate Index Matrix

The initial adapter target supports this verified matrix:

| Method | Storage | Operator classes |
| --- | --- | --- |
| `postgresql.hnsw` | `vector` | `vector_l2_ops`, `vector_ip_ops`, `vector_cosine_ops`, `vector_l1_ops` |
| `postgresql.hnsw` | `halfvec` | `halfvec_l2_ops`, `halfvec_ip_ops`, `halfvec_cosine_ops`, `halfvec_l1_ops` |
| `postgresql.hnsw` | `sparsevec` | `sparsevec_l2_ops`, `sparsevec_ip_ops`, `sparsevec_cosine_ops`, `sparsevec_l1_ops` |
| `postgresql.hnsw` | `bit` | `bit_hamming_ops`, `bit_jaccard_ops` |
| `postgresql.ivfflat` | `vector` | `vector_l2_ops`, `vector_ip_ops`, `vector_cosine_ops` |
| `postgresql.ivfflat` | `halfvec` | `halfvec_l2_ops`, `halfvec_ip_ops`, `halfvec_cosine_ops` |
| `postgresql.ivfflat` | `bit` | `bit_hamming_ops` |

Registry identities prefix physical operator classes with `postgresql.`, while generated SQL uses the physical name after allow-list lookup.
Unsupported combinations fail compilation; the adapter does not substitute another metric or index method.

HNSW index options are allow-listed as positive integers `m` and `ef_construction`.
IVFFlat index option `lists` is a positive integer.
Unknown options are errors.
IVFFlat phase is always `afterData`; HNSW phase is `afterRelations` or
`afterData`.
Rebuild declarations should select `afterData` explicitly; the adapter does not
infer a phase.

## Query Execution Options

Selection v2 may request allow-listed transaction-local options, initially:

- `postgresql.hnsw.ef_search` — positive integer;
- `postgresql.ivfflat.probes` — positive integer.

The adapter applies them with parameter-validated `SET LOCAL` semantics inside the query transaction.
Global `SET`, arbitrary setting names, and string-concatenated values are forbidden.
Additional iterative-scan options require version-gated registry entries before support is claimed.

## DDL And Quoting

Knex `specificType` may be used by the adapter for registered physical column types.
Indexes whose full method/operator-class/options shape is not safely expressible through the Knex table builder may use adapter-owned parameterized SQL with identifiers quoted through the PostgreSQL/Knex mechanism.
Declaration values never become raw SQL tokens without registry resolution.

## Required Runtime Verification

PostgreSQL integration tests require an opt-in database with pgvector installed.
Tests must cover:

- missing-extension preflight with no DDL;
- all four storage families and dimension rejection;
- each supported distance operator with bound values;
- the HNSW and IVFFlat matrix, options, and invalid combinations;
- `afterData` ordering on a populated rebuild target;
- transaction-local query options;
- exact nearest-neighbour behavior without an approximate index;
- physical plan and database-catalog agreement.

## External Authorities

- [pgvector documentation](https://github.com/pgvector/pgvector) defines extension installation, storage families, distance operators, operator classes, approximate index methods, and tuning behavior.
- [PostgreSQL data types](https://www.postgresql.org/docs/current/datatype.html) defines the broader native and extensible type space that adapter registries must represent explicitly.
- [Knex schema builder](https://knexjs.org/guide/schema-builder.html) documents generic, `specificType`, and partial-index mechanisms used only behind the adapter boundary.
