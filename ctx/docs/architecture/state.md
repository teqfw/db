# Architecture State

- Path: `ctx/docs/architecture/state.md`
- Changed: `20260808`

## Durable State

- The source RDBMS owns its tables, rows, constraints, indexes, and sequences until the caller accepts another authority.
- DEM and map JSON files own the declared target structure.
- The target RDBMS owns the newly projected structure and transferred rows.
- Dump JSON owns a portable snapshot only when explicitly exported and durably stored.

## Runtime State

The connection service owns the initialized Knex instance and current schema namespace configuration.
Each transaction owns one Knex transaction handle.
The schema service owns the currently loaded normalized DEM and schema configuration.
Configuration services own application root and loaded local values.
A rebuild execution owns its selected source and target identities, progress, and evidence until it returns them to the caller.

## Derived State

Dependency order, RDB table descriptors, query clauses, mapped column names, DTO instances, and transfer plans are derived and may be recreated.
Derived state never supplies missing semantic migration intent.

## State-Changing Authority

Only explicit connection initialization changes connection state.
Only transaction commit makes row changes durable.
Only schema lifecycle operations create or drop structure.
Only explicitly invoked transfer actions copy or restore transferable database contents.
Only the host application or operator accepts the target, performs cutover, or authorizes source retirement.

## Invariants

Connection shutdown releases the Knex client.
Rollback prevents an internally owned failed operation from committing.
Derived descriptors never supersede the source DEM/map declarations.
A source snapshot remains required for recovery from destructive in-place recreation.
An unaccepted parallel target never silently replaces the source as authoritative state.
