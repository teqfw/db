/**
 * Interface for RDBMS schema builder that uses DEM (Domain Entities Model) to describe structure.
 * @interface
 */
export default class TeqFw_Db_Back_Api_RDb_ISchema {
    /**
     * Create all tables using given connection.
     * @param {TeqFw_Db_Back_Api_RDb_IConnect} conn
     * @return {Promise<void>}
     */
    async createAllTables({conn}) {}

    /**
     * Drop all tables using given connection.
     * @param {TeqFw_Db_Back_Api_RDb_IConnect} conn
     * @return {Promise<void>}
     */
    async dropAllTables({conn}) {}

    /**
     * Load DEM fragments, merge its and normalize result model.
     * @param {string} path to project root
     * @return {Promise<void>}
     */
    async loadDem({path}) {}

    /**
     * Set internal DEM object.
     * @param {TeqFw_Db_Back_Dto_Dem} dem
     */
    setDem({dem}) {}
}
