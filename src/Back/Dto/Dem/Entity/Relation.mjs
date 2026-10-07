// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Dem_Entity_Relation
 * @description TeqFW database package module.
 */

/**
 * DTO for DEM 'entity/relation'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity_Relation';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem_Entity_Relation {
    /** @type {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action | undefined} */
    action;
    /** @type {unknown[] | undefined} */
    attrs;
    /** @type {string | undefined} */
    name;
    /** @type {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref | undefined} */
    ref;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity_Relation
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Cast} deps.cast
     * @param {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref__Factory} deps.fRef
     * @param {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action__Factory} deps.fAction
     */
    constructor({cast, fRef, fAction}) {

        /**
         * @param {unknown} input
         * @returns {TeqFw_Db_Back_Dto_Dem_Entity_Relation}
         */
        this.create = function (input = null) {
            const data = input && typeof input === 'object' && !Array.isArray(input)
                ? /** @type {TeqFw_Db_Object} */ (input) : null;
            const res = new TeqFw_Db_Back_Dto_Dem_Entity_Relation();
            res.action = fAction.create(data?.action);
            res.attrs = cast.array(data?.attrs);
            res.name = cast.string(data?.name);
            res.ref = fRef.create(data?.ref);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Entity_Relation);

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
            fRef: 'TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref__Factory$',
            fAction: 'TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action__Factory$',
    }),
});
