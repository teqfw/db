/**
 * Meta information for RDB entities.
 * @see {TeqFw_Db_Back_RDb_Schema_EntityBase}
 * @interface
 */
export default class TeqFw_Db_Back_RDb_Meta_IEntity {
    /**
     * Create entity DTO from given data.
     * @param [data]
     * @returns {*}
     */
    createDto(data) {}

    /**
     * Get codifier for entity attributes.
     * @returns {Object}
     */
    getAttributes() {}

    /**
     * Get entity name: '@vnd/plugin/path/to/entity'.
     * @returns {string}
     */
    getEntityName() { }

    /**
     * Return array with primary keys for the entity.
     * @returns {string[]}
     */
    getPrimaryKey() {}
}
