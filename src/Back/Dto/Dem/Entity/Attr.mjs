// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Dem_Entity_Attr
 * @description TeqFW database package module.
 */

/**
 * DTO for DEM 'entity/attr'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity_Attr';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem_Entity_Attr {
    /** @type {string | undefined} */
    comment;
    /** @type {unknown} */
    default;
    /** @type {string | undefined} */
    name;
    /** @type {boolean | undefined} */
    nullable;
    /** @type {TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options | undefined} */
    options;
    /** @type {string | undefined} */
    type;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity_Attr
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Cast} deps.cast
     * @param {TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options__Factory} deps.fOpts
     */
    constructor({cast, fOpts}) {
        /**
         * @param {unknown} input
         * @returns {TeqFw_Db_Back_Dto_Dem_Entity_Attr}
         */
        this.create = function (input = null) {
            const data = input && typeof input === 'object' && !Array.isArray(input)
                ? /** @type {TeqFw_Db_Object} */ (input) : null;
            const res = new TeqFw_Db_Back_Dto_Dem_Entity_Attr();
            res.comment = cast.string(data?.comment);
            res.default = cast.primitive(data?.default);
            res.name = cast.string(data?.name);
            res.nullable = cast.boolean(data?.nullable);
            res.options = fOpts.create(data?.options);
            res.type = cast.string(data?.type);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Entity_Attr);

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
            fOpts: 'TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options__Factory$',
    }),
});
