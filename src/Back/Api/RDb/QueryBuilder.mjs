// @ts-check

/**
 * @namespace TeqFw_Db_Back_Api_RDb_QueryBuilder
 * @description TeqFW database package module.
 * @interface
 */

/**
 * Interface for RDBMS queries builders.
 * @interface
 */
export default class TeqFw_Db_Back_Api_RDb_QueryBuilder {

    /**
     * Build and return a query.
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {any} opts
     * @abstract
     * @returns {any}
     */
    build(trx, opts = {}) {}

    /**
     * Build and return query to get total count of items for a given selection.
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {any} opts
     * @abstract
     * @returns {any}
     */
    buildCount(trx, opts = {}) {}


    /**
     * Retrieve the aliases for the selected columns in the query.
     * @abstract
     * @returns {any}
     */
    getColumns() {}

    /**
     * * Retrieve a mapping of table aliases used in this query.
     * @abstract
     * @returns {any}
     */
    getTables() {}

    /**
     * Map query's column name (`userId`) to `alias.column` pair (`u.id`).
     * @param {string} col
     * @abstract
     * @returns {any}
     */
    mapColumn(col) { }

}
