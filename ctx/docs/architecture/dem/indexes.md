# DEM Index Model And Build Phases

- Path: `ctx/docs/architecture/dem/indexes.md`
- Changed: `20260808`

## Index Shape

```json
{
  "index": {
    "document_embedding_cosine": {
      "kind": "index",
      "method": "postgresql.hnsw",
      "keys": [
        {
          "attr": "embedding",
          "operatorClass": "postgresql.vector_cosine_ops"
        }
      ],
      "predicate": {
        "kind": "call",
        "operator": "core.notNull",
        "args": [{"kind": "attr", "name": "embedding"}]
      },
      "options": {
        "m": 16,
        "ef_construction": 64
      },
      "phase": "afterData"
    }
  }
}
```

## Fields

- `kind` is `primary`, `unique`, or `index`.
- `method` is a required registered method identity when `kind` is `index` and
  is absent for `primary` and `unique` key constraints.
- `keys` is a non-empty ordered array.
- `include` is an optional array of existing attributes not used as key expressions.
- `predicate` is an optional typed boolean expression from `queries.md`.
- `options` is an adapter-validated object; it is never serialized directly as SQL.
- `phase` is required and is `table`, `afterRelations`, or `afterData`.

## Key Shape

Each key contains exactly one of:

```json
{"attr": "email", "order": "asc", "nulls": "last"}
```

```json
{
  "expression": {
    "kind": "call",
    "operator": "core.lower",
    "args": [{"kind": "attr", "name": "email"}]
  },
  "operatorClass": "postgresql.text_pattern_ops"
}
```

`order`, `nulls`, and `operatorClass` are optional and must be supported by the selected method and adapter.
Direct attributes and every attribute referenced by an expression must belong to the indexed entity.

## Constraint Indexes

`primary` and `unique` describe relational key constraints, not merely performance hints.
They obey these rules:

- `phase` is `table`;
- `method` is absent; the adapter uses its native key-constraint mechanism;
- keys are direct attributes, not expressions;
- `predicate` is absent for a relation target because a partial unique index does not prove uniqueness for every referenced row;
- there is at most one primary index per entity;
- referenced relation attributes match one key in the same order.

An ordinary `index` never satisfies foreign-key target uniqueness.

## Build Phases

The physical schema plan uses these phases:

1. capability preflight — prove required runtime features before mutation;
2. tables — create columns plus `table` primary/unique constraints;
3. relations — create foreign keys after every table and target key exists;
4. `afterRelations` indexes — create indexes explicitly required before data work;
5. data — import or transfer rows when the operation includes data;
6. `afterData` indexes — create deferred performance indexes;
7. verification — collect plan and data evidence.

For structure creation without data, phase 5 is empty and `afterData` still executes last.
For rebuild, large or training-dependent indexes belong in `afterData` so row transfer does not maintain them incrementally.

IVFFlat indexes must use `afterData` because they require representative table data for useful construction.
HNSW may use `afterRelations` or `afterData`.
Rebuild declarations should select `afterData` because build cost is lower after
bulk loading; the compiler does not infer a phase.

DEM v1 ordinary indexes decode to method `legacy.defaultIndex` and phase
`table` to preserve established lifecycle behavior.
Each adapter resolves that compatibility-only marker to its previously tested
Knex behavior.
DEM v1 primary and unique indexes decode without a method and with phase
`table`.
DEM v2 declarations always choose a phase explicitly.

## PostgreSQL pgvector Example

For a `core.vector` attribute with PostgreSQL storage `vector`, a cosine HNSW index declares:

- method `postgresql.hnsw`;
- operator class `postgresql.vector_cosine_ops`;
- capability requirements derived by the adapter;
- options `m` and `ef_construction` when non-default tuning is required;
- phase `afterData` for rebuild.

The operator class is not inferred from the query metric after DDL starts.
The compiler verifies that storage, method, operator class, and options form a supported combination.

## Validation

The compiler reports `DEM_INDEX_INVALID` when any cross-field rule fails, including:

- unknown or duplicated attribute;
- empty keys;
- both or neither `attr` and `expression` in one key;
- expression returning an unsupported key type;
- unknown method or operator class;
- incompatible storage/method/operator-class combination;
- unsupported order or null handling;
- unknown included attribute or key/include duplication;
- non-boolean predicate;
- unknown, misspelled, or out-of-range option;
- a constraint index in a late phase;
- a required `afterData` index scheduled before data.

Diagnostics identify the index, failing field, and all declaration provenance.
Builders receive only resolved physical index descriptors.

## Failure Behavior

An index failure fails the schema or rebuild operation unless the request explicitly classifies that index as outside its selected modeled scope.
The DEM itself has no `optional` flag that silently weakens target state.
In a parallel rebuild, the source remains authoritative and the incomplete target remains unaccepted.
In an in-place rebuild, recovery follows the preserved snapshot contract.
