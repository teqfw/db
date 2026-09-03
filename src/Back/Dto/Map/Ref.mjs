// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Map_Ref
 * @description TeqFW database package module.
 */

/**
 * DTO for map with references resolutions.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Map_Ref';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Map_Ref {
    /**
     * Path to virtual entity (/virtual/entity).
     * @type {string}
     */
    alias;
    /**
     * Attributes mapping: virtual => real.
     * @type {Object<string, string>}
     */
    attrs;
    /**
     * Path to existing entity (/real/entity).
     * @type {string}
     */
    path;
}

// attributes names to use as aliases in queries to object props
TeqFw_Db_Back_Dto_Map_Ref.ALIAS = 'alias';
TeqFw_Db_Back_Dto_Map_Ref.ATTRS = 'attrs';
TeqFw_Db_Back_Dto_Map_Ref.PATH = 'path';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Map_Ref
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
         * @returns {TeqFw_Db_Back_Dto_Map_Ref}
         */
        this.create = function create(data = null) {
            const res = new TeqFw_Db_Back_Dto_Map_Ref();
            res.attrs = (typeof (data?.attrs) === 'object')
                ? JSON.parse(JSON.stringify(data.attrs)) : {};
            res.path = cast.string(data?.path);
            res.alias = cast.string(data?.alias);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Map_Ref);

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
    }),
});
