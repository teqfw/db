/**
 * Interface for main DB connection based on 'knex' library.
 * @interface
 */
export default class TeqFw_Db_Back_Api_IConnect {
    async disconnect() {}

    /**
     * @deprecated this is hard binding to the lib, we should use more lib-independent naming
     */
    getKnex() {}

    getSchemaBuilder() {}

    async startTransaction() {}

}