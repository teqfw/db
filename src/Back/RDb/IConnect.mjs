// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_IConnect
 * @description TeqFW database package module.
 * @interface
 */

/**
 * Interface for RDBMS connection.
 * @interface
 * TODO: move to _Api_ namespace
 */
export default class TeqFw_Db_Back_RDb_IConnect {

    /**
     * @returns {Promise<void>}
     */
    async disconnect() {}

    /**
     * Access the underlying database client for dialect-specific execution.
     */
    getClient() {}

    /**
     * Initialize the component.
     */
    getSchemaBuilder() {}

    /**
     * Create new transaction to manipulate data in DB.
     * @param {any} opts
     * @returns {Promise<TeqFw_Db_Back_RDb_ITrans>}
     */
    async startTransaction(opts) {}

}
