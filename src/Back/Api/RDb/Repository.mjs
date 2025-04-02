/**
 * Interface defining CRUD operations for a single RDB table in TeqFW.
 * Designed with focus on code mutability and compositional objects.
 * @interface
 */
export default class TeqFw_Db_Back_Api_RDb_Repository {
    /**
     * Create a new record in the table.
     * @param {Object} params - Parameters for the operation.
     * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx] - Optional database transaction object.
     * @param {*} params.dto - DTO object with data to create.
     * @returns {Promise<{primaryKey: Object<string, string|number>}>} - The result of the operation containing the primary key.
     * @throws {Error} - Throws an error if the operation fails.
     */
    createOne({trx, dto}) {}

    /**
     * Create a persistent DTO.
     * If input data is provided, the method validates and casts types of attributes
     * based on the entity schema, removing extra attributes. If no data is provided,
     * an empty DTO is returned, where attributes are initialized to default values
     * or `undefined`.
     *
     * @param {*} [data] - Input data to be transformed into a DTO.
     * @returns {Object} - Persistent DTO with valid structure and types.
     */
    createDto(data) {}

    /**
     * Delete a single record matching the provided key.
     * @param {Object} params - Parameters for the operation.
     * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx] - Optional database transaction object.
     * @param {Object} params.key - Key attributes and their values for lookup (primary or unique key).
     * @returns {Promise<{deletedCount: number}>} - Object containing the number of deleted records (always 0 or 1).
     * @throws {Error} - Throws an error if the operation fails.
     */
    deleteOne({trx, key}) {}

    /**
     * Delete records matching the provided conditions.
     * @param {Object} params - Parameters for the operation.
     * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx] - Optional database transaction object.
     * @param {Object} params.conditions - Column-value pairs for filtering records.
     * @returns {Promise<{deletedCount: number}>} - Object containing the number of deleted records.
     * @throws {Error} - Throws an error if the operation fails.
     */
    deleteMany({trx, conditions}) {}

    /**
     * Get schema object related to the repo.
     * @returns {TeqFw_Db_Back_Api_RDb_Schema_Object}
     */
    getSchema() {}

    /**
     * Read a single record by primary or unique key(s).
     * Optionally filters the selected columns to reduce the size of the result.
     *
     * @param {Object} params - Parameters for the operation.
     * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx] - Optional database transaction object.
     * @param {Object} params.key - Key attributes and their values for lookup (primary or unique key).
     * @param {Array<string>} [params.select] - List of columns to include in the result.
     * @returns {Promise<{record: Object|null}>} - Object containing the found DTO or null if not found.
     * @throws {Error} - Throws an error if the operation fails.
     */
    readOne({trx, key, select}) {}

    /**
     * Read multiple records matching the provided conditions.
     * Supports filtering, sorting, and pagination.
     *
     * @param {Object} params - Parameters for the operation.
     * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx] - Optional database transaction object.
     * @param {Object} params.conditions - Column-value pairs for filtering results.
     * @param {Object<string, 'asc'|'desc'>} [params.sorting] - Sorting options where keys are column names, and values are 'asc' or 'desc'.
     * @param {{limit: number, offset: number}} [params.pagination] - Pagination options specifying the limit and offset for the query.
     * @returns {Promise<{records: Array<Object>}>} - Object containing the result of the operation, with `records` as an array of DTO objects.
     * @throws {Error} - Throws an error if the operation fails.
     */
    readMany({trx, conditions, sorting, pagination}) {}

    /**
     * Update a single record matching the provided key.
     *
     * @param {Object} params - Parameters for the operation.
     * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx] - Optional database transaction object.
     * @param {Object} [params.key] - Key attributes and their values for lookup (primary or unique key).
     * @param {Object} params.updates - Column-value pairs to update.
     * @returns {Promise<{updatedCount: number}>} - Object containing the number of updated records (always 0 or 1).
     * @throws {Error} - Throws an error if the operation fails or if parameters are invalid.
     */
    updateOne({trx, key, updates}) {}

    /**
     * Update existing records matching the provided conditions.
     *
     * @param {Object} params - Parameters for the operation.
     * @param {TeqFw_Db_Back_RDb_ITrans} [params.trx] - Optional database transaction object.
     * @param {Object} params.conditions - Column-value pairs for filtering records.
     * @param {Object} params.updates - Column-value pairs to update.
     * @returns {Promise<{updatedCount: number}>} - Object containing the number of updated records.
     * @throws {Error} - Throws an error if the operation fails or if parameters are invalid.
     */
    updateMany({trx, conditions, updates}) {}
}
