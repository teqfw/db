/**
 * Interface for RDBMS queries builders.
 * @interface
 * TODO: use ..._Name instead of ..._IName (we have _Api_ in classname)
 */
export default class TeqFw_Db_Back_Api_RDb_IQueryBuilder {

    /**
     * Build and return query.
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {Object} opts additional options for query builder (where, order, etc.)
     */
    build(trx, opts = {}) {}

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
