# Rebuild Migration Capability

- Path: `ctx/docs/product/migration.md`
- Changed: `20260808`

## Purpose

Define the migration outcome owned by `@teqfw/db` and the point at which responsibility passes to an application-level migration capability.

## Supported Migration Model

The package supports migration by rebuilding a complete declared structure.
A rebuild has four product-level obligations:

1. Preserve source data through a durable dump or an independently readable source.
2. Create the target structure from the normalized target DEM.
3. Restore or copy compatible data in dependency order, using explicit transformations when supplied.
4. Expose the transfer result so the caller can decide whether the target is acceptable.

The target may be created in place after a durable snapshot, in another namespace when the database supports the required isolation, or in a separately provisioned database.
The package does not own deployment switching between source and target.

## Compatibility Boundary

The core package may transfer a value when the source table and field can be mapped explicitly to the target representation.
It must not guess that two differently named objects are the same, choose a conversion that can lose meaning, invent a value for a newly required field, or discard source data merely because a fragment disappeared.

Incompatible changes require a transformation supplied by the package that owns the affected model or by an external migration orchestrator.
The transformation is explicit input to the rebuild; it is not derived from database drift.

## Outside The Package

The following belong to a separate migration capability or the host application:

- schema introspection intended to synthesize arbitrary incremental changes;
- version graphs and ordered migration history;
- automatic `ALTER` planning;
- interpretation of renames, splits, merges, and semantic type conversions;
- application quiescence, online dual writes, cutover, and deployment coordination;
- cross-release rollback policy and long-term migration audit.

## Safety And Authority

Creating an empty target is non-destructive to an independent source.
Dropping or overwriting the source is destructive and requires explicit application or operator authority.
A rebuild result does not authorize cutover by itself; the caller evaluates transfer evidence and owns that decision.

## Required Product Evidence

A completed rebuild must make available at least a deterministic target description, processed tables, source and target row counts, skipped or failed items, applied transformation identity where applicable, and transaction outcome.
Any skipped required table or row makes the rebuild unsuccessful; optional evidence may record objects that are explicitly outside the selected modeled scope.
Database-specific verification may add stronger evidence, but the core package must not report success when a required table transfer failed.
