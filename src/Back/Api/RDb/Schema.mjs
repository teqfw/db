// @ts-check

/**
 * @namespace TeqFw_Db_Back_Api_RDb_Schema
 * @description Schema lifecycle contract consuming only authentic DEM compilation results.
 * @interface
 */

/**
 * @interface
 */
export default class TeqFw_Db_Back_Api_RDb_Schema {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_IConnect} deps.conn
     * @returns {Promise<any>}
     */
    async createAllTables({conn}) {}

    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_IConnect} deps.conn
     * @returns {Promise<any>}
     */
    async dropAllTables({conn}) {}

    /** @returns {Promise<any>} */
    async fetchTablesByDependencyOrder() {}

    /** @returns {Promise<any>} */
    async getTablesList() {}

    /**
     * Return the installed authentic compilation; throw before initialization.
     * @returns {TeqFw_Db_DemCompilationResult}
     */
    getCompilation() { throw new TypeError('A successful DEM compilation result is required.'); }

    /**
     * @param {object} deps
     * @param {object} deps.compilation
     */
    setCompilation({compilation}) {}
}
