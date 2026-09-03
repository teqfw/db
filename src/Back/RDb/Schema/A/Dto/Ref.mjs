// @ts-check

/**
 * @namespace TeqFw_Db_Back_RDb_Schema_A_Dto_Ref
 * @description TeqFW database package module.
 */

/**
 * DTO for DEM 'ref' (reference to external entities and attributes).
 * This DTO is used in 'TeqFw_Db_Back_RDb_Schema_A' namespace only.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_RDb_Schema_A_Dto_Ref';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_RDb_Schema_A_Dto_Ref {
    /**
     * Path to referencing entity.
     * @type {string}
     */
    path;
    /**
     * Attributes of the referencing entity that are used in relations.
     * @type {string[]}
     */
    attrs;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_RDb_Schema_A_Dto_Ref
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Cast} deps.cast
     */
    constructor({cast}) {
        /**
         * @param {any} data
         * @returns {TeqFw_Db_Back_RDb_Schema_A_Dto_Ref}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_RDb_Schema_A_Dto_Ref();
            res.path = cast.string(data?.path);
            res.attrs = cast.array(data?.attrs);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_RDb_Schema_A_Dto_Ref);

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
    }),
});
