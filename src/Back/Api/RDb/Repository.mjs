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
export default class Repository {
    /**
     * Create a new record in the table.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_ITrans} deps.trx
     * @param {object} deps.dto
     * @throws {any} - Throws an error if the operation fails.
     * @returns {Promise<any>}
     */
    createOne({trx, dto}) { throw new Error('Not implemented.'); }

    /**
     * Create a persistent DTO.
     * If input data is provided, the method validates and casts types of attributes
     * based on the entity schema, removing extra attributes. If no data is provided,
     * an empty DTO is returned, where attributes are initialized to default values
     * or `undefined`.
     * @param {any} data
     * @returns {any}
     */
    createDto(data) { throw new Error('Not implemented.'); }

    /**
     * Delete a single record matching the provided key.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_ITrans} deps.trx
     * @param {object} deps.key
     * @throws {any} - Throws an error if the operation fails.
     * @returns {Promise<any>}
     */
    deleteOne({trx, key}) { throw new Error('Not implemented.'); }

    /**
     * Delete records matching the provided conditions.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_ITrans} deps.trx
     * @param {object} deps.selection
     * @throws {any} - Throws an error if the operation fails.
     * @returns {Promise<any>}
     */
    deleteMany({trx, selection}) { throw new Error('Not implemented.'); }

    /**
     * Get a schema object related to the repo.
     * @returns {TeqFw_Db_Back_Api_RDb_Schema_Object}
     */
    getSchema() { throw new Error('Not implemented.'); }

    /**
     * Read a single record by primary or unique key(s).
     * Optionally filters the selected columns to reduce the size of the result.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_ITrans} deps.trx
     * @param {object} deps.key
     * @param {object} deps.select
     * @throws {any} - Throws an error if the operation fails.
     * @returns {Promise<any>}
     */
    readOne({trx, key, select}) { throw new Error('Not implemented.'); }

    /**
     * Read multiple records matching the provided conditions.
     * Supports filtering, sorting, and pagination.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_ITrans} deps.trx
     * @param {object} deps.selection
     * @throws {any} - Throws an error if the operation fails.
     * @returns {Promise<any>}
     */
    readMany({trx, selection}) { throw new Error('Not implemented.'); }

    /**
     * Update a single record matching the provided key.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_ITrans} deps.trx
     * @param {object} deps.key
     * @param {object} deps.updates
     * @throws {any} - Throws an error if the operation fails or if parameters are invalid.
     * @returns {Promise<any>}
     */
    updateOne({trx, key, updates}) { throw new Error('Not implemented.'); }

    /**
     * Update existing records matching the provided conditions.
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_ITrans} deps.trx
     * @param {object} deps.selection
     * @param {object} deps.updates
     * @throws {any} - Throws an error if the operation fails or if parameters are invalid.
     * @returns {Promise<any>}
     */
    updateMany({trx, selection, updates}) { throw new Error('Not implemented.'); }
}
