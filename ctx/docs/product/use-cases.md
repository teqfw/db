# Product Use Cases

- Path: `ctx/docs/product/use-cases.md`
- Changed: `20260726`

## UC-1 Configure And Connect

The application supplies a Knex-compatible client and connection configuration.
The result is a reusable connection service able to create transactions, queries, and schema builders and to identify the active RDBMS family.

## UC-2 Compose The Application Model

The application loads its own DEM plus installed-package fragments, applies the root map, and receives one normalized DEM and schema configuration.

## UC-3 Recreate Or Drop Structure

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
