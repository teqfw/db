# DEM v2 Implementation Map

- Path: `ctx/docs/code/dem.md`
- Changed: `20260903`

## Current Contract

The evolving 2.x line accepts only explicit DEM v2 declarations and application maps. Every input has `version: 2`; omitted or unsupported versions fail with deterministic diagnostics before composition. Fragment declarations may use a lowercase dot-delimited `namespace` root; the decoder expands it into the ordinary package structure and resolves local relation paths against the expanded root. The branch `v1` is retained as historical reference, not as a runtime compatibility boundary. Agents comparing that branch with current v2 may prepare migration guidance for a specific consumer; this package does not publish a generic migration guide.

## Implementation Boundary

`src/Back/Dem/Compile/` validates and canonicalizes v2 DTOs, composes owned fragments, maps external references, resolves identity/reference policy, validates the logical graph, and projects through the selected adapter. The successful immutable result is the only input accepted by schema, rebuild, and query execution.

Each compiler stage has its own structural JSDoc contract. The decoded fragment, composed canonical DEM, resolved/mapped model, validated model, and physical plan are not interchangeable `object` or `any` values. Reused shapes belong in named `TeqFw_Db_*` aliases published through `types.d.ts`; stage-specific aliases make illegal field access and accidental stage skipping visible to `npm run typecheck`.

`src/Back/Dem/Compile/A/ValidateNames.mjs` rejects raw package and entity keys outside `^[a-z][a-z0-9]*$` before decoding can treat them as canonical identities. It applies the same rule to every dot-separated segment of an optional declaration-level fragment root such as `teqfw.db.schema`. `src/Back/Dem/Compile/A/DecodeV2.mjs` expands valid roots into ordinary package containers before composition and resolves local relation paths against the expanded root. The physical table projection keeps every logical entity-path segment and joins them with `_`; the optional map namespace is a separate physical prefix.

`src/Back/Mod/Selection.mjs` accepts Selection v2 typed expressions. It does not decode legacy condition objects. Schema, rebuild, and dialect modules consume the same canonical model and retain transaction ownership boundaries.

`@teqfw/db` supplies an ordinary `teqfw.db.schema` declaration with `snapshot` and `application` in `etc/teqfw.schema.json`. The standard scanner discovers it with every other installed-package fragment, and the compiler composes it without a package-specific path. `result.effective` remains derived from the dialect-independent canonical model and provenance, while `result.fingerprint` remains the physical-plan identity.
Every trusted source in effective provenance carries a content-derived immutable `revision`; direct compiler callers do not supply it.

## Delivery Gaps Against The Accepted Architecture

There is no known delivery gap for the package-owned schema-history fragment or the concise fragment-root namespace:
both are published/decoded, composed, projected, and verified through the ordinary DEM pipeline.

## Required Verification

- Unit tests reject a declaration or map without `version: 2` and cover deterministic composition, diagnostics, provenance, graph analysis, logical validation, and physical planning. They prove that every target-schema entity, including `teqfw.db.schema/snapshot` and `teqfw.db.schema/application`, originates in an ordinary fragment envelope and that no compiler-side semantic-node injection occurs.
- Integration tests resolve DI 2.x components and execute v2 schema and Selection flows through SQLite/Knex.
- Acceptance tests compile DEM v2, create a target, transfer data through rebuild, and inspect structured evidence.
- The opt-in PostgreSQL/pgvector and MariaDB/MySQL suites provide external conformance before claiming engine-specific support.
- `npm test`, `npm run typecheck`, `teqfw-esm-validator src --profile base`, source `node --check`, `git diff --check`, and the no-new-`any` ratchet gate are the local release checks. Any failed check is a delivery gap; broadening a JSDoc contract to `any` is not an accepted repair.
