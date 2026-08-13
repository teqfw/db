# DEM Target Architecture

- Path: `ctx/docs/architecture/dem/overview.md`
- Changed: `20260813`

## Status And Scope

This document defines the accepted DEM v2 target architecture.
The current worktree implements the compiler through one v1/v2 canonical execution path, and external PostgreSQL/pgvector and MariaDB conformance passes in the provisioned test environment. It still represents identity/reference declarations through the obsolete role mechanism; the accepted `core.identity`/`core.ref` type model remains an implementation gap documented in `../../code/dem.md`.
`../../code/dem.md` maps the target to implementation work and distinguishes current facts from required behavior.

The DEM describes one desired relational state.
It does not describe database history, infer application migrations, or authorize DDL.

## Four Model Layers

### Fragment Declaration

A package-owned JSON document declares logical entities and optional dialect bindings.
The scanner wraps the document in a trusted fragment envelope containing package identity, source filename, and fragment identity.
Provenance is never accepted from JSON supplied by the fragment itself.

### Canonical DEM

The compiler expands legacy syntax, composes disjoint package-owned nodes, resolves references, applies canonical defaults, validates semantics, and produces an immutable application-wide logical model.
The canonical DEM contains logical types, value defaults, generation policies, relations, logical indexes, and capability requirements.
Special package types are resolved here: `core.identity` expresses a system-addressable entity identity, while `core.ref` derives a local representation only from exactly one relation-resolved `core.identity`. `identityProfile` is the host-owned policy that defines their target-model representation; its current structure materializes `core.identity` into canonical type and generation, while `core.ref` becomes only the compatible canonical type. Neither unresolved special type reaches the canonical DEM.
The compilation result carries provenance as a sidecar to that model.

### Physical Schema Plan

Exactly one selected dialect adapter converts the valid canonical DEM into immutable physical descriptors and an ordered schema plan.
The plan contains physical column types, constraints, index methods and operator classes, capability preconditions, and build phases.
It contains no application cutover or inferred migration action.

### Runtime Query Plan

A typed expression compiler validates query expressions against the canonical entity schema and the selected dialect operator registry.
It then produces parameter-bound Knex expressions.
Query extensions and schema extensions use the same type and capability identities.

## Compiler Boundary

The target compiler contract is conceptually:

```js
compile({fragments, mapEnvelope, adapter})
// -> {model, provenance, graph, requirements, physical, fingerprint, warnings}
// throws DemCompilationError containing every deterministic error diagnostic
```

Compilation is side-effect free.
It proves declaration and adapter support but does not prove that a required database extension is installed.
An asynchronous adapter preflight checks runtime capabilities before any DDL, transfer, or dialect query executes.

No partial model or physical plan may escape from a failed compilation.
Callers that need diagnostics receive them from the thrown compilation error.

## Pipeline

```text
declaration files + application map file
  -> parse JSON and create trusted source envelopes
  -> decode unversioned DEM v1 or explicit DEM v2
  -> compose with single-owner semantics and provenance
  -> resolve core.identity to type + generation through identityProfile
  -> derive core.ref type from its mapped core.identity relation target
  -> validate logical types, indexes, relations, and graph
  -> select one dialect adapter
  -> validate/derive capabilities and physical storage
  -> emit canonical model, physical plan, and fingerprint
  -> runtime capability preflight
  -> authorized execution
```

Every stage contributes structured diagnostics.
Logging is observational and never substitutes for a diagnostic or a failed result.

## Ownership And Authority

- A package owns semantic nodes declared by its fragment.
- The root application owns the reference map, physical namespace, adapter selection, and capability environment.
- The core compiler owns canonicalization, provenance, cross-fragment validation, and deterministic diagnostics.
- A dialect adapter owns physical type, index, expression, and capability rules for its dialect.
- The connection/runtime owns the evidence of installed capabilities.
- The application or operator alone authorizes schema mutation, extension provisioning, data transfer, and destructive work.

An adapter may report a missing extension but must not install it as an implicit consequence of compiling or building a schema.

## Architectural Invariants

- Logical type, physical storage, value default, and value generation are separate fields.
- Unknown logical types, operators, storage types, and capabilities fail before execution.
- A semantic entity, attribute, relation, or index has one fragment owner.
- Generic deep merge is not a DEM composition operation.
- Provenance reaches every canonical semantic node and every conflict diagnostic.
- All reference endpoints, attributes, type compatibility, cardinality, and target uniqueness are validated.
- Relation cycles are explicit graph data; an operation that cannot execute them requires a named supported strategy.
- Physical descriptors never store an unchecked Knex method name.
- Index method, keys or expressions, operator classes, predicate, included columns, options, and phase are explicit.
- Query expressions contain no raw SQL node and bind values separately from SQL text.
- Capability preflight finishes successfully before the first side effect.

## Reading Map

- `declaration.md` defines the input contract and legacy decoding.
- `composition.md` defines ownership and provenance.
- `validation.md` defines enforced invariants and diagnostics.
- `dialects.md` defines physical projection and capability boundaries.
- `indexes.md` defines index structure and lifecycle.
- `queries.md` defines the common typed expression contract.
