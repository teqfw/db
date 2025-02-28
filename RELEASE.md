# @teqfw/db: releases

## 0.23.2 - Use Selection in CRUD Base for `readMany`

- Implemented selection functionality in the CRUD base for the `readMany` operation.

## 0.23.1 - Use operations in `where` clause

- Enhanced the query builder to handle array values in `where` clauses (e.g., `('id', ['<=', 4])` becomes
  `('id', '<=', 4)`).
- Improve JSDoc in `TeqFw_Db_Back_App_Crud.updateOne` to prevent IDEA highlights.

## 0.23.0

- Introduced the `TeqFw_Db_Back_Api_RDb_Schema_Object` interface, deprecating `TeqFw_Db_Back_RDb_Meta_IEntity`.
- Added a new CRUD engine `TeqFw_Db_Back_App_Crud`.
- Introduced the transaction wrapper `TeqFw_Db_Back_App_TrxWrapper` for better transaction management.
- Added the `TeqFw_Db_Back_Api_RDb_Repository` interface to define repository operations.
- Enhanced support for SQLite in the CRUD engine, including better handling of primary keys.
- Improved unit tests for CRUD operations with detailed scenarios.
- Updated DEM loading logic to include optional test-specific data for schema initialization.
- Added utilities for grouping and selecting columns in database queries.

## 0.22.1

* Detect `Client_BetterSQLite3` constructor.

## 0.22.0

* Add the selection DTO for listing queries.
* Add the model to convert the selection DTO to the knex query.
* Extract the `TeqFw_Db_Shared_Enum_Direction` enumeration.
* Fix the error in `TeqFw_Db_Back_Cli_Export` with the export from missed table.
* Drop/create FK separately from the tables.
* Remove the legacy format for depIds

## 0.21.0

* Add the common export/import CLI commands.
* Add the `TeqFw_Db_Back_Act_Dem_Tables` action.
* Use platform specific paths separators (win/*nix).
* The class-based form for the `TeqFw_Db_Back_Util`.

## 0.20.1

* WF-674 Update knex version in RA
* WF-677 Add postprocessor chunk for loggers

## 0.20.0

* These changes are related to the new architecture of the `@teqfw/di` package.
* Command `TeqFw_Db_Back_Cli_Drop` to drop all tables.
* Rename `./doc/struct.md` to `./doc/schema.md` and improve documentation.

## 0.8.0

* Add `TeqFw_Db_Back_Process_CreateStruct` to create DB structure on startup.

## 0.7.0

* Add list of deprecated tables to drop on re-installation.
* Binary data type (`Buffer`) is added to DEM.

## 0.6.0

* Create CLI action to re-create RDB structure using DEM.
* Improve JSDoc comments.
* Rename interfaces in `_Api_` space.

## 0.5.1

* Remove dependency from `@teqfw/web`.

## 0.5.0

* Documentation improvement.
* Comments & JsDoc improvement.
* `TeqFw_Db_Back_Api_RDb_QueryBuilder` is added.
* Reflect changes in `TeqFw_Core_Shared_Api_...`.
* `tiny` modifier is added to `integer` datatype.
* `json` datatype is added.
* Improvements in `TeqFw_Db_Back_RDb_Connect`,`TeqFw_Db_Back_RDb_CrudEngine`, `TeqFw_Db_Back_Util`.

## 0.4.0

* Improve CRUD engine.
* Add SQLite support to config.
* Add `TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action` for foreign keys actions (restrict, delete, ...).

## 0.3.1

* Fix `readSet` in `TeqFw_Db_Back_RDb_CrudEngine`.

## 0.3.0

* Cast function for DTOs.
* DB utils refactoring.
* DEM (Domain Entities Model) support.
* CRUD engine basics.

## 0.2.0

* use `@teqfw/di.replace` in `./teqfw.json` as an object and not as an array;
* (re)create DB structure with DEM declaration;
* order `./Api/` subspace;
