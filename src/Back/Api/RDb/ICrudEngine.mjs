/**
 * Interface for engine to perform simple CRUD queries.
 * @interface
 */
export default class TeqFw_Db_Back_Api_RDb_ICrudEngine {
    /**
     * Create new instance of an entity in DB.
     *
     * @param {TeqFw_Db_Back_RDb_ITrans} trx DB transaction for data processing
     * @param {TeqFw_Db_Back_RDb_Meta_IEntity} meta meta data for related entity
     * @param {Object|Array} data data to process
     * @return {Promise<Object>} object with primary key data ({key1: ..., key2: ..., ...})
     */
    async create(trx, meta, data) {};

    async deleteOne(trx, meta, data) {};

    async deleteSet(trx, meta, data) {};

    /**
     * Get one entity by key (primary or unique).
     * @param {TeqFw_Db_Back_RDb_ITrans} trx DB transaction for data processing
     * @param {TeqFw_Db_Back_RDb_Meta_IEntity} meta meta data for related entity
     * @param {Object|Array} key key values (primary or unique)
     * @return {Promise<Object|null>}
     */
    async readOne(trx, meta, key) {};

    /**
     *
     * @param {TeqFw_Db_Back_RDb_ITrans} trx DB transaction for data processing
     * @param {TeqFw_Db_Back_RDb_Meta_IEntity} meta meta data for related entity
     * @param {Object|string|function} [where]
     * @param [bind]
     * @param [order]
     * @param [limit]
     * @param [offset]
     * @return {Promise<Array>}
     */
    async readSet(trx, meta, where, bind, order, limit, offset) {};

    async updateOne(trx, meta, data) {};

    async updateSet(trx, meta, data) {};
}
