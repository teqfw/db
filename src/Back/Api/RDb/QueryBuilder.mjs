/**
 * Interface for RDBMS queries builders.
 * @interface
 */
export default class TeqFw_Db_Back_Api_RDb_QueryBuilder {

    /**
     * Build and return a query.
     * @abstract
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {object} [opts] additional options for query builder (where, order, etc.)
     * @returns {Knex.QueryBuilder}
     */
    build(trx, opts = {}) {}

    /**
     * Build and return query to get total count of items for a given selection.
     * @abstract
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {object} [opts] additional options for query builder (where, order, etc.)
     * @returns {Knex.QueryBuilder}
     */
    buildCount(trx, opts = {}) {}


    /**
     * Retrieve the aliases for the selected columns in the query.
     * @abstract
     * @returns {Object<string, *>|*} - Generic map; structure varies by implementation.
     */
    getColumns() {}

    /**
     * * Retrieve a mapping of table aliases used in this query.
     * @abstract
     * @returns {Object<string, string>|*} - Generic map; structure varies by implementation.
     */
    getTables() {}

    /**
     * Map query's column name (`userId`) to `alias.column` pair (`u.id`).
     * @abstract
     * @param {string} col
     * @returns {string|undefined}
     */
    mapColumn(col) { }

}
