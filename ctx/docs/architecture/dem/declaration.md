# DEM And Map Declarations

- Path: `ctx/docs/architecture/dem/declaration.md`
- Changed: `20260808`
- Legacy Sources: `doc/schema.md`, `doc/map.md`

## Version Rule

An unversioned `etc/teqfw.schema.json` is DEM v1.
An explicit integer `version: 2` selects DEM v2.
No other version is accepted.
The compiler decodes both inputs into the same canonical model before composition.

New declarations must use DEM v2.
The v1 decoder is a compatibility boundary, not a second canonical model.

The root map follows the same rule: an unversioned map uses legacy syntax and `version: 2` selects the v2 contract below.

All declaration and map objects are closed.
An unknown field is `DEM_DECLARATION_SHAPE_INVALID`.
Provider-owned objects such as `params`, `options`, and query `execution` are
also closed by the selected registry version, so a misspelled option fails
during compilation.

## DEM v2 Top-Level Shape

```json
{
  "version": 2,
  "requires": [],
  "entity": {},
  "package": {},
  "refs": {}
}
```

- `requires` is a set of namespaced capability identifiers.
- `entity` contains entities at the current package level.
- `package` contains recursively nested package declarations.
- `refs` declares external paths used by the fragment before application mapping.

The only array with cross-fragment union semantics is `requires`.
The compiler deduplicates and sorts capability identifiers while retaining all contributing provenance.
Every other array is a complete value owned by its containing semantic node.

## Entity And Package

```json
{
  "entity": {
    "document": {
      "comment": "Stored document",
      "attr": {},
      "index": {},
      "relation": {}
    }
  },
  "package": {
    "search": {
      "comment": "Search package",
      "entity": {},
      "package": {}
    }
  }
}
```

Entity, attribute, index, and relation keys are their local names.
Canonical entity identity is the normalized slash-delimited package path plus entity name.
Names are normalized once during decoding; two source names that normalize to the same identity conflict.

Package containers may be co-declared only as structural path segments.
A non-empty package metadata field such as `comment` is a semantic node and has one owner.

## Attribute Contract

```json
{
  "attr": {
    "embedding": {
      "comment": "Search embedding",
      "type": {
        "id": "core.vector",
        "params": {
          "dimensions": 1536,
          "element": "float",
          "sparse": false
        }
      },
      "storage": {
        "postgresql": {
          "type": "vector",
          "params": {}
        }
      },
      "nullable": false
    }
  }
}
```

An attribute supports:

- `comment` — descriptive text;
- `type` — required logical type identity and parameters;
- `storage` — optional map from dialect identity to physical storage binding;
- `nullable` — boolean, default `false`;
- `default` — optional value used when an insert omits the attribute;
- `generation` — optional database-side value-generation policy.

`default` and `generation` are mutually exclusive in the core contract.
An adapter extension may support a combined behavior only through a new namespaced generation kind and an explicit validation rule.

### Core Logical Types

| Type identity | Required or canonical parameters | Meaning |
| --- | --- | --- |
| `core.binary` | optional positive `length` | Binary value |
| `core.boolean` | none | Boolean value |
| `core.date` | none | Calendar date without time |
| `core.datetime` | `timezone: false` by default; optional non-negative `precision` | Date and time |
| `core.decimal` | positive `precision`, integer `scale` from `0` through `precision`, optional `unsigned: false` | Exact decimal value |
| `core.enum` | non-empty unique string `values` | Closed string set |
| `core.integer` | `bits: 32` by default; allowed `8`, `16`, `32`, `64`; `unsigned: false` by default | Integer value |
| `core.json` | none | Structured JSON value; physical JSON/JSONB choice belongs to storage mapping |
| `core.string` | positive `length` | Bounded character string |
| `core.text` | none | Unbounded text value |
| `core.uuid` | none | UUID value |
| `core.vector` | positive `dimensions`, `element: "float"|"bit"`, `sparse: boolean` | Fixed-dimension vector value |

A provider may register additional namespaced logical types such as `postgresql.range`.
The core must reject an unregistered identity rather than pass it to Knex.
Provider types still use a separate `storage` binding; a logical type identifier is never a Knex method name or raw SQL type.

### Physical Storage Binding

```json
{
  "storage": {
    "postgresql": {
      "type": "jsonb",
      "params": {}
    }
  }
}
```

The dialect key and storage type are adapter registry identifiers.
Parameters are adapter-validated data, not SQL tokens.
If `storage` is absent, the selected adapter must either produce one documented unambiguous default or report `DEM_STORAGE_AMBIGUOUS`.

The PostgreSQL adapter supports `vector`, `halfvec`, `bit`, and `sparsevec` bindings for compatible `core.vector` declarations.
Vector dimensions come from the logical type and are copied into the physical descriptor; an inconsistent duplicate dimension in storage parameters is invalid.

### Canonical Vector Values

The logical/runtime value shape is independent from PostgreSQL text syntax:

- dense float vector — a finite `number[]` with exactly `dimensions` items;
- dense bit vector — a string with exactly `dimensions` `0` or `1` characters;
- sparse float vector — `{dimensions, entries}`, where `entries` is an ascending array of unique `{index, value}` records, indices are one-based within the declared dimension, and values are finite non-zero numbers.

Adapters encode and decode these canonical values at the database boundary.
Invalid dimensions, NaN/infinity, malformed bits, duplicate or unordered sparse indices, and zero sparse entries are rejected before execution.

