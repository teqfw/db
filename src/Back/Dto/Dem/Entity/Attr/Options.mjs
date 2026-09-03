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
    /** @type {boolean} */
    dateOnly;
    /**
     * Used with 'integer' attributes.
     * @type {boolean}
     */
    isTiny;
    /** @type {number} */
    length;
    /** @type {number} */
    precision;
    /** @type {number} */
    scale;
    /** @type {boolean} */
    unsigned;
    /**
     * Enum values.
     * @type {Array}
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
         * @param {TeqFw_Db_ObjectOrNull} data
         * @returns {TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options}
         */
        this.create = function (data = null) {
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
