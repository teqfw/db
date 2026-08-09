# Rebuild Runtime Requirements

- Path: `ctx/docs/environment/rebuild.md`
- Changed: `20260808`

## In-Place Rebuild

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

The package does not require a particular deployment topology.
Separate databases, isolated schemas, or another engine-supported separation mechanism are acceptable only when table naming, connection resolution, and foreign-key behavior remain unambiguous.

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
