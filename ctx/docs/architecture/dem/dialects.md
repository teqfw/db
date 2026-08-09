# DEM Dialect And Capability Adapters

- Path: `ctx/docs/architecture/dem/dialects.md`
- Changed: `20260808`

## Boundary

The core DEM owns portable logical structure and validation.
A dialect adapter owns physical representation and executable database-specific behavior.
Knex remains the execution substrate but is not the physical metamodel.

An adapter is selected explicitly from the configured connection client by the application composition root or connection service.
Core compiler code must not discover adapters through unrestricted container lookup.

## Capability Model

A capability identifier is namespaced, stable, and narrower than a database name.
Examples:

- `postgresql.core`;
- `postgresql.extension.vector`;
- `postgresql.type.vector`;
- `postgresql.index.hnsw`;
- `postgresql.index.ivfflat`;
- `postgresql.query.vectorDistance`;
- `postgresql.transfer.deferredConstraints`.

Requirements come from three sources:

1. explicit fragment `requires` sets;
2. type, storage, generation, index, and operator registry entries;
3. the selected operation plan.

The compiler derives the union and retains provenance for every contributor.
The adapter distinguishes:

- supported — the adapter has deterministic implementation and validation rules;
- available — the actual connection satisfies the runtime requirement;
- authorized — the caller has permitted an operation that may use or provision it.

Support does not imply availability, and availability does not imply authority.

## Adapter Contract

The target adapter exposes behavior equivalent to:

```js
describe()
// -> {id, clients, supportedCapabilities, registryVersions}

resolveType({logicalType, storage, location})
// -> {physicalType, requirements, diagnostics}

resolveDefault({logicalType, defaultValue, location})
resolveGeneration({logicalType, generation, location})
resolveIndex({entity, index, location})
resolveOperator({operator, argumentTypes, context, location})
// -> immutable physical descriptors or diagnostics

preflight({connection, requirements, operation})
// -> {availableCapabilities, diagnostics}

addColumn({tableBuilder, column, knex})
addConstraint({schemaBuilder, constraint, knex})
addIndex({connection, index, knex})
compileExpression({expression, scope, knex})
encodeValue({column, value})
decodeValue({column, value})
// -> Knex builder/raw objects with values supplied as bindings
```

All methods use parameter objects and return immutable values.
Registry lookup precedes execution.
An adapter must never convert a declaration string directly into `table[string](...)`, concatenate a value into SQL, or accept a raw SQL expression node.
Value codecs are used consistently by CRUD, query binding, export, import, and transfer.

## Physical Descriptors

A physical column descriptor retains both meanings:

```js
{
    name: 'embedding',
    logicalType: {id: 'core.vector', params: {dimensions: 1536, element: 'float', sparse: false}},
    physicalType: {dialect: 'postgresql', type: 'vector', args: [1536]},
    nullable: false,
    defaultValue: undefined,
    generation: undefined,
    requirements: ['postgresql.extension.vector', 'postgresql.type.vector']
}
```

Physical index descriptors retain `kind`, `method`, compiled keys or expressions, operator classes, included columns, predicate, options, phase, and requirements.
They are not reduced to a Knex method name plus column array.

The physical plan retains enough information for dry-run rendering, validation, diagnostics, and operation ordering without reconnecting to the source fragment.

## Core And Provider Registries

The compiler has four registries:

- logical type registry;
- default and generation registry;
- index method/operator-class registry;
- query/index expression operator registry.

Core entries use the `core.` prefix.
Provider entries use a dialect or extension prefix.
Each entry defines parameter schema, accepted input/output logical types, derived capabilities, canonicalization, and adapter implementation identity.

Adding a PostgreSQL data type, range, array, full-text value, user-defined type, or extension type means adding a provider registry entry and tests.
It does not mean adding an unchecked value to one global enum.

## Fallback Rule

There is no fallback from an unsupported provider binding to a superficially similar core type.
Examples of forbidden fallback include:

- `jsonb` to text;
- vector to JSON;
- unsigned integer to signed integer without a proven range contract;
- unsupported index method to a plain B-tree index;
- unknown query operator to equality.

An application may declare an alternative storage binding for another dialect, but each selected binding is validated independently and becomes part of the target fingerprint.

## Runtime Preflight And Provisioning

Preflight is read-only and occurs before schema or data mutation.
It checks actual database identity, extensions, versions, and operation features.
The result is evidence tied to the connection and compilation fingerprint.

Capability provisioning is a separate authorized operation owned by the application or operator.
The base schema builder must not execute `CREATE EXTENSION`, change server settings, or weaken constraints merely because a DEM requires a capability.

## Reconsideration Boundary

Keep an adapter inside `@teqfw/db` while it shares the package release, Knex connection, compiler contract, and verification suite.
Split an adapter into another package only when it needs independent release ownership or dependencies and the additional DI/compatibility coordination is justified.
Directory separation alone is not an architectural boundary.
