# Database Targets

- Path: `ctx/docs/product/targets.md`
- Changed: `20260904`

## Purpose

Define the product contract by which one TeqFW application uses one or more
database targets and establishes that each target is suitable before the
application begins normal work.

## Target Model

A database target is either one physical database or one independently
addressable namespace within a physical database. An application assigns a
complete target DEM to every target it uses. The target DEM is the selected
part of the application's effective DEM that describes the data the
application uses in that target; it is not a description of unrelated
objects in the same physical database.

Every target has two independent declarations:

- **scope** identifies the physical area described by its target DEM;
- **access mode** identifies whether the application may alter that area.

The application declares all of its targets. It cannot begin normal work
until every declared target has been checked and, where allowed, brought to
the required state.

## Scope

A target without a table-name prefix has full scope: its target DEM describes
the complete schema area entrusted to the application. An unexpected object
in that area is a mismatch. A target with a prefix has partial scope: every
table and other modeled physical object in its target DEM belongs to that
prefix. Objects outside the prefix are outside the application's competence
and do not affect its compatibility result. An unexpected object inside the
prefix is a mismatch.

A prefix is therefore a declaration of structural responsibility, not merely
a naming convention. A physical database that contains structures not owned
by the application must be used through a partial-scope target.

## Access Modes

`read` and `write` are independent from scope.

- A `read` target is verified but never changed by the application. Its
  target DEM completely describes the physical area assigned to that target.
  No schema-history record is required; compatibility is established from the
  actual target structure.
- A `write` target is verified against its target DEM and may be changed only
  through an authorized migration. It retains the immutable applied-state
  history needed to select and audit an application-owned transition.

Thus each of full/read, partial/read, full/write, and partial/write is a
valid product case.

## Target Relations

Every DEM relation, including its endpoints and constraints, belongs to one
database target. Targets do not have DEM relations between them. Application
behavior may read values from more than one target, but such coordination is
not a relational constraint and does not create a cross-target foreign key.

## Startup Compatibility

At startup, the application compiles its effective DEM, derives each target
DEM, and verifies the actual assigned area of every target. A compatible
target is ready. If all targets are ready, the application may begin normal
work.

Any mismatch blocks normal application startup. For a `read` target this is a
terminal result for that start. For a `write` target, an application/operator
policy may authorize automatic migration. The package then invokes the
application's migration script, obtains its evidence, and verifies the
actual target again. The application starts only if every target is then
compatible; a disabled, failed, or unverifiable migration leaves it stopped.

## Drift And Evidence

The last applied effective-DEM snapshot for a `write` target records the
state previously accepted by the application. It is not proof that the
physical target still has that state. Migration selection must therefore use
both recorded history and a fresh examination of the actual assigned area.
An unknown physical state is a mismatch, not permission to run a transition
chosen for another source state.

The package records and reports target-specific compatibility and migration
evidence. Application-owned migration scripts define the business meaning and
strategy of a transition; the package does not infer renames, conversions, or
an `ALTER` plan from a difference.
