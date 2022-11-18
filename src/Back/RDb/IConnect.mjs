/**
 * Interface for RDBMS connection based on 'knex' library.
 * @interface
 */
export default class TeqFw_Db_Back_RDb_IConnect {

    async disconnect() {}

    /**
     * This is hard binding to the lib, we should use more lib-independent naming (but I cannot do it yet)
     */
    getKnex() {}

    getSchemaBuilder() {}

    /**
     * Create new transaction to manipulate data in DB.
     * @param {*} [opts]
     * @return {Promise<TeqFw_Db_Back_RDb_ITrans>}
     */
    async startTransaction(opts) {}

}
