// @ts-check

/**
 * @namespace TeqFw_Db_Back_Api_RDb_Schema
 * @description TeqFW database package module.
 * @interface
 */

/**
 * Interface for RDBMS schema builder that uses DEM (Domain Entities Model) to describe structure.
 * @interface
 */
export default class TeqFw_Db_Back_Api_RDb_Schema {
    /**
     * Create all tables using given connection.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_IConnect} deps.conn
     * @returns {Promise<void>}
     */
    async createAllTables({conn}) {}

    /**
     * Drop all tables using given connection.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_IConnect} deps.conn
     * @returns {Promise<void>}
     */
    async dropAllTables({conn}) {}

    /**
     * Retrieves all entities from DEM in the correct dependency order.
     * Ensures that entities are returned in the sequence required for proper processing.
     * Convert TeqFW DEM format into Knex RDB format.
     * @returns {Promise<TeqFw_Db_Back_Dto_RDb_Table[]>}
     */
    async fetchTablesByDependencyOrder() {}


    /**
     * @returns {Promise<string[]>}
     */
    async getTablesList() {}

    /**
     * Set database connection configuration object.
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dto_Config_Schema} deps.cfg
     */
    setCfg({cfg}) {}

    /**
     * Set internal DEM object.
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dto_Dem} deps.dem
     */
    setDem({dem}) {}
}
