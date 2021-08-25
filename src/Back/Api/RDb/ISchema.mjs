/**
 * Interface for RDBMS schema builder.
 * @interface
 */
export default class TeqFw_Db_Back_Api_RDb_ISchema {
    /**
     * Initialize RDBMS schema builder.
     * @param {Object} opts
     * @return {Promise<void>}
     */
    async init(opts) {}

    /**
     * Create all tables using given connection.
     * @param {TeqFw_Db_Back_Api_IConnect} conn
     * @return {Promise<void>}
     */
    async createAllTables({conn}) {}

    /**
     * Drop all tables using given connection.
     * @param {TeqFw_Db_Back_Api_IConnect} conn
     * @return {Promise<void>}
     */
    async dropAllTables({conn}) {}

}
