// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options
 * @description TeqFW database package module.
 */

/**
 * DTO for DEM 'entity/attr/options'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options {
    /** @type {boolean | null | undefined} */
    dateOnly;
    /**
     * Used with 'integer' attributes.
     * @type {boolean | null | undefined}
     */
    isTiny;
    /** @type {number | undefined} */
    length;
    /** @type {number | undefined} */
    precision;
    /** @type {number | undefined} */
    scale;
    /** @type {boolean | null | undefined} */
    unsigned;
    /**
     * Enum values.
     * @type {unknown[] | undefined}
     */
    values;
}

// noinspection JSCheckFunctionSignatures
/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options
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
         * @returns {TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options}
         */
        this.create = function (input = null) {
            const data = input && typeof input === 'object' && !Array.isArray(input)
                ? /** @type {TeqFw_Db_Object} */ (input) : null;
            const res = new TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options();
            res.dateOnly = cast.booleanIfExists(data?.dateOnly);
            res.isTiny = cast.booleanIfExists(data?.isTiny);
            res.length = cast.int(data?.length);
            res.precision = cast.int(data?.precision);
            res.scale = cast.int(data?.scale);
            res.unsigned = cast.booleanIfExists(data?.unsigned);
            res.values = cast.array(data?.values);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options);

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
    }),
});
