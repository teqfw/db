# Architecture State

- Path: `ctx/docs/architecture/state.md`
- Changed: `20260726`

## Durable State

The connected RDBMS owns tables, rows, constraints, indexes, and sequences.
DEM and map JSON files own the declared desired structure.
Dump JSON owns a portable snapshot only when explicitly exported.

## Runtime State

The connection service owns the initialized Knex instance and current schema namespace configuration.
Each transaction owns one Knex transaction handle.
The schema service owns the currently loaded normalized DEM and schema configuration.
Configuration services own application root and loaded local values.

## Derived State

Dependency order, RDB table descriptors, query clauses, mapped column names, and DTO instances are derived and may be recreated.

## State-Changing Authority

Only explicit connection initialization changes connection state.
Only transaction commit makes row changes durable.
Only schema lifecycle operations create or drop structure.
Only export/import actions read or replace transferable database contents.

## Invariants

Connection shutdown releases the Knex client.
Rollback prevents an internally owned failed operation from committing.
Derived descriptors never supersede the source DEM/map declarations.
