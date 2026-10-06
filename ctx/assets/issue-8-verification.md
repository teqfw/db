# Issue 8 Verification

Date: 2026-10-06. Source: [teqfw/db issue 8](https://github.com/teqfw/db/issues/8).
This delivery evidence is not authoritative context. Accepted semantics are recorded
in ctx/docs; the implementation proposal and approved typing scope are recorded in
[issue-8-plan.md](issue-8-plan.md).

## Acceptance Evidence

| Criterion | Implementation and verification |
| --- | --- |
| 1. Preserve byDefault | Omitted-profile signed 32-bit/native generation assertion in test/integration/Back/Dem/Compile/AllocatedIdentity.test.mjs; existing schema/history/rebuild and native dialect suites pass. |
| 2. Accept allocated | Host map materialization and logical validation accept allocated; compiler tests execute all three adapters with 32/64-bit profiles. |
| 3. Reject unsupported modes | Compiler tests reject unknown/case-mismatched/null modes and malformed parameters, including models without identity attributes; per-entity allocated generation is rejected. |
| 4. Ordinary primary key | Adapter SQL tests reject native generation syntax; SQLite runtime tests reject omitted allocated IDs for both widths. SQLite uses INT rather than INTEGER for allocated 32-bit keys to avoid implicit ROWID generation. |
| 5. Allocate before INSERT | Identity integration and shared engine conformance allocate through real TeqFW transactions and explicitly insert the returned ID. |
| 6. Non-null self-reference | Shared engine conformance creates and persists id = parent_ref with a NOT NULL foreign key; integration tests verify the values. |
| 7. Same-scope committed uniqueness | Two independent connections overlap first allocation while a counter lock is held; subsequent IDs differ. PostgreSQL/MariaDB also cover a pre-existing repeatable-read snapshot and existing-scope contention. Same-transaction calls through multiple service instances are serialized and distinct. |
| 8. Independent scopes | Person and cross-package email allocations each start at 1; shared conformance and integration tests verify separate counters. |
| 9. Rollback consistency | Each engine rolls back allocation plus domain INSERT and verifies no partial row; a reconnect allocates the rolled-back ID again. Committed reservations survive deletion and rebuild. |
| 10. Caller transaction ownership | Allocation leaves the caller transaction active. Shared engine conformance also records/completes history inside an external transaction, checks it remains active, and verifies history rollback. |
| 11. PostgreSQL | Full opt-in suite passed against disposable PostgreSQL 18.4 with pgvector available; concurrent allocation, history, external rollback, import and sequence exclusion executed. |
| 12. SQLite | In-memory integration, disk-backed independent-connection conformance and rebuild acceptance passed. |
| 13. MySQL/MariaDB | Full opt-in suite passed against disposable MariaDB 10.11.14/InnoDB; concurrent allocation, prior snapshots, history, external rollback and import executed. |
| 14. Concrete reference derivation | Compiler tests compare the ID and derived reference logical types for both widths across all adapters. |
| 15. Distributed package references | Sample people and auth fragments use an owner-scoped host reference map; SQL/compiler and real engine tests exercise their foreign keys without changing package identity policy. |
| 16. Rebuild/import generated state | Rebuild acceptance transfers explicit IDs and durable reservations, seeds migrated native IDs, and rejects missing IDs. Real CLI import reconciles high-water marks and excludes obsolete serial metadata. Actual adapter restoration returns empty native evidence for allocated tables. Cyclic transfer rejection remains unchanged. |
| 17. Existing verification | npm test passes all four layers, package consumer typing passes, and all opt-in suites pass. The Human explicitly accepted the existing global typecheck debt; details below. |

Additional integration checks reject forged compilations, missing/inactive/mismatched
transactions, raw SQL/table-name input, missing counter declarations, corrupted scope
paths, negative counters, unsafe driver values and exhausted ranges. Allocation never
commits, rolls back or retries the supplied transaction. Persistence names come from
the authenticated compiled model. Counter increments use a guarded database update;
PostgreSQL/MariaDB counter reads hold row locks and SQLite serializes writers.

## Validation Results

- npm test: passed 102 unit, 18 integration, 2 acceptance and 1 package test files;
  no failures or skips. These are runner file counts, not individual assertion counts.
- npm run test:optin: passed preflight (3 cases), native PostgreSQL and MariaDB suites,
  and allocated identity conformance for both engines; no failures or skips.
- node --check: every src/**/*.mjs module passed.
- teqfw-esm-validator src --profile base: valid, zero violations.
- teqfw-platform .: valid, zero violations, no exclusions.
- adsm-ctx validate .: zero errors and warnings.
- npm run lint:md: zero errors; git diff --check: passed.
- npm run typecheck: failed with retained pre-existing debt. Baseline: 1133 diagnostics
  in 75 files. Final: 1083 diagnostics in 68 files. Comparing diagnostic multiplicities
  by file, TypeScript code and message (ignoring shifted line positions) found no added
  variants. No changed source/declaration file increased its use of any; compiler
  settings were preserved. Global typecheck is not a passed gate.

## Delivery Notes

Public usage and API documentation intentionally expose TeqFw_Db_Back_RDb_Identity$
with allocate({compilation, transaction, entity}) and synchronize({compilation,
transaction}); matching DbIdentity declarations are included. Allocation returns an
exact positive JavaScript safe integer, bounded further by the selected 32-bit profile.
Database lock/serialization errors propagate for caller-owned whole-operation retry.

The package-owned ordinary identitycounter entity must be selected and created through
the normal authorized schema lifecycle. Existing installations need their usual
migration/rebuild before enabling allocated. No implicit table creation or application
cutover is introduced. Durable counters must be retained with domain data during
transfer; synchronization raises their high-water marks and never lowers them.

Checks used disposable database instances on private ports and a temporary ignored
.env created for this task. Those instances and temporary credentials are removed
after verification. Verification completed before commit or push. The Human then
separately authorized commit, push, a comment linking the commit, and issue closure.
Package publication remains outside this delivery.
