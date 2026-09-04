# Product Use Cases

- Path: `ctx/docs/product/use-cases.md`
- Changed: `20260904`

## UC-1 Configure Database Targets

The host application configures one or more database targets. For each it
declares a physical database or namespace, a full or prefix-bounded scope, a
`read` or `write` access mode, and the target DEM it uses. It supplies the
connection and lifecycle context required to verify and, for an authorized
write target, migrate that area.

## UC-2 Compose The Application Model

The host application loads its own DEM plus the fragments supplied by selected
teq-plugins, including `teqfw.db.schema` when supplied by `@teqfw/db`, applies
the application-owned map for cross-package dependencies, and derives a
complete target DEM for every declared database target.
It receives either immutable canonical models with provenance or an aggregated
diagnostic failure with no executable partial model. It cannot assign the
endpoints of one relation to different targets.

## UC-3 Verify Targets Before Startup

At every application startup, the package verifies each target's actual
assigned area against its target DEM. A partial target is checked only inside
its prefix; a full target is checked across its complete entrusted area. The
application begins normal work only if every target is compatible.

## UC-4 Create, Recreate, Or Drop Structure

An authorized caller creates, recreates, or removes the assigned area of a
write target from its target DEM. Database-specific ordering and capability
checks are handled by the architecture.

## UC-5 Execute CRUD

A developer creates, reads, updates, or deletes records through a schema-aware
API backed by the target DEM, so relations between package-owned data remain
visible to the access layer.

## UC-6 Select Record Sets

A developer describes filters, projections, ordering, and pagination through a
schema-bound selection API. The package maps only target-DEM-approved
attributes and operations.

## UC-7 Export Data

An operator exports the modeled data from the assigned area of a write target
into a durable dump that can be restored by the package.

## UC-8 Import Data

An operator imports a dump into the modeled assigned area of a write target
and receives the result of the operation.

## UC-9 Rebuild With Data Preservation

An authorized caller captures source data, creates the assigned target area
from the current target DEM, transfers compatible data, and receives evidence
for deciding whether the target is acceptable. The source may be an earlier
schema, another database, or a durable dump created before recreation.

## UC-10 Migrate A Write Target At Startup

If a write target does not match and automatic migration is authorized,
`@teqfw/db` invokes the application's migration script. The application script
chooses the transition strategy from the target's recorded applied state and
the fresh target DEM; the package independently verifies the actual target
before and after it. A disabled, failed, or unverifiable migration leaves
normal application startup blocked.

## UC-11 Delegate Incompatible Transformation

When source and target representations are not structurally compatible, the
application migration script supplies explicit transformation behavior.
`@teqfw/db` executes the bounded transfer contract but does not infer renames,
conversions, or application migration strategy.

## UC-12 Diagnose An Invalid Distributed Model

A developer compiles all fragments and, when needed, plans a selected
operation without mutating a database. It receives deterministic diagnostics
for every independently detectable ownership conflict, unknown type,
unresolved endpoint, invalid key, incompatible relation, unsupported
capability, or operation cycle without a supported strategy. Each diagnostic
identifies canonical location and trusted source provenance so the owning
package or application map can be corrected.

## UC-13 Retain And Verify Write-Target History

A migration coordinator records a successfully compiled target DEM for a write
target through the `snapshot` entity declared by `teqfw.db.schema`, starts an
application attempt through its `application` entity from the last applied
snapshot to a target snapshot, and marks it applied only after the active
assigned area matches the target projection. It can resolve the last applied
snapshot for application migration selection and diagnose a mismatch without
inferring a migration. A read target has no schema history and is checked only
against its actual assigned area.

## Explicitly Unsupported Use Case

The package does not inspect arbitrary schema drift and synthesize a complete
incremental migration plan. It does not choose transition semantics, renames,
conversions, online rollout, or multi-release rollback for an application
migration script.
