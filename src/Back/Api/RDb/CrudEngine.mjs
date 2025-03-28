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
     *
     * @param {TeqFw_Db_Back_RDb_ITrans} trx DB transaction for data processing
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta meta data for related entity
     * @param {Object|Array} [data] data to process
     * @returns {Promise<*>} object with primary key data ({key1: ..., key2: ..., ...})
     */
    async create(trx, meta, data) {};

    /**
     * Delete one entity by key (primary or unique).
     *
     * @param {TeqFw_Db_Back_RDb_ITrans} trx DB transaction for data processing
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta meta data for related entity
     * @param {Object|Array} key key values (primary or unique)
     * @returns {Promise<number>} the number of deleted records
     */
    async deleteOne(trx, meta, key) {};

    /**
     * Delete entities using some condition ('where' clause).
     *
     * @param {TeqFw_Db_Back_RDb_ITrans} trx DB transaction for data processing
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta meta data for related entity
     * @param {Object|function} [where]
     * @returns {Promise<number>}
     */
    async deleteSet(trx, meta, where) {};

    /**
     * Get one entity by key (primary or unique). Return 'null' if result set contains more than one item.
     *
     * @param {TeqFw_Db_Back_RDb_ITrans} trx DB transaction for data processing
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta meta data for related entity
     * @param {number|string|boolean|Array|Object} key JS primitive for simple PK or object/array for complex PK or unique key
     * @returns {Promise<*>}
     * TODO: add columns filter to select (some cols could be a too big to be stored in memory)
     */
    async readOne(trx, meta, key) {};

    /**
     * @param {TeqFw_Db_Back_RDb_ITrans} trx DB transaction for data processing
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta meta data for related entity
     * @param {Object|string|function} [where]
     * @param [bind]
     * @param [order]
     * @param [limit]
     * @param [offset]
     * @returns {Promise<Array>}
     */
    async readSet(trx, meta, where, bind, order, limit, offset) {};

    /**
     * Read count of rows matching WHERE clause.
     * @param {TeqFw_Db_Back_RDb_ITrans} trx DB transaction for data processing
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta meta data for related entity
     * @param {Object|string|function} [where]
     * @param [bind]
     * @returns {Promise<number>}
     */
    async readSetCount(trx, meta, where, bind) {};

    /**
     * Update data for one entity by primary key.
     *
     * @param {TeqFw_Db_Back_RDb_ITrans} trx DB transaction for data processing
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta meta data for related entity
     * @param {Object|Array} data data to process (must contain primary key)
     * @returns {Promise<number>}
     */
    async updateOne(trx, meta, data) {};

    /**
     * Update data for set of entities by where clause.
     *
     * @param {TeqFw_Db_Back_RDb_ITrans} trx DB transaction for data processing
     * @param {TeqFw_Db_Back_Api_RDb_Schema_Object|TeqFw_Db_Back_RDb_Meta_IEntity} meta meta data for related entity
     * @param {Object|Array} data data to process
     * @param {Object|string|function} where
     * @returns {Promise<number>}
     */
    async updateSet(trx, meta, data, where) {};
}
