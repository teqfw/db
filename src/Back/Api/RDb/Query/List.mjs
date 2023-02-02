/**
 * Interface for RDBMS queries builders to get items for listings.
 * @interface
 * @extends TeqFw_Db_Back_Api_RDb_IQueryBuilder
 */
export default class TeqFw_Db_Back_Api_RDb_Query_List {

    /**
     * Build and return query to get total count of items for given selection.
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {Object} opts additional options for query builder (where, order, etc.)
     */
    buildCount(trx, opts = {}) {}

}
