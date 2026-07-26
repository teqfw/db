// @ts-check

/**
 * @namespace TeqFw_Db_Back_Api_RDb_CrudEngine
 * @description TeqFW database package module.
 * @interface
 */

/**
 * Interface for engine to perform simple CRUD queries.
 * @interface
 *
 * TODO: add `storeOne` method to save new or update existing record
 *
 */
export default class TeqFw_Db_Back_Api_RDb_CrudEngine {
    /**
     * Create new instance of an entity in DB.
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta
     * @param {Object|Array} data
     * @returns {Promise<*>}
     */
    async create(trx, meta, data) {};

    /**
     * Delete one entity by key (primary or unique).
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta
     * @param {Object|Array} key
     * @returns {Promise<number>}
     */
    async deleteOne(trx, meta, key) {};

    /**
     * Delete entities using some condition ('where' clause).
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta
     * @param {Object|function} where
     * @returns {Promise<number>}
     */
    async deleteSet(trx, meta, where) {};

    /**
     * Get one entity by key (primary or unique). Return 'null' if result set contains more than one item.
     *
     * TODO: add columns filter to select (some cols could be a too big to be stored in memory)
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta
     * @param {number|string|boolean|Array|Object} key
     * @returns {Promise<*>}
     */
    async readOne(trx, meta, key) {};

    /**
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta
     * @param {Object|string|function} where
     * @param {any} bind
     * @param {any} order
     * @param {any} limit
     * @param {any} offset
     * @returns {Promise<Array>}
     */
    async readSet(trx, meta, where, bind, order, limit, offset) {};

    /**
     * Read count of rows matching WHERE clause.
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta
     * @param {Object|string|function} where
     * @param {any} bind
     * @returns {Promise<number>}
     */
    async readSetCount(trx, meta, where, bind) {};

    /**
     * Update data for one entity by primary key.
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta
     * @param {Object|Array} data
     * @returns {Promise<number>}
     */
    async updateOne(trx, meta, data) {};

    /**
     * Update data for set of entities by where clause.
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta
     * @param {Object|Array} data
     * @param {Object|string|function} where
     * @returns {Promise<number>}
     */
    async updateSet(trx, meta, data, where) {};
}
