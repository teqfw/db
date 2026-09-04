# Rebuild Migration Capability

- Path: `ctx/docs/product/migration.md`
- Changed: `20260904`

## Purpose

Define the rebuild capability and the standardized startup migration coordination provided by `@teqfw/db`.

## Supported Migration Model

The package provides primitives for rebuilding a complete declared structure, preserving compatible data, returning transfer evidence, and coordinating an application-owned migration script for an authorized write target at startup.
A migration is always limited to the target's declared full or prefix-bounded physical scope.
A rebuild has four product-level obligations:

1. Preserve source data through a durable dump or an independently readable source.
2. Create the target structure from the normalized target DEM.
3. Restore or copy compatible data in dependency order, using explicit transformations when supplied.
4. Expose the transfer result so the caller can decide whether the target is acceptable.

The target may be created in place after a durable snapshot, in another namespace when the database supports the required isolation, or in a separately provisioned database.
The package does not own deployment switching between source and target.

## Startup Migration Coordination

Before normal application work begins, the package verifies every declared target. A mismatch on a read target blocks startup. A mismatch on a write target blocks startup unless application/operator policy authorizes automatic migration. In that case the package supplies the application migration script with the target's recorded applied-state context and fresh target DEM, records target-specific evidence, and verifies the actual target after the script returns.

The application owns the migration strategy and semantics. The package may execute the script and bounded rebuild/transfer primitives, but does not select a transition from an inferred database difference. A write target whose migration fails, is disabled, or cannot be verified remains unavailable, so the application remains stopped.

## Compatibility Boundary

The core package may transfer a value when the source table and field can be mapped explicitly to the target representation.
It must not guess that two differently named objects are the same, choose a conversion that can lose meaning, invent a value for a newly required field, or discard source data merely because a fragment disappeared.

Incompatible changes require a transformation selected by the host application's migration script. Package developers may supply transformation semantics to that application, but the application owns their selection and order. The transformation is explicit input to the rebuild; it is not derived from database drift.

## Outside The Package

The following do not belong to the package's rebuild primitives or startup migration coordination and remain the responsibility of the host application or operator:

- schema introspection intended to synthesize arbitrary incremental changes;
- automatic `ALTER` planning;
- interpretation of renames, splits, merges, and semantic type conversions;
- application quiescence, online dual writes, cutover, and deployment coordination beyond blocking normal startup;
- cross-release rollback policy and long-term migration audit.

## Safety And Authority

Creating an empty target is non-destructive to an independent source.
Dropping or overwriting the source is destructive and requires explicit application or operator authority.
A rebuild result does not authorize cutover by itself; the caller evaluates transfer evidence and owns that decision.

## Required Product Evidence

A completed rebuild or application migration must make available at least a deterministic target description, processed tables, source and target row counts where data transfer occurs, skipped or failed items, applied migration-script and transformation identities where applicable, and transaction outcome.
Any skipped required table or row makes the rebuild unsuccessful; optional evidence may record objects that are explicitly outside the selected modeled scope.
Database-specific verification may add stronger evidence, but the core package must not report success when a required table transfer failed.
