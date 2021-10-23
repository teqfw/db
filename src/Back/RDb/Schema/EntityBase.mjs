/**
 * This builder adds methods for empty object according to 'TeqFw_Db_Back_RDb_Meta_IEntity' interface.
 *
 * @namespace TeqFw_Db_Back_RDb_Schema_EntityBase
 */
export default class TeqFw_Db_Back_RDb_Schema_EntityBase {
    constructor() {

        /**
         * Add methods for empty object according to 'TeqFw_Db_Back_RDb_Meta_IEntity' interface.
         * @param {TeqFw_Db_Back_RDb_Meta_IEntity} inst
         * @param {string} name
         * @param {Object} attrs
         * @param {Array} pkey
         * @param {Function} Dto class to create new DTO for the entity
         * @return {TeqFw_Db_Back_RDb_Meta_IEntity}
         */
        this.create = function (inst, name, attrs, pkey, Dto) {
            /** @type {string[]} */
            const attrNames = Object.values(attrs);

            inst.createDto = (data) => {
                const res = new Dto();
                if (typeof data === 'object')
                    for (const attr of Object.keys(data))
                        if (attrNames.includes(attr)) res[attr] = data[attr];
                return res;
            }

            inst.getAttributes = function () {
                return attrs;
            }

            inst.getAttrNames = function () {
                return attrNames;
            }

            inst.getEntityName = function () {
                return name;
            }


            inst.getPrimaryKey = function () {
                return pkey;
            }

            return inst;
        }
    }

}
