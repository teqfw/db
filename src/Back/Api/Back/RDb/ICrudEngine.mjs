/**
 * Interface for engine to perform simple CRUD queries.
 * @interface
 */
export default class TeqFw_Db_Api_Back_RDb_ICrudEngine {
    /**
     * Create new instance of an entity in DB.
     *
     * @param {Object|Array} data data to process
     * @param {TeqFw_Db_Back_RDb_Meta_IEntity} meta meta data for related entity
     * @param {TeqFw_Db_Back_RDb_ITrans} trx DB transaction for data processing
     * @return {Promise<Object>} object with primary key data ({key1: ..., key2: ..., ...})
     */
    async create(data, meta, trx) {};

    async deleteOne(data, meta, trx) {};

    async deleteSet(data, meta, trx) {};

    async readOne(data, meta, trx) {};

    async readSet(data, meta, trx) {};

    async updateOne(data, meta, trx) {};

    async updateSet(data, meta, trx) {};
}
