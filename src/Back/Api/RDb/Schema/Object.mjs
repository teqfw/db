/**
 * Interface defining metadata and operations for RDB entities in TeqFW.
 * Designed to standardize access to entity schema details.
 * @interface
 */
export default class TeqFw_Db_Back_Api_RDb_Schema_Object {
    /**
     * Create a persistent DTO.
     * If input data is provided, the method validates and casts types of attributes
     * based on the entity schema, removing extra attributes. If no data is provided,
     * an empty DTO is returned, where attributes are initialized to default values
     * or `undefined`.
     *
     * @param {Object} [data] - Input data to be transformed into a DTO.
     * @returns {Object} - Persistent DTO with valid structure and types.
     */
    createDto(data) {}

    /**
     * Get codifier for entity attributes.
     * The returned object maps logical attribute names to their physical column names.
     * This method does not include information about relationships or foreign keys.
     *
     * Example: { ID: 'id', DATE_CREATED: 'date_created', ... }.
     *
     * @returns {Object<string, string>} - Mapping of attribute names.
     */
    getAttributes() {}

    /**
     * Get the entity name combining the npm package name and the entity's path.
     * Format: '@vendor/package/path/to/entity'.
     *
     * @returns {string} - Full entity name.
     */
    getEntityName() {}

    /**
     * Return array with primary keys for the entity.
     * In case of composite primary keys, the array includes all key attributes
     * in the order they are defined in the schema.
     *
     * @returns {string[]} - List of primary key attributes.
     */
    getPrimaryKey() {}
}
