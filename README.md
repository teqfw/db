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

### Namespace

This plugin uses `TeqFw_Db` namespace.

## Install

```shell
$ npm i @teqfw/db --save 
```

## Namespace

This plugin uses `TeqFw_Db` namespace.

## `./cfg/local.json`

[DTO](src/Back/Dto/Config/Local.mjs) for `@teqfw/db` node.

```json
{
  "@teqfw/db": {
    "client": "mysql2|pg|...",
    "connection": {
      "database": "dup",
      "filename": "/.../db.sqlite",
      "flags": ["for", "SQLite"],
      "host": "127.0.0.1",
      "password": "...",
      "port": 3210,
      "socketPath": "/path/to/socket",
      "user": "name"
    },
    "searchPath": ["PostgreSQL client allows you to set the initial search path"],
    "useNullAsDefault": true,
    "version": "When you use the PostgreSQL adapter to connect a non-standard database."
  }
}
```
