/**
 * Interface for RDBMS queries builders.
 * @interface
 */
export default class TeqFw_Db_Back_Api_RDb_IQueryBuilder {

    /**
     * Build and return query.
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     */
    build(trx) {}

    /**
     * Get codifier for columns of this query.
     * @returns {Object<string, string>}
     */
    getColumns() {}

    /**
     * Get map of aliases of the tables used in this query.
     * @returns {Object<string, string>}
     */
    getTables() {}

    /**
     * Map query's column name (`userId`) to `alias.column` pair (`u.id`).
     * @param {string} col
     * @returns {string}
     */
    mapColumn(col) { }

}
