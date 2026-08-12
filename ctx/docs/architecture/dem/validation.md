# DEM Validation And Diagnostics

- Path: `ctx/docs/architecture/dem/validation.md`
- Changed: `20260808`

## Enforcement Rule

The compiler validates before a physical plan is returned.
Schema builders, transfer engines, and query compilers accept only a branded successful compilation result, not an arbitrary DEM DTO.
This makes validation an enforced boundary rather than a documented convention.

Validation collects independent errors instead of failing on the first one.
Later stages may be skipped only when an earlier failure makes their evidence unreliable, for example when composition cannot establish entity identity.

## Stages

### 1. Parse And Decode

- JSON syntax is valid before the scanner creates a trusted envelope.
- Declaration version is supported.
- Required maps and arrays have the documented shape.
- Names, paths, registry identifiers, and enums are valid.
- DEM v1 syntax expands without changing its legacy meaning.

### 2. Composition

- Semantic nodes have exactly one owner.
- Structural package containers have no conflicting metadata.
- Capability sets compose deterministically.
- Every canonical semantic node has provenance.

### 3. Logical Semantics

For every entity:

- every attribute logical type exists in the core or provider registry;
- type parameters, nullable state, literal defaults, function defaults, and generation policies are valid together;
- every index key attribute and included attribute exists;

- identity roles resolve from the one application-map identity profile before type/default/generation validation;
- reference roles resolve from exactly one mapped relation target before positional relation compatibility validation;
- role resolution has no silent fallback: an absent profile uses only the documented default, while an ambiguous or cyclic reference role is a diagnostic;
- an index contains at least one key and does not repeat a direct attribute key;
- the entity has at most one primary index;
- primary and unique indexes used as relation targets contain only direct attribute keys and have phase `table`;
- every relation local attribute exists;
- every relation target entity and target attribute exists after mapping;
- relation local and target arrays are non-empty and have equal cardinality;
- each positional local/target pair has the same canonical logical compatibility signature;
- the complete ordered target attribute list equals one primary or unique key;
- actions and deferrability values are supported by the logical contract.

The core compatibility signature contains logical type identity and parameters that affect equality representation.
Generation and nullable state are not part of the signature.
The dialect adapter performs an additional physical compatibility check after storage projection.

### 4. Graph

The compiler creates a directed graph from referencing entity to referenced entity and computes strongly connected components.
Self-relations and components containing more than one entity are recorded as cycles.

A cycle is not automatically invalid for schema creation because tables, key constraints, and relations are separate phases.
It is never reduced to a log message.
The graph and cycle provenance are part of the compilation result.

An operation planner must select one of these outcomes:

- schema create/drop — use separated phases, so cycles are supported;
- transfer of an acyclic graph — use deterministic topological order;
- transfer of a cyclic graph — require an explicit adapter-supported cycle strategy;
- unsupported cycle — fail planning with `DEM_DEPENDENCY_CYCLE_UNPLANNED` before reading or writing rows.

The initial PostgreSQL strategy is `postgresql.deferredConstraints`.
It is valid only when every relation edge inside each cycle is declared `deferrable: "deferred"`, the adapter reports support, and all writes occur inside one owned transaction that checks constraints at commit.
No default cycle strategy is inferred.

### 5. Dialect Projection

- the selected adapter recognizes every storage binding, type, default function, generation kind, index method, operator class, expression operator, and option;
- logical and physical types are compatible;
- index method, storage type, operator class, predicate, and options form a supported combination;
- build phases satisfy constraint dependencies;
- every declared and derived capability is supported by the adapter;
- physical names are valid and unique after namespace conversion;
- no physical descriptor contains an unresolved registry identity or unchecked method name.

### 6. Runtime Preflight

This asynchronous stage runs immediately before the operation and before its first side effect:

- required extensions and versions are available;
- selected query or transfer strategy is available on the actual connection;
- connection dialect matches the compiled adapter identity;
- operation-specific transaction and DDL capabilities are present.

Unsupported adapter behavior is a compile error.
Supported but absent runtime behavior is a preflight error.

