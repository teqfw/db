// @ts-check

/**
 * @namespace TeqFw_Db_Back_Api_RDb_Repository
 * @description TeqFW database package module.
 * @interface
 */

/**
 * Interface defining CRUD operations for a single RDB table in TeqFW.
 * Designed with focus on code mutability and compositional objects.
 * @interface
 *
 * Use Selection v2 to filter result sets.
 *
 */
export default class TeqFw_Db_Back_Api_RDb_Repository {
    /**
     * Create a new record in the table.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_ITrans} deps.trx
     * @param {*} deps.dto
     * @throws {Error} - Throws an error if the operation fails.
     * @returns {Promise<any>}
     */
    createOne({trx, dto}) {}

    /**
     * Create a persistent DTO.
     * If input data is provided, the method validates and casts types of attributes
     * based on the entity schema, removing extra attributes. If no data is provided,
     * an empty DTO is returned, where attributes are initialized to default values
     * or `undefined`.
     * @param {*} data
     * @returns {Object}
     */
    createDto(data) {}

    /**
     * Delete a single record matching the provided key.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_ITrans} deps.trx
     * @param {Object} deps.key
     * @throws {Error} - Throws an error if the operation fails.
     * @returns {Promise<any>}
     */
    deleteOne({trx, key}) {}

    /**
     * Delete records matching the provided conditions.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_ITrans} deps.trx
     * @param {TeqFw_Db_Shared_Dto_Query_Selection.Dto} deps.selection
     * @throws {Error} - Throws an error if the operation fails.
     * @returns {Promise<any>}
     */
    deleteMany({trx, selection}) {}

    /**
     * Get a schema object related to the repo.
     * @returns {TeqFw_Db_Back_Api_RDb_Schema_Object}
     */
    getSchema() {}

    /**
     * Read a single record by primary or unique key(s).
     * Optionally filters the selected columns to reduce the size of the result.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_ITrans} deps.trx
     * @param {Object} deps.key
     * @param {Array<string>} deps.select
     * @throws {Error} - Throws an error if the operation fails.
     * @returns {Promise<any>}
     */
    readOne({trx, key, select}) {}

    /**
     * Read multiple records matching the provided conditions.
     * Supports filtering, sorting, and pagination.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_ITrans} deps.trx
     * @param {TeqFw_Db_Shared_Dto_Query_Selection.Dto} deps.selection
     * @throws {Error} - Throws an error if the operation fails.
     * @returns {Promise<any>}
     */
    readMany({trx, selection}) {}

    /**
     * Update a single record matching the provided key.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_ITrans} deps.trx
     * @param {Object} deps.key
     * @param {Object} deps.updates
     * @throws {Error} - Throws an error if the operation fails or if parameters are invalid.
     * @returns {Promise<any>}
     */
    updateOne({trx, key, updates}) {}

    /**
     * Update existing records matching the provided conditions.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_ITrans} deps.trx
     * @param {TeqFw_Db_Shared_Dto_Query_Selection.Dto} deps.selection
     * @param {Object} deps.updates
     * @throws {Error} - Throws an error if the operation fails or if parameters are invalid.
     * @returns {Promise<any>}
     */
    updateMany({trx, selection, updates}) {}
}
