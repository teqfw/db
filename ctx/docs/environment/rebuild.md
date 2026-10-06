# Rebuild Runtime Requirements

- Path: `ctx/docs/environment/rebuild.md`
- Changed: `20261006`

## In-Place Rebuild

Product-level rebuild obligations and the open orchestration boundary are defined in [product migration](../product/migration.md). This document defines runtime prerequisites and engine limits only.

An in-place rebuild uses one physical database identity before and after recreation.
Before destructive DDL begins, the caller must provide either:

- a readable durable snapshot stored outside the objects being replaced; or
- explicit authorization to discard all previous data.

The runtime must have permission to read every modeled source table, create and drop target objects, restore rows, manage constraints and indexes, and restore engine-specific sequence state where supported.
All target capabilities must pass read-only preflight before destructive DDL begins.

## Parallel Rebuild

A parallel rebuild requires independently addressable source and target storage.
The process needs read access to the source and structure/data write access to the target.
The source remains authoritative until the host application accepts the evidence and performs cutover.

The package does not require a particular parallel-rebuild topology.
Separate databases, isolated schemas, or another engine-supported separation mechanism are acceptable for source/target isolation only; this does not imply current support for several application database targets.

## Consistency Window

The base package does not implement online dual writes or change-data capture.
The caller must prevent source changes during a snapshot or transfer, accept a defined consistency point, or supply an external synchronization mechanism.

## Engine Boundaries

- PostgreSQL-specific sequence state is included where the implementation supports it.
- MariaDB/MySQL session behavior may require import preparation.
- SQLite may rebuild tables internally for schema operations and must not be assumed to provide the same DDL guarantees as PostgreSQL.
- MS SQL and Oracle behavior remains conditional on Knex and the installed driver until covered by package verification.

## Index Build Boundary

Primary and relation-target unique constraints are built with tables before foreign keys.
`afterRelations` indexes are built after constraints.
During a rebuild, `afterData` indexes are built only after required rows and engine state have transferred successfully.
IVFFlat vector indexes require `afterData`; rebuild declarations should select
`afterData` explicitly for HNSW.

Failure of a required late index makes the target unsuccessful and appears in rebuild evidence.
It does not authorize a parallel cutover or allow an in-place rebuild to discard its recovery snapshot.

## Failure Recovery

Rollback guarantees apply only to work enclosed by a transaction that the selected engine honors.
A durable snapshot is the recovery source for a failed destructive in-place rebuild.
For a failed parallel rebuild, the source remains authoritative and the caller decides whether to inspect, clear, or recreate the target.

## Allocated Identity Preservation

Preserve identitycounter rows together with explicit allocated IDs. Counter values may
exceed the largest live ID because an allocation can commit without a corresponding
row; do not reconstruct the whole counter solely from live rows. Target reconciliation
raises transferred counters to at least the maximum imported ID before normal work.
Imports lacking counters may seed them from explicit rows, but such an import cannot
preserve reservations absent from its source data. Quiescence and explicit migration
selection remain caller-owned.

Allocated identity columns have no native generated-sequence state. PostgreSQL sequence
restoration applies only to native-generated columns. When importing into allocated
mode, legacy dumped serial entries are not applied to allocated columns; any separately
declared native generators are restored from their transferred values. Switching from
byDefault to allocated requires an authorized physical schema transition; changing the
map alone does not alter an existing database. Cyclic transfer requirements are unchanged.
