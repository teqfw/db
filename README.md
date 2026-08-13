# @teqfw/db

![npms.io](https://img.shields.io/npm/dm/@teqfw/db)

> **Human-governed. Agent-built. Agent-ready.**

`@teqfw/db` turns database declarations contributed by an application and its packages into one validated relational model, then provides schema, transaction, query, CRUD, and rebuild tools around it. It is a foundational package of the [Tequila Framework (TeqFW)](https://teqfw.com/): created and evolved by coding agents under the architectural direction and final responsibility of [Alex Gusev](https://github.com/flancer64), and shipped with a version-matched Agent Skill so other agents can understand, integrate, and use it correctly.

## Why It Matters

Applications can keep relational declarations close to the packages that own them while still building one explicit database target. `@teqfw/db` validates how those fragments fit together before database work begins and preserves the source of every composed element and diagnostic.

It supports PostgreSQL, MySQL/MariaDB, and SQLite through [Knex](https://knexjs.org/), with dialect-aware capabilities for other supported configurations.

## What It Provides

- Composition and validation of distributed Domain Entity Model (DEM) fragments.
- Logical `core.identity` and `core.ref` types, materialized by the host's `identityProfile` without package-specific key-width choices.
- Dialect-aware schema projection, relational queries, and CRUD operations.
- Explicit transaction ownership: operations can use a caller transaction or manage their own.
- Rebuild-oriented structure recreation and compatible data transfer with evidence.

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

## Install

```sh
npm install @teqfw/db
```

The package registers the `TeqFw_Db_` DI namespace. Configure the connection through `@teqfw/cfg`, load its configuration before starting database services, and compose runtime components through that namespace.

## Development Verification

From a standalone checkout, install the locked dependency graph and run the package suite:

```sh
npm ci
npm test
```

## Best Fit And Boundaries

Use `@teqfw/db` when a TeqFW application needs a shared relational persistence layer with declarations distributed across its packages.

It is not an ORM, does not own application entities, authorization, or business rules, and does not infer incremental migrations from database drift. A rebuild preserves data only through an explicit snapshot or source-to-target transfer; release sequencing, cutover, and rollback policy stay with the application.

For product and architectural background, see the project [context](ctx/docs/). The package root is type-only; runtime integration is through the `TeqFw_Db_` namespace rather than `@teqfw/db/src/**` imports.

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
