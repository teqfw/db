/**
 * Interface for RDBMS schema builder that uses DEM (Domain Entities Model) to describe structure.
 * @interface
 */
export default class TeqFw_Db_Back_Api_RDb_ISchema {
    /**
     * Create all tables using given connection.
     * @param {TeqFw_Db_Back_RDb_IConnect} conn
     * @return {Promise<void>}
     */
    async createAllTables({conn}) {}

    /**
     * Drop all tables using given connection.
     * @param {TeqFw_Db_Back_RDb_IConnect} conn
     * @return {Promise<void>}
     */
    async dropAllTables({conn}) {}

    /**
     * Set database connection configuration object.
     * @param {TeqFw_Db_Back_Dto_Config_Schema} cfg
     */
    setCfg({cfg}) {}

    /**
     * Set internal DEM object.
     * @param {TeqFw_Db_Back_Dto_Dem} dem
     */
    setDem({dem}) {}
}
