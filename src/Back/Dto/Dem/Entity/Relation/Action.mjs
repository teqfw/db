// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action
 * @description TeqFW database package module.
 */

/**
 * DTO for DEM 'entity/relation/action'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action';

// MODULE'S CLASSES
export default class Action {
    /** @type {TeqFw_Db_StringOptional} */
    delete;
    /** @type {TeqFw_Db_StringOptional} */
    update;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Cast} deps.cast
     * @param {TeqFw_Db_Back_Enum_Dem_Type_Action} deps.ACTION
     */
    constructor({cast, ACTION}) {
        /**
         * @param {unknown} input
         * @returns {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action}
         */
        this.create = function (input = null) {
            const data = input && typeof input === 'object' && !Array.isArray(input)
                ? /** @type {TeqFw_Db_Object} */ (input) : null;
            const res = new Action();
            const deleteValue = cast.enum(data?.delete, ACTION);
            res.delete = typeof deleteValue === 'string' ? deleteValue : undefined;
            const updateValue = cast.enum(data?.update, ACTION);
            res.update = typeof updateValue === 'string' ? updateValue : undefined;
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(Action);

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
            ACTION: 'TeqFw_Db_Back_Enum_Dem_Type_Action__default',
    }),
});
