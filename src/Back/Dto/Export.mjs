// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Export
 * @description TeqFW database package module.
 */

/**
 * The format in which the exported/imported information is organized.
 */
// MODULE'S VARIABLES
const NS = 'TeqFw_Db_Back_Dto_Export';

// MODULE'S CLASSES
/**
 * @memberOf TeqFw_Db_Back_Dto_Export
 */
class Dto {
    static namespace = NS;
    /**
     * Contains all tables with data.
     * @type {Object<string, Object[]>}
     */
    tables;
    /**
     * Contains all serials (for PostgreSQL DBs).
     * @type {Object<string, string>}
     */
    serials;
}

/**
 */
export default class TeqFw_Db_Back_Dto_Export {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Cast} deps.cast
     */
    constructor({cast}) {
        /**
         * @param {TeqFw_Db_ExportDto} data
         * @returns {TeqFw_Db_ExportDto}
         */
        this.createDto = function (data) {
            // create a new DTO
            const res = new Dto();
            // cast known attributes
            res.tables = cast.object(data?.tables);
            res.serials = cast.object(data?.serials);
            return res;
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
    }),
});
