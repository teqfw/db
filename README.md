# @teqfw/db

| CAUTION: TeqFW is an unstable project w/o backward compatibility. Use it at your own risk. |
|--------------------------------------------------------------------------------------------|

This plugin allows you to create table structures for RDB (Relational Database) from a JSON definition on the TeqFW
platform. Each `teq`-plugin that needs to store data in RDB has its own JSON declaration for its part of the entire
data. `@teqfw/db` combines all the parts into one common declaration and creates or drops tables in the RDB.

Connectivity to PostgreSQL, MySQL/MariaDB, SQLite, MS SQL, and Oracle servers is made possible using
the [Knex.js](https://knexjs.org/) library.

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
      "passwordHash": "...",
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
