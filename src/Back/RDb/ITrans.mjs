// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_ITrans
 * @description TeqFW database package module.
 * @interface
 */

/**
 * Interface for single transaction to manipulate data in DB.
 * Connection creates transaction.
 * @interface
 * TODO: move to _Api_ namespace
 */
export default class TeqFw_Db_Back_RDb_ITrans {
    /**
     * @returns {Promise<void>}
     */
    async commit() {}

    /**
     * Return knex based query builder.
     * @returns {TeqFw_Db_KnexQuery}
     */
    createQuery() { throw new Error('Transaction interface method.'); }

    /**
     * @returns {Promise<void>}
     */
    async disconnect() {}

    /**
     * Convert entity name to table name ('@vnd/plugin/package/entity' => 'prefix_package_entity').
     * @param {any} meta
     * @returns {string}
     */
    getTableName(meta) { throw new Error('Transaction interface method.'); }

    /**
     * 'true' if type of connected RDBMS is MariaDB or MySQL.
     * @returns {boolean}
     */
    isMariaDB() { throw new Error('Transaction interface method.'); }

    /**
     * 'true' if type of connected RDBMS is PostgreSQL
     * @returns {boolean}
     */
    isPostgres() { throw new Error('Transaction interface method.'); }

    /**
     * 'true' if type of connected RDBMS is SQLite
     * @returns {boolean}
     */
    isSqlite() { throw new Error('Transaction interface method.'); }

    /**
     * Return row expression for input data.
     * @param {string} exp
     * @param {TeqFw_Db_QueryBindings} [params]
     * @returns {TeqFw_Db_KnexRaw}
     */
    raw(exp, params) { throw new Error('Transaction interface method.'); }

    /**
     * @returns {Promise<void>}
     */
    async rollback() {}

    /** @returns {TeqFw_Db_DialectAdapter} */
    getDialectAdapter() { throw new Error('Transaction interface method.'); }

    /** @returns {TeqFw_Db_KnexTransaction} */
    getKnexTrx() { throw new Error('Transaction interface method.'); }
}
