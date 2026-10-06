# Issue 8: Preallocated Identity Implementation Proposal

Status: approved by the Human and implemented on 2026-10-06. Verification is recorded
in [issue-8-verification.md](issue-8-verification.md). These review artifacts are not
authoritative context.

Source: [teqfw/db issue 8](https://github.com/teqfw/db/issues/8)

## Assessment

The requirement belongs to the package's schema-bound relational persistence role.
Preallocation preserves a non-null self-reference without introducing application
entities, authorization policy, deferred foreign keys, or migration inference.

The existing compiler materializes logical identity attributes through the host map's
identityProfile. Logical validation currently rejects allocated; all three adapters
only project byDefault. Native identity generation is also used by the package's
snapshot and application history entities. These paths must change together.

The proposal is compatible with the current context if the counter comes from a
selected package-owned DEM fragment, allocation uses only the supplied transaction,
and cyclic transfer rules remain explicit. Security and concurrency claims remain
conditional until runtime verification passes.

## Proposed Contract

- Preserve the omitted-profile default: signed 32-bit core.integer and byDefault.
- Add allocated to the host-owned identityProfile generation mode. Do not introduce
  per-entity allocation policy or database mechanisms in reusable fragments.
- Materialize allocated identity as an ordinary non-null integer/bigint primary key.
  Preserve logical reference derivation, external maps, provenance, and fingerprints.
- Intentionally document TeqFw_Db_Back_RDb_Identity$ as the consumer allocation token,
  with allocate({compilation, transaction, entity}) returning Promise<number>.
  Compilation must be authentic and successful; entity is a canonical DEM entity path;
  transaction is an active caller-owned TeqFW database transaction.
- Reject missing/inactive transactions, unsupported dialects, unknown entity paths,
  native-generation entities, malformed counter state, and identity exhaustion before
  a successful allocation. Verify the transaction adapter and operation capabilities.
- Never commit, roll back, replace, or retry the caller's transaction. Database lock,
  deadlock, and serialization failures propagate for caller-owned whole-operation retry.
- Return only exact positive safe integers within the profile's range. The current
  core.integer value contract already limits 64-bit values to JavaScript safe integers;
  do not silently round driver-returned bigint values or overflow that boundary.

## Persistence And Concurrency

Add an ordinary counter entity to etc/teqfw.schema.json, which is already published and
discovered as the teqfw.db.schema fragment. Its primary key is an explicit scope key,
not core.identity, avoiding recursive allocation. Retain the canonical entity path and
use a bounded deterministic indexed key if needed; detect any key/path mismatch.
Resolve all physical names from the authenticated physical plan. Never accept raw
table names or declaration-provided SQL. Direct compiler callers must include the
ordinary counter fragment when requesting allocation; no hidden table creation or
compiler-owned semantic node is allowed.

Initialize/lock the scope row using transactional conflict handling, increment the
counter atomically in the database, and read the result while the transaction still
holds the write lock. Guard the increment by the supported upper bound. A plain
unlocked SELECT/increment/UPDATE sequence is forbidden. Different canonical entity
paths use separate counter rows in the selected physical target.

PostgreSQL and InnoDB arbitrate conflicting writes with row locks; SQLite serializes
writers. The implementation must prove committed uniqueness using independent
connections and overlapping transaction lifetimes, including first allocation of a
previously unseen scope. Contention may produce a transaction error, never a duplicate
successful committed allocation. Same-transaction concurrent calls must also return
distinct values or be explicitly serialized by the service.

Counter rows and domain inserts share the outer transaction. Rollback may make an
uncommitted allocation reusable. Committed counter state must survive process restart
and must not move backwards when domain rows are deleted.

## Related Paths

- Update schema history to allocate snapshot/application IDs in allocated mode;
  preserve its current native mode behavior and transaction ownership.
- Treat allocated fields as requiring explicit values during transfer. Their generation
  descriptor must never trigger native identity DDL or PostgreSQL sequence restoration.
- Transfer durable counters and reconcile their high-water marks with transferred
  explicit IDs before further allocation. Cover imports with missing or stale counters
  and migration from byDefault to allocated. Do not infer application transformations.
- Preserve rollback and preservation evidence. Keep rebuild-cycle strategies unchanged;
  a preallocated self-reference does not make cyclic bulk transfer implicitly supported.
- Existing installations selecting the package fragment receive an additional declared
  table in their target model. Creating it requires the normal authorized schema
  lifecycle/migration; enabling allocated never mutates an existing schema implicitly.

## Deliverables And Verification

Update product identity semantics, architecture decisions/declarations/validation/state,
environment requirements, and code/testing delivery facts in ctx/docs. Preserve the
existing semantic skins. Update README.md and skills/teqfw-db consumer concepts, usage,
and API guidance with a complete non-null self-reference transaction example and
counter preservation requirements. Publish matching types and package contracts.

Verify all 17 issue acceptance criteria through compiler and projection tests, new
source-relative unit tests, DI integration, SQLite execution, history, import/rebuild,
package/type consumer checks, and PostgreSQL plus MariaDB opt-in execution. Include
concurrent first use, repeated use, scope independence, rollback, transaction ownership,
range exhaustion, unsafe driver values, forged compilation, and SQL-name rejection.

Required gates: npm test; npm run typecheck; npm run test:optin after disposable-database
preflight; node --check for every source; teqfw-esm-validator src --profile base;
teqfw-platform . with no exclusions; documentation validation; git diff --check.

Baseline on 2026-10-06: main equals origin/main; working tree initially clean.
npm test passed all four layers (101 unit, 15 integration, 1 acceptance, 1 package).
teqfw-platform returned valid:true with no violations. npm run typecheck failed with
extensive pre-existing source/declaration errors, as already recorded in code/overview.md.
Repair truthful contracts needed for the required type gate; do not weaken compiler
settings, add any, erase shapes, or claim a failing gate passed. Record any unexpectedly
broad prerequisite separately for Human review rather than silently expanding scope.

The implementation approval did not authorize commit, push, publication, or GitHub
comments. After verification, the Human separately authorized committing and pushing
the changes, posting the commit link to issue 8, and closing that issue.

## Concurrency References

- [Knex conflict handling](https://knexjs.org/guide/query-builder.html#onconflict)
- [PostgreSQL INSERT](https://www.postgresql.org/docs/18/sql-insert.html)
- [InnoDB locking](https://dev.mysql.com/doc/refman/8.0/en/innodb-locks-set.html)
- [SQLite isolation](https://www.sqlite.org/isolation.html)

## Approved Typing Scope

The Human chose to retain and report the initial global typing debt and repair affected
contracts only. The measured baseline is 1133 errors in 75 files. Global typecheck is
therefore reported as a known pre-existing limitation rather than a passed gate.
