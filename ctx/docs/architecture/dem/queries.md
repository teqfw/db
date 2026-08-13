# Typed Query Expressions

- Path: `ctx/docs/architecture/dem/queries.md`
- Changed: `20260808`

## Purpose

The common query contract must express operations supported by logical and dialect types without expanding one closed comparison enum.
The target contract uses a typed expression tree plus registered namespaced operators.

## Expression Nodes

An expression is exactly one of these shapes.

Attribute reference:

```json
{"kind": "attr", "name": "embedding"}
```

Bound value:

```json
{
  "kind": "value",
  "value": [0.1, 0.2, 0.3],
  "type": {
    "id": "core.vector",
    "params": {"dimensions": 3, "element": "float", "sparse": false}
  }
}
```

Registered call:

```json
{
  "kind": "call",
  "operator": "postgresql.pgvector.cosineDistance",
  "args": [
    {"kind": "attr", "name": "embedding"},
    {"kind": "value", "value": [0.1, 0.2, 0.3]}
  ]
}
```

There is no raw SQL, identifier, Knex callback, or JavaScript function node.
Values are always passed to Knex as bindings.

## Selection v2

```json
{
  "version": 2,
  "where": {
    "kind": "call",
    "operator": "core.eq",
    "args": [
      {"kind": "attr", "name": "ownerId"},
      {"kind": "value", "value": 42}
    ]
  },
  "select": [
    {
      "as": "distance",
      "expression": {
        "kind": "call",
        "operator": "postgresql.pgvector.cosineDistance",
        "args": [
          {"kind": "attr", "name": "embedding"},
          {"kind": "value", "value": [0.1, 0.2, 0.3]}
        ]
      }
    }
  ],
  "orderBy": [
    {
      "expression": {
        "kind": "call",
        "operator": "postgresql.pgvector.cosineDistance",
        "args": [
          {"kind": "attr", "name": "embedding"},
          {"kind": "value", "value": [0.1, 0.2, 0.3]}
        ]
      },
      "direction": "asc"
    }
  ],
  "limit": 10,
  "offset": 0,
  "execution": {
    "postgresql.hnsw.ef_search": 100
  }
}
```

`where` must return `core.boolean`.
`select` expressions require unique result aliases and add derived values to the returned row shape.
`orderBy` accepts attribute or scalar expressions.
`limit` and `offset` are non-negative integers; a nearest-neighbour request requires a positive limit.
`execution` contains allow-listed adapter options and is empty by default.

The repeated vector value in the JSON example is a declarative illustration.
An in-process API may use one bound parameter identity internally, but the compiled SQL must retain parameter binding.

## Operator Registry

Every operator entry defines:

- stable namespaced identity;
- argument count and accepted logical type signatures;
- result logical type;
- allowed contexts: filter, projection, ordering, index expression, or predicate;
- derived capability requirements;
- dialect compiler identity;
- optional compatible index operator classes.

Core entries include boolean composition, equality/ordering comparisons, null tests, and documented scalar functions such as lowercase text.
PostgreSQL pgvector entries include L2 distance, negative inner product, cosine distance, L1 distance, Hamming distance, and Jaccard distance for compatible vector storage.

An operator identifier is not SQL text.
Unknown identity, wrong arity, invalid input type, vector dimension mismatch, or use in a forbidden context produces `DEM_EXPRESSION_INVALID`.

## Nearest-Neighbour Semantics

A nearest-neighbour query orders a supported distance expression ascending and applies a positive limit.
It works without an approximate index as an exact scan.
An HNSW or IVFFlat index may accelerate it only when storage, distance operator, operator class, expression shape, and predicate are compatible.

The PostgreSQL negative-inner-product operator is named explicitly because the database operator returns the negative inner product for ascending index scans.
Callers that need a positive similarity value request a separate registered projection expression; they must not reverse nearest-neighbour ordering accidentally.

Query options such as HNSW search effort are transaction-local adapter behavior.
The adapter emits allow-listed `SET LOCAL` operations only inside the transaction executing the query and restores behavior automatically at transaction end.

## Validation And Execution Flow

1. Validate Selection v2.
2. Resolve every attribute through the schema/query mapping contract.
3. Infer or validate every value and expression logical type.
4. Resolve operators through core and selected-adapter registries.
5. Derive capability requirements and run connection preflight.
6. Compile identifiers through Knex quoting and values through bindings.
7. Apply transaction-local execution options.
8. Execute the query and map only declared base and derived result fields.

Failure before step 8 has no query side effect.
An unsupported operator never falls back to a plain comparison or raw Knex escape hatch.
