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
     * @returns {any}
     */
    createQuery() {}

    /**
     * @returns {Promise<void>}
     */
    async disconnect() {}

    /**
     * Convert entity name to table name ('@vnd/plugin/package/entity' => 'prefix_package_entity').
     * @param {any} meta
     * @returns {string}
     */
    getTableName(meta) {}

    /**
     * 'true' if type of connected RDBMS is MariaDB or MySQL.
     * @returns {boolean}
     */
    isMariaDB() {}

    /**
     * 'true' if type of connected RDBMS is PostgreSQL
     * @returns {boolean}
     */
    isPostgres() {}

    /**
     * 'true' if type of connected RDBMS is SQLite
     * @returns {boolean}
     */
    isSqlite() {}

    /**
     * Return row expression for input data.
     * @param {string} exp
     * @param {any} params
     */
    raw(exp, params) {}

    /**
     * @returns {Promise<void>}
     */
    async rollback() {}

    /** @returns {TeqFw_Db_Back_Api_RDb_Dialect} */
    getDialectAdapter() {}

    /** @returns {any} */
    getKnexTrx() {}
}
