// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Dem_Entity_Index
 * @description TeqFW database package module.
 */

/**
 * DTO for DEM 'entity/index'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity_Index';

// MODULE'S CLASSES
export default class Index {
    /** @type {unknown[] | undefined} */
    attrs;
    /** @type {string | undefined} */
    name;
    /** @type {string | undefined} */
    type;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity_Index
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
         * @returns {TeqFw_Db_Back_Dto_Dem_Entity_Index}
         */
        this.create = function (input = null) {
            const data = input && typeof input === 'object' && !Array.isArray(input)
                ? /** @type {TeqFw_Db_Object} */ (input) : null;
            const res = new Index();
            res.attrs = cast.array(data?.attrs);
            res.name = cast.string(data?.name);
            res.type = cast.string(data?.type);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(Index);

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
    }),
});