### Default Value

Literal and function defaults are distinct:

```json
{"default": {"kind": "literal", "value": "2026-08-08"}}
```

```json
{"default": {"kind": "function", "name": "core.currentTimestamp", "params": {}}
```

The core function registry contains `core.currentDate` for `core.date` and `core.currentTimestamp` for `core.datetime`.
A literal date remains a literal date; it must never be converted to the current time because of column type alone.
Unknown functions and type-incompatible literal values are errors.

### Value Generation

```json
{
  "generation": {
    "kind": "core.identity",
    "params": {"mode": "byDefault"}
  }
}
```

`core.identity` is valid only for an integer logical type.
`mode` is `byDefault` or `always`.
Additional generators use namespaced registry identities and declare their capability requirements.

Identity and reference meaning are not logical types.
An identity is an integer or UUID attribute with a generation policy; a foreign-key attribute gets its meaning from a relation and must be type-compatible with its target.

## External References

```json
{
  "refs": {
    "/identity/user": ["id"]
  }
}
```

Every referenced path and attribute used by a relation must be declared here when the target is external to the fragment.
The root map must resolve it before semantic validation.
Declaring a reference does not prove that the mapped entity or attributes exist.

## Relation Contract

```json
{
  "relation": {
    "document_owner": {
      "attrs": ["ownerId"],
      "ref": {
        "path": "/identity/user",
        "attrs": ["id"]
      },
      "action": {
        "delete": "restrict",
        "update": "cascade"
      },
      "deferrable": "notDeferrable"
    }
  }
}
```

`attrs` and `ref.attrs` are non-empty ordered arrays with equal cardinality.
Actions are `restrict` or `cascade`.
`deferrable` is `notDeferrable`, `immediate`, or `deferred`; the default is `notDeferrable`.
The selected adapter must support any non-default deferrability.

The referenced ordered attribute list must match one primary or unique key.
The relation contract and its validation are defined in `validation.md`.

## Index Contract

DEM v2 indexes use `kind`, `keys`, `method`, `include`, `predicate`, `options`, and `phase`.
See `indexes.md` for the normative shape, validation, expressions, and build ordering.

## Map v2 Contract

Default location: `etc/teqfw.schema.map.json`.

```json
{
  "version": 2,
  "namespace": "teq",
  "ref": {
    "@vendor/package": {
      "/identity/user": {
        "path": "/app/user",
        "attrs": {"external_id": "id"}
      }
    }
  },
  "deprecated": {
    "/app/obsolete": ["/app/dependent"]
  }
}
```

`namespace` is the physical table prefix.
The first `ref` key identifies the fragment owner; the second is the external path used by that fragment.
`path` supplies the canonical target path and `attrs` optionally maps external referenced names to actual target names.
Mapping changes reference identity only; it does not transfer ownership of the target entity.

`deprecated` supplies explicit drop dependencies for legacy structure cleanup.
It does not authorize deletion, identify a rename, or add migration history to the DEM.

## DEM v1 Compatibility Decoder

The v1 decoder must preserve the current 2.x declaration meaning and emit canonical v2 nodes before composition.

| DEM v1 syntax | Canonical meaning |
| --- | --- |
| `id` | `core.integer` with 32-bit signed logical signature plus `core.identity` generation; the adapter preserves legacy increments storage |
| `ref` | The same 32-bit signed logical signature; a legacy physical hint preserves unsigned storage where the current adapter applies it |
| `integer` | `core.integer`; `isTiny` and `unsigned` become explicit type parameters |
| `number` with both precision and scale | `core.decimal` with the supplied values |
| `number` with only precision or scale | Legacy decimal physical behavior, plus warning `DEM_V1_PARTIAL_DECIMAL` |
| `number` with neither precision nor scale | Legacy integer physical behavior, plus warning `DEM_V1_AMBIGUOUS_NUMBER` |
| `datetime` with `dateOnly` | `core.date` |
| `datetime` without `dateOnly` | `core.datetime` |
| `json` | Legacy adapter storage preserving the current JSONB-oriented physical behavior |
| `string` with `length` | `core.string` with the declared length |
| scalar `default: "current"` | `core.currentDate` or `core.currentTimestamp` according to logical type |
| legacy ordinary `index` plus `attrs` | v2 `kind: "index"`, attribute keys, method `legacy.defaultIndex`, and phase `table` |
| legacy `primary` or `unique` plus `attrs` | corresponding v2 `kind`, attribute keys, no method, and phase `table` |

The compatibility decoder may warn about ambiguous legacy semantics but must not reinterpret them as new v2 defaults.
The compatibility-only `legacy.defaultIndex` identity is rejected in DEM v2
input and resolved by each adapter to its regression-tested previous behavior.
The shared logical signature keeps legacy `id` and `ref` relation-compatible; the selected adapter must then prove that their preserved physical forms are compatible on that dialect.
New v2 declarations must use `core.integer` or `core.decimal` explicitly and must select PostgreSQL `json` or `jsonb` storage explicitly when application behavior depends on that distinction.

## Migration Meaning

Changing either declaration format changes desired state only.
Deletion plus addition is not a rename, a changed type is not a conversion, and a new non-nullable attribute does not define a value for existing rows.
Those transition meanings remain explicit inputs to the rebuild or external migration workflow.
