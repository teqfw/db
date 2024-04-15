/**
 * The interface for data transformation tools specifically designed to pre-process the imported JSON data before
 * insertion into a Relational Database (RDB).
 * @interface
 */
export default class TeqFw_Db_Back_Api_Import_Transform {

    /**
     * Filter or modify serials for PostgreSQL.
     *
     * @param {Object<string, number|string>} serials
     * @return {Object<string, number|string>}
     */
    prepareSerials(serials) {
        return serials;
    }

    /**
     * Extract data for a given table from a dump and prepare it for insertion into RDB.
     * @param {TeqFw_Db_Back_RDb_ITrans} trx
     * @param {Object<string, Object[]>} dump
     * @param {string} table
     * @return {Object[]}
     */
    prepareTables(trx, dump, table) {
        return dump[table] ?? [];
    }
}
