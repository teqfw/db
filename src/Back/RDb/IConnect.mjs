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
export default class IConnect {

    /**
     * @returns {Promise<void>}
     */
    async disconnect() {}

    /**
     * Access the underlying database client for dialect-specific execution.
     * @returns {TeqFw_Db_KnexQuerySource}
     */
    getClient() { throw new Error('Connection interface method.'); }

    /**
     * Initialize the component.
     * @returns {TeqFw_Db_KnexSchema}
     */
    getSchemaBuilder() { throw new Error('Connection interface method.'); }

    /**
     * Create new transaction to manipulate data in DB.
     * @param {TeqFw_Db_TransactionOptions} [opts]
     * @returns {Promise<TeqFw_Db_Back_RDb_ITrans>}
     */
    async startTransaction(opts) { throw new Error('Connection interface method.'); }

    /** @returns {TeqFw_Db_DialectAdapter} */
    getDialectAdapter() { throw new Error('Connection interface method.'); }

}
