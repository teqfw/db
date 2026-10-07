// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Config_Schema
 * @description TeqFW database package module.
 */

/**
 * Schema configuration DTO to couple DEM with DB.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Config_Schema';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Config_Schema {
    /**
     * Prefix for tables in RDB ('teq' => 'teq_table_name'). Default: use w/o prefix.
     * @type {string | undefined}
     */
    prefix;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Config_Schema
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
         * @returns {TeqFw_Db_Back_Dto_Config_Schema}
         */
        this.create = function (input = null) {
            const data = input && typeof input === 'object' && !Array.isArray(input)
                ? /** @type {TeqFw_Db_Object} */ (input) : null;
            const res = new TeqFw_Db_Back_Dto_Config_Schema();
            res.prefix = cast.string(data?.prefix);
            return res;
        };
    }
}

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
    }),
});