## Diagnostic Contract

Every diagnostic has this shape:

```js
{
    code: 'DEM_RELATION_TYPE_MISMATCH',
    severity: 'error',
    stage: 'logical',
    path: '/package/app/entity/document/relation/owner',
    message: 'Relation attributes have incompatible logical types.',
    sources: [],
    details: {}
}
```

- `code` is a stable machine-readable identifier.
- `severity` is `error` or `warning`.
- `stage` is `parse`, `decode`, `composition`, `logical`, `graph`, `dialect`, `preflight`, `plan`, or `query`.
- `path` is a canonical JSON Pointer or operation path.
- `message` is concise English text for humans.
- `sources` contains provenance records.
- `details` contains structured safe values needed by tests or tooling.

Diagnostics are sorted by stage order, path, code, then source identity.
Messages are not used for program branching.

## Required Diagnostic Codes

| Code | Condition |
| --- | --- |
| `DEM_DECLARATION_VERSION_UNSUPPORTED` | Version is neither unversioned v1 nor integer `2` |
| `DEM_DECLARATION_SHAPE_INVALID` | A declaration node has the wrong structural shape |
| `DEM_COMPOSITION_OWNER_CONFLICT` | More than one fragment owns one semantic identity |
| `DEM_PROVENANCE_MISSING` | A canonical semantic node lacks source evidence |
| `DEM_REFERENCE_MAP_MISSING` | An external reference has no owner-scoped map entry |
| `DEM_REFERENCE_ENTITY_MISSING` | The resolved target entity does not exist |
| `DEM_REFERENCE_ATTRIBUTE_MISSING` | A local or target relation/index attribute does not exist |
| `DEM_RELATION_CARDINALITY` | Local and target relation attribute arrays are empty or differ in length |
| `DEM_RELATION_TYPE_MISMATCH` | A positional FK pair has incompatible logical or physical types |
| `DEM_RELATION_TARGET_NOT_UNIQUE` | Referenced ordered attributes are not a primary or unique key |
| `DEM_TYPE_UNKNOWN` | Logical type identity has no registry entry |
| `DEM_TYPE_PARAMS_INVALID` | Logical type parameters violate its registry schema |
| `DEM_DEFAULT_INVALID` | Default kind, function, or value is invalid for the type |
| `DEM_GENERATION_INVALID` | Generation kind or type combination is invalid |
| `DEM_STORAGE_AMBIGUOUS` | No explicit storage and no single adapter default exists |
| `DEM_STORAGE_UNSUPPORTED` | Adapter cannot project the requested physical storage |
| `DEM_CAPABILITY_UNSUPPORTED` | Adapter has no implementation for a requirement |
| `DEM_CAPABILITY_UNAVAILABLE` | Runtime preflight cannot find a supported required capability |
| `DEM_INDEX_INVALID` | Index shape or cross-field invariant is invalid |
| `DEM_EXPRESSION_INVALID` | Expression operator, type, arity, or context is invalid |
| `DEM_DEPENDENCY_CYCLE_UNPLANNED` | Selected operation cannot execute a detected cycle |
| `DEM_PHYSICAL_NAME_COLLISION` | Distinct logical objects map to the same physical name |
| `DEM_V1_AMBIGUOUS_NUMBER` | Legacy `number` omits precision and scale and retains integer behavior |
| `DEM_V1_PARTIAL_DECIMAL` | Legacy `number` supplies only precision or only scale and retains legacy decimal builder behavior |

Additional codes may refine a condition without changing these parent meanings.

## Failure Contract

`DemCompilationError` contains the complete sorted error list and any warnings produced before the failure.
It does not expose a usable `model` or `physical` property.
Preflight and operation-plan errors use the same diagnostic shape and preserve the compilation fingerprint.

Warnings never authorize silent fallback.
The legacy warnings accepted with execution are `DEM_V1_AMBIGUOUS_NUMBER` and
`DEM_V1_PARTIAL_DECIMAL`, because the v1 decoder preserves the documented
legacy behavior in both cases.
