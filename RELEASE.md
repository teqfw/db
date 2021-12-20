# @teqfw/db: releases

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
