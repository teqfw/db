# Product Use Cases

- Path: `ctx/docs/product/use-cases.md`
- Changed: `20260808`

## UC-1 Configure And Connect

The application supplies a Knex-compatible client and connection configuration.
The result is a reusable connection service able to create transactions, queries, and schema builders and to identify the active RDBMS family.

## UC-2 Compose The Application Model

The application loads its own DEM plus installed-package fragments, applies the root map, selects a dialect adapter, and requests compilation.
It receives either one immutable canonical model with provenance, graph, requirements, physical plan, fingerprint, and warnings or one aggregated diagnostic failure with no executable partial model.

## UC-3 Create, Recreate, Or Drop Structure

An authorized caller runs runtime capability preflight and executes a phase-ordered physical plan.
Tables and key constraints precede relations; late indexes follow relations or transferred data; explicitly deprecated tables participate in safe removal.

## UC-4 Execute CRUD

A developer creates, reads, updates, or deletes one or many records through a schema-aware API.
The operation filters unknown attributes, supports simple or composite keys, and either joins a supplied transaction or manages an internal one.

## UC-5 Select Record Sets

A developer describes filters, derived projections, registered operator calls, expression ordering, limit, offset, and allow-listed execution options through a selection DTO.
The package validates logical types and dialect capabilities, maps only schema-approved attributes, binds values, and may produce a matching count query.
PostgreSQL consumers can express exact or index-assisted nearest-neighbour ordering through registered pgvector distance operators.

## UC-6 Export Data

An operator reads all modeled tables in dependency order into a JSON dump.
Date-only values and PostgreSQL sequences are represented in a form import can restore.

## UC-7 Import Data

An operator reads a dump, transforms rows for the active RDBMS, inserts modeled tables in dependency order, and restores PostgreSQL sequences when present.

## UC-8 Shutdown

The application disconnects the Knex client after work or plugin shutdown.

## UC-9 Rebuild With Data Preservation

An authorized caller captures data from the source structure, creates the target structure from the current canonical DEM, transfers compatible rows in dependency order, restores engine-specific state, and receives enough evidence to verify the result before retiring the source.
The source may be an earlier schema, another database, or a durable dump created before recreation.

## UC-10 Delegate Incompatible Transformation

When source and target representations are not structurally compatible, the caller supplies explicit transformation behavior owned by the relevant package or migration orchestrator.
`@teqfw/db` executes the bounded transfer contract but does not infer renames, conversions, or application release policy.

## UC-11 Diagnose An Invalid Distributed Model

A developer compiles all fragments and, when needed, plans a selected operation without mutating a database.
It receives deterministic diagnostics for every independently detectable ownership conflict, unknown type, unresolved endpoint, invalid key, incompatible relation, unsupported capability, or operation cycle without a supported strategy.
Each diagnostic identifies canonical location and trusted source provenance so the owning package or application map can be corrected.

## Explicitly Unsupported Use Case

The package does not inspect arbitrary schema drift and synthesize a complete incremental migration plan.
An application that requires versioned in-place changes, online rollout, or multi-release rollback uses a separate migration capability.
