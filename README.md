# @teqfw/db

## Version lines

- `main` contains the 2.x line for `@teqfw/di` 2.x.
- `v1` preserves the legacy implementation and composition model.

The 2.x package registers `TeqFw_Db_` from `./src` in `package.json` and uses export-scoped `__deps__` declarations with DI 2.x named-export specifiers.

The authoritative project documentation is organized as ADSM cognitive context under [`ctx/docs`](ctx/docs/):

- [`product`](ctx/docs/product/overview.md) — scope, roles, use cases, and terms;
- [`architecture`](ctx/docs/architecture/overview.md) — model composition, schema, CRUD, and integrations;
- [`environment`](ctx/docs/environment/overview.md) — runtime and database prerequisites;
- [`code`](ctx/docs/code/overview.md) — source mapping, DI conventions, and testing.
The base plugin to work with RDBMS databases in the Tequila Framework (TeqFW).

## Disclaimer

This package is a part of the [Tequila Framework](https://flancer32.com/what-is-teqfw-f84ab4c66abf) (TeqFW). The TeqFW
is currently in an early stage of development and should be considered unstable. It may change rapidly, leading to
breaking changes without prior notice. Use it at your own risk. Please note that contributions to the project are
welcome, but they should only be made by those who understand and accept the risks of working with an unstable
framework.

## Overview

This plugin allows you to create table structures for RDB (Relational Database) from a JSON definition on the TeqFW
platform. Each `teq`-plugin that needs to store data in RDB has its own JSON declaration for its part of the entire
data. `@teqfw/db` combines all the parts into one common declaration and creates or drops tables in the RDB.

Validated dialect adapters currently cover PostgreSQL, MySQL/MariaDB, and SQLite through
the [Knex.js](https://knexjs.org/) library.

## Install

```shell
npm i @teqfw/db --save
```

## Namespace

This plugin uses `TeqFw_Db` namespace.

## Configuration

`@teqfw/db` consumes the `TEQFW_DB` namespace from `@teqfw/cfg`. The host must register the published
`TeqFw_Cfg_` DI namespace, select configuration Sources, and await `TeqFw_Cfg_Loader$.load()` before database
runtime components start.

Common connection settings use individual keys and require no JSON. The supported suffixes are `CLIENT`, `HOST`,
`PORT`, `USER`, `PASSWORD`, `DATABASE`, `FILENAME`, `SOCKET_PATH`, `SEARCH_PATH`, `USE_NULL_AS_DEFAULT`, and
`VERSION`. `EXTRA` accepts an object or JSON string for uncommon Knex and driver-specific options:

```dotenv
TEQFW_DB__CLIENT=pg
TEQFW_DB__HOST=127.0.0.1
TEQFW_DB__USER=application
TEQFW_DB__PASSWORD=secret
TEQFW_DB__DATABASE=application
TEQFW_DB__EXTRA='{"pool":{"min":1,"max":4},"connection":{"ssl":true}}'
```

See [`ctx/docs/environment/configuration.md`](ctx/docs/environment/configuration.md) for the authoritative contract.

### Named connections

All connections stay in the `TEQFW_DB` cfg namespace. Default keys start directly after `TEQFW_DB__`; named keys
add the normalized connection name to the parameter, for example `TEQFW_DB__REPORTING_CLIENT` and
`TEQFW_DB__REPORTING_EXTRA`. `TeqFw_Db_Back_Config$.get('reporting')` returns its immutable Knex configuration.

`TeqFw_Db_Back_RDb_Connect$` remains the package default singleton. A host that needs additional connections defines
application-owned DI tokens. Each such provider receives a separate `TeqFw_Db_Back_RDb_Connect$$`, while a host
lifecycle component initializes it with `config.get('<name>')` and disconnects it during shutdown. Production code
must not use Container test registration for named connections.

See [`.env.example`](.env.example) for default and named dotenv entries.
