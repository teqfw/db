# @teqfw/db

|CAUTION: TeqFW is an unstable project w/o backward compatibility. Use it at your own risk.|
|---|

TeqFW: DB connectivity based on [knex](https://knexjs.org/) package.

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
