# Product Use Cases

- Path: `ctx/docs/product/use-cases.md`
- Changed: `20260808`

## UC-1 Configure And Connect

The application supplies a Knex-compatible client and connection configuration.
The result is a reusable connection service able to create transactions, queries, and schema builders and to identify the active RDBMS family.

## UC-2 Compose The Application Model

The application loads its own DEM plus installed-package fragments, applies the root map, and receives one normalized DEM and schema configuration.

## UC-3 Create, Recreate, Or Drop Structure

An authorized caller translates the normalized model into dependency-ordered relational objects.
Foreign keys and tables are dropped and created in safe order, including explicitly deprecated tables.

## UC-4 Execute CRUD

A developer creates, reads, updates, or deletes one or many records through a schema-aware API.
The operation filters unknown attributes, supports simple or composite keys, and either joins a supplied transaction or manages an internal one.

## UC-5 Select Record Sets

A developer describes filters, functions, aliases, ordering, limit, and offset through a selection DTO.
The package maps only schema-approved columns into a Knex query and may produce a matching count query.

## UC-6 Export Data

An operator reads all modeled tables in dependency order into a JSON dump.
Date-only values and PostgreSQL sequences are represented in a form import can restore.

## UC-7 Import Data

An operator reads a dump, transforms rows for the active RDBMS, inserts modeled tables in dependency order, and restores PostgreSQL sequences when present.

## UC-8 Shutdown

The application disconnects the Knex client after work or plugin shutdown.

## UC-9 Rebuild With Data Preservation

An authorized caller captures data from the source structure, creates the target structure from the current normalized DEM, transfers compatible rows in dependency order, restores engine-specific state, and receives enough evidence to verify the result before retiring the source.
The source may be an earlier schema, another database, or a durable dump created before recreation.

## UC-10 Delegate Incompatible Transformation

When source and target representations are not structurally compatible, the caller supplies explicit transformation behavior owned by the relevant package or migration orchestrator.
`@teqfw/db` executes the bounded transfer contract but does not infer renames, conversions, or application release policy.

## Explicitly Unsupported Use Case

The package does not inspect arbitrary schema drift and synthesize a complete incremental migration plan.
An application that requires versioned in-place changes, online rollout, or multi-release rollback uses a separate migration capability.
