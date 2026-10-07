# @teqfw/db

![npms.io](https://img.shields.io/npm/dm/@teqfw/db)

> **Human-governed. Agent-built. Agent-ready.**

`@teqfw/db` is the relational persistence foundation for the [Tequila Framework (TeqFW)](https://teqfw.com/). It turns explicit DEM v2 declarations contributed by an application and its packages into one validated relational model, then provides schema, transaction, typed-query, and rebuild tools around it.

## Why It Matters

Applications can keep relational declarations close to the packages that own them while still building one explicit database target. `@teqfw/db` validates how those fragments fit together before database work begins, preserves the source of every composed element and diagnostic, and gives the host application control over the final database lifecycle.

It supports PostgreSQL, MySQL/MariaDB, and SQLite through [Knex](https://knexjs.org/), with dialect-aware capabilities for other supported configurations.

## What It Provides

- Composition and validation of distributed Data Entity Model (DEM) fragments.
- Logical `core.identity` and `core.ref` types, materialized by the host's `identityProfile` without package-specific key-width choices.
- Dialect-aware schema projection, typed relational queries, and rebuild operations.
- Explicit transaction ownership: operations can use a caller transaction or manage their own.
- Rebuild-oriented structure recreation and compatible data transfer with evidence.
- Immutable effective-DEM snapshots and append-only schema-application history for migration agents; catalog mismatches are diagnostic evidence, never inferred migrations.

Every target-schema entity comes from a selected DEM fragment. `@teqfw/db` publishes the ordinary `teqfw.db.schema` fragment in `etc/teqfw.schema.json` for its `snapshot` and `application` history entities; the standard loader discovers it with other installed-package fragments, and the compiler does not add hidden semantic entities after composition.

DEM fragments may shorten repeated package nesting with a lowercase dot-delimited root:

```json
{
  "version": 2,
  "namespace": "vendor.sales",
  "entity": {"order": {}}
}
```

The logical path is `/vendor/sales/order`; the root is expanded before composition and omitted optional nodes are handled by the compiler. The application-map `namespace` remains a separate physical table prefix.

Omit the map prefix by default when the application exclusively owns its database/table space; the example then uses table `vendor_sales_order`. Select a prefix when independent applications share that space and need distinct table prefixes, or when another explicit host deployment requirement calls for one. Multiple packages contributing fragments to one application do not justify an extra prefix. Always configure each connection resolver from `compilation.physical.namespace`, including when empty. Changing the prefix in a populated database requires an explicit migration/rebuild plan: editing the map does not rename tables or transfer data. See [prefix selection](skills/teqfw-db/references/usage.md#application-map-prefix-selection).

## DEM Identity And References

Package fragments declare logical identity and reference types; the host selects one `identityProfile` for the target model. For example:

```json
{
  "attr": {
    "id": {"type": {"id": "core.identity"}},
    "ownerId": {"type": {"id": "core.ref"}}
  },
  "relation": {
    "owner": {"attrs": ["ownerId"], "ref": {"path": "/user", "attrs": ["id"]}}
  }
}
```

`core.ref` always points through a relation to a `core.identity`; it receives the identity representation, is never generated, and does not select a SQL type. The host profile lets the same package model use the target database representation. See the packaged [consumer skill](skills/teqfw-db/SKILL.md) for integration details.

The experimental `allocated` mode and its counter service existed only in
intermediate development commits after 2.3.0 and are not included in 2.4.0. Existing
databases using those snapshots require an explicit migration/rebuild to native-generated
keys, preserving IDs and foreign keys and restoring native sequence state. Changing
the map alone does not convert columns or remove the old counter table.

## Install

Requires Node.js 22 or newer and `@teqfw/di` 2.11 or newer within the 2.x line.

```sh
npm install @teqfw/db
```

The package registers the `TeqFw_Db_` DI namespace. Configure the connection through `@teqfw/cfg`, load its configuration before starting database services, and compose runtime components through that namespace.

## Development Verification

From a standalone checkout, install the locked dependency graph and run the package suite:

```sh
npm ci
npm run verify
npm audit
```

Package tests inspect and unpack a real npm tarball, verify its declaration and
runtime DI contracts, and exclude development assets and working configuration.
Before publishing, inspect `npm pack --dry-run`; `prepublishOnly` runs verification
and the production dependency audit. Publishing requires a new version and explicit
maintainer intent. See [the security policy](SECURITY.md) for reporting and trust boundaries.

The agent publishes from the verified local `main` checkout when the Human
explicitly authorizes publication. It checks the version and changelog, audits
dependencies, inspects the npm artifact, and runs `npm publish` using the existing
npm authentication. The `prepublishOnly` hook enforces verification and the
production dependency audit. GitHub Actions verifies changes; it does not publish.
After publication, the agent checks the registry version, dist-tag, and integrity.

## Best Fit And Boundaries

Use `@teqfw/db` when a TeqFW application needs a shared relational persistence layer with declarations distributed across its packages and a predictable, validated database target.

It is not an ORM, does not own application entities, authorization, or business rules, and does not infer incremental migrations from database drift. A rebuild preserves data only through an explicit snapshot or source-to-target transfer; release sequencing, cutover, and rollback policy stay with the application.

For product and architectural background, see the project [context](https://github.com/teqfw/db/tree/main/ctx/docs/). The package root is type-only; runtime integration is through the `TeqFw_Db_` namespace rather than `@teqfw/db/src/**` imports.

## Agent-Driven Development

TeqFW is built through the same development model that it is designed to enable: one human defines the intent, architecture, constraints, and acceptance criteria; coding agents implement and maintain the products; other agents use those products in different combinations to create applications.

`@teqfw/db` is a foundational package of TeqFW. The package includes a version-matched Agent Skill in `skills/teqfw-db`. This README provides a human-facing product overview; the skill provides agents with the package concepts, contracts, integration rules, examples, and boundaries.

Mount the skill into a host project:

```sh
mkdir -p .agents/skills
ln -s ../../node_modules/@teqfw/db/skills/teqfw-db \
  .agents/skills/teqfw-db
```

Each TeqFW package is both a practical software component and a working demonstration of human-governed, agent-driven development. This work follows the Agent-Driven Software Management (ADSM) approach: human intent, architectural authority, acceptance, and responsibility remain authoritative; agents act as implementation and reasoning partners.

- [Tequila Framework](https://teqfw.com/?from=github-teqfw-db)
- [Agent-Driven Software Management: A Practical Guide](http://fly.wiredgeese.com/flancer/leanpub/adsm-en/?from=github-teqfw-db)
- [Alex Gusev](https://github.com/flancer64)

## License

[Apache-2.0](LICENSE)
