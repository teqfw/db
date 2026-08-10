# Architecture State

- Path: `ctx/docs/architecture/state.md`
- Changed: `20260810`

## Durable State

- The source RDBMS owns its tables, rows, constraints, indexes, and sequences until the caller accepts another authority.
- DEM and map JSON files own the declared target structure.
- Trusted fragment envelopes own source identity for one compilation input.
- The target RDBMS owns the newly projected structure and transferred rows.
- Dump JSON owns a portable snapshot only when explicitly exported and durably stored.

## Runtime State

The connection service owns the initialized Knex instance and current schema namespace configuration.
The package default connection and every host-owned named connection have independent Knex, dialect-adapter,
resolver, transaction, and shutdown state.
Each transaction owns one Knex transaction handle.
The schema service owns an authentic compilation result and derives any read-only v1 compatibility view from that same execution truth.
One compilation execution owns its canonical model, provenance, dependency graph, requirements, physical plan, fingerprint, warnings, and any error diagnostics.
The selected adapter owns immutable registries; a preflight result owns connection-specific capability evidence for one operation.
`@teqfw/cfg` owns the immutable raw application snapshot. The database configuration service owns one lazily
materialized, deeply frozen Knex configuration per default or named connection derived from the `TEQFW_DB`
projection, plus application-root and version metadata.
A rebuild execution owns its selected source and target identities, progress, and evidence until it returns them to the caller.

## Derived State

Dependency order and cycles, RDB descriptors, capability requirements, query clauses, mapped column names, DTO instances, and transfer plans are derived and may be recreated.
Derived state never supplies missing semantic migration intent.
Provenance is evidence derived from trusted envelopes and is excluded from the model fingerprint.

## State-Changing Authority

Only explicit connection initialization changes connection state.
Only transaction commit makes row changes durable.
Only schema lifecycle operations create or drop structure.
Only an application/operator-authorized provisioning operation may install an extension or alter server capabilities.
Only explicitly invoked transfer actions copy or restore transferable database contents.
Only the host application or operator accepts the target, performs cutover, or authorizes source retirement.

## Invariants

Connection shutdown releases the Knex client.
Rollback prevents an internally owned failed operation from committing.
Derived descriptors never supersede the source DEM/map declarations.
Failed compilation exposes diagnostics but no executable canonical model or physical plan.
A runtime preflight result applies only to the connection, fingerprint, and operation it checked.
A source snapshot remains required for recovery from destructive in-place recreation.
An unaccepted parallel target never silently replaces the source as authoritative state.
