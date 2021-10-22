/**
 * Meta information for entities.
 * @interface
 */
export default class TeqFw_Db_Back_RDb_Meta_IEntity {
    /**
     * Create entity DTO from given data.
     * @param data
     * @return {Object}
     */
    createDto(data) {}

    /**
     * Return array with entity's attributes.
     * @return {string[]}
     */
    getAttributes() {}

    /**
     * Get entity name: '@vnd/plugin/path/to/entity'.
     * @return {string}
     */
    getEntityName() { }

    /**
     * Return array with primary keys for the entity.
     * @return {string[]}
     */
    getPrimaryKey() {}
}
