/**
 * Interface for RDBMS queries builders to get items for listings.
 * @interface
 * @extends TeqFw_Db_Back_Api_RDb_QueryBuilder
 * @deprecated I think all queries are the `list queries`.
 */
export default class TeqFw_Db_Back_Api_RDb_Query_List {

    /**
     * Build and return query to get total count of items for a given selection.
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {Object} opts additional options for query builder (where, order, etc.)
     * @returns {Knex.QueryBuilder}
     */
    buildCount(trx, opts = {}) {}

}
