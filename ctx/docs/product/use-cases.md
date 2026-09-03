# Product Use Cases

- Path: `ctx/docs/product/use-cases.md`
- Changed: `20260813`

## UC-1 Configure And Connect

The host application configures the one target database supported by the current implementation. It supplies the connection and lifecycle context required to create, access, and rebuild the assembled application schema.

## UC-2 Compose The Application Model

The host application loads its own DEM plus the fragments supplied by selected teq-plugins, including `teqfw.db.schema` when supplied by `@teqfw/db`, applies the application-owned map for cross-package dependencies, and requests compilation for its one current database target.
It receives either one immutable canonical model with provenance or one aggregated diagnostic failure with no executable partial model.

## UC-3 Create, Recreate, Or Drop Structure

An authorized caller creates, recreates, or removes the selected database structure from the assembled application schema. Database-specific ordering and capability checks are handled by the architecture.

## UC-4 Execute CRUD

A developer creates, reads, updates, or deletes records through a schema-aware API backed by the assembled application model, so relations between package-owned data remain visible to the access layer.

## UC-5 Select Record Sets

A developer describes filters, projections, ordering, and pagination through a schema-bound selection API.
The package maps only schema-approved attributes and operations, preserving the relations and boundaries of the assembled application schema.

## UC-6 Export Data

An operator exports the modeled application data into a durable JSON dump that can be restored by the package.

## UC-7 Import Data

An operator imports a dump into the modeled application structure and receives the result of the operation.

## UC-8 Rebuild With Data Preservation

An authorized caller captures source data, creates the target structure from the current canonical DEM, transfers compatible data, and receives evidence for deciding whether the target is acceptable.
The source may be an earlier schema, another database, or a durable dump created before recreation.

## UC-9 Delegate Incompatible Transformation

When source and target representations are not structurally compatible, the caller supplies explicit transformation behavior owned by the relevant package or host/future migration capability.
`@teqfw/db` executes the bounded transfer contract but does not infer renames, conversions, or application release policy.

## UC-10 Diagnose An Invalid Distributed Model

A developer compiles all fragments and, when needed, plans a selected operation without mutating a database.
It receives deterministic diagnostics for every independently detectable ownership conflict, unknown type, unresolved endpoint, invalid key, incompatible relation, unsupported capability, or operation cycle without a supported strategy.
Each diagnostic identifies canonical location and trusted source provenance so the owning package or application map can be corrected.

## UC-11 Retain And Verify Schema History

A migration agent records a successfully compiled effective DEM through the `snapshot` entity declared by `teqfw.db.schema`, starts an application attempt through its `application` entity from the last applied snapshot to a target snapshot, and marks it applied only after the active catalog matches the target projection.
It can resolve the last applied snapshot for planning and diagnose a mismatch without requesting an inferred migration.

## Explicitly Unsupported Use Case

The package does not inspect arbitrary schema drift and synthesize a complete incremental migration plan.
An application that requires versioned in-place changes, online rollout, or multi-release rollback uses a separate migration capability.
