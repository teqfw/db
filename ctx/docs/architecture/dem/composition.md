# DEM Composition And Provenance

- Path: `ctx/docs/architecture/dem/composition.md`
- Changed: `20260903`

## Input Envelope

The scanner produces one trusted envelope per declaration:

```js
{
    fragmentId: '@vendor/package',
    packageName: '@vendor/package',
    filename: '/absolute/read/path/etc/teqfw.schema.json',
    declaration: parsedJson
}
```

`fragmentId`, `packageName`, and `filename` come from scanner/runtime evidence, not from fragment JSON.
The envelope is immutable after scanning.
Test callers may construct envelopes explicitly but must provide all identity fields.

The declaration may contain an optional fragment root `namespace`. This is declaration content rather than envelope
metadata: it is a dot-delimited logical package prefix such as `teqfw.db.schema`, validated with the same lowercase
package-segment rule as nested package keys. The compiler applies that prefix to the fragment's declared local
entity/package paths before ownership composition. It does not derive the prefix from `fragmentId` or `packageName`,
and it does not rewrite external aliases in `refs`.

The application map uses the same trusted-envelope pattern with stable map identity, filename, and parsed declaration so mapped-endpoint diagnostics can cite both relation and map sources.

The compiler sorts envelopes by `fragmentId` and then `filename` before decoding.
Sort order makes diagnostics deterministic; it never decides a conflict winner.
No compiler stage creates a synthetic declaration envelope or injects a semantic node after reading the selected envelopes and application map.

## Ownership Rules

A semantic node has one owner.
Semantic nodes are:

- entity;
- attribute;
- relation;
- index;
- non-empty package metadata field;
- a dialect storage binding;
- a default or generation declaration.

Package objects used only to reach a nested path are structural containers and may be contributed by multiple fragments.
Their child maps compose only when child keys are disjoint.

The application map owns reference redirection and the physical namespace.
It does not become owner of mapped entities or attributes.
Package ownership carries no special composition privileges: a platform package follows the same declaration, composition, mapping, projection, and provenance rules as an application package.

The canonical path after fragment-root expansion is the identity used for ownership. A concise fragment rooted at
`teqfw.db.schema` and a verbose fragment that explicitly reaches the same logical path therefore participate in the
same conflict checks. The root is not a namespace reservation, an ownership claim, or a special platform mode.

## Composition Operations

Composition is schema-aware and uses only these operations:

| Input kind | Operation | Conflict condition |
| --- | --- | --- |
| Structural package container | Recursive union of child maps | Same semantic child identity appears from different owners |
| Entity, attribute, relation, or index | Insert one complete value | Identity already has an owner |
| Scalar or object field inside a semantic node | Retain the owner's complete value | A second fragment attempts to contribute the node |
| `requires` capability set | Deduplicated set union with accumulated provenance | Never for valid v2 string identities |
| Arrays inside semantic nodes | Retain as an ordered complete value | A second fragment attempts to contribute the node |

Generic scalar overwrite, object deep merge, and array concatenation are forbidden.
Exact duplicate semantic declarations from different fragments still conflict because ownership would be ambiguous.
The compiler reports the conflict and retains neither declaration as an accepted winner.

## Provenance Model

The compilation result contains a sidecar provenance map keyed by canonical JSON Pointer:

```js
{
    '/package/search/entity/document/attr/embedding': [
        {
            fragmentId: '@vendor/search',
            filename: '/.../etc/teqfw.schema.json',
            sourcePointer: '/package/search/entity/document/attr/embedding'
        }
    ]
}
```

Every canonical semantic node has at least one source record.
Derived nodes such as a normalized relation endpoint or physical capability requirement retain the sources of every input that caused the derivation.
Capability set union may therefore have multiple sources without creating semantic co-ownership.

Provenance is diagnostic evidence, not part of the model fingerprint.
It must not expose file contents, credentials, or caller objects.

## Reference Mapping

Reference processing occurs after ownership-safe composition and before semantic validation:

1. Read the relation owner from provenance.
2. Normalize the declared reference path.
3. If the path is external for that owner, locate exactly one map entry under that fragment identity.
4. Replace the path and mapped referenced attribute names.
5. Add both relation and map locations to the derived endpoint provenance.
6. Report a missing or malformed map entry; do not guess by suffix or entity name.

Mapping may cause two declared references to resolve to the same target; that is valid if each relation remains independently named and valid.

## Deterministic Output

Before fingerprinting, the compiler:

- sorts object maps by canonical key;
- preserves relation and index key-array order because order is semantic;
- deduplicates and sorts capability sets;
- inserts documented canonical defaults;
- excludes provenance, diagnostics, filenames, and runtime capability evidence from the model fingerprint;
- includes comments, logical types, storage bindings, relations, indexes, defaults, generation, and namespace in the fingerprint input.

The fingerprint algorithm and encoding are an implementation choice until exposed publicly, but the same canonical input must produce the same bytes within one documented algorithm version.

## Conflict Diagnostic

An ownership conflict produces `DEM_COMPOSITION_OWNER_CONFLICT` with:

- canonical path;
- all conflicting source records;
- a stable summary of the conflicting node kinds;
- no selected winner.

All conflicts are collected in the same analysis pass where possible.
A failed composition yields no canonical model.
