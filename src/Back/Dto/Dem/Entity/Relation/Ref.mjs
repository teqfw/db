// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref
 * @description TeqFW database package module.
 */

/**
 * DTO for DEM 'entity/relation/ref'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref';

// MODULE'S CLASSES
export default class Ref {
    /** @type {unknown[] | undefined} */
    attrs;
    /** @type {string | undefined} */
    path;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Cast} deps.cast
     */
    constructor({cast}) {
        /**
         * @param {unknown} input
         * @returns {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref}
         */
        this.create = function (input = null) {
            const data = input && typeof input === 'object' && !Array.isArray(input)
                ? /** @type {TeqFw_Db_Object} */ (input) : null;
            const res = new Ref();
            res.attrs = cast.array(data?.attrs);
            res.path = cast.string(data?.path);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(Ref);

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
    }),
});
