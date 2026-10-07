// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Dem
 * @description TeqFW database package module.
 */

/**
 * DTO for DEM (Domain Entities Model).
 *
 * DEM is a declaration of plugin's part of common RDB schema. All plugins DEMs merge into one common DEM using
 * normalization Map (see TeqFw_Db_Back_Dto_Map).
 *
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem {
    /**
     * List of deprecated tables with dependencies (foreign keys).
     * @type {Object<string, string[]> | undefined}
     */
    deprecated;
    /** @type {Object<string, TeqFw_Db_Back_Dto_Dem_Entity> | undefined} */
    entity;
    /** @type {Object<string, TeqFw_Db_Back_Dto_Dem_Package> | undefined} */
    package;
    /**
     * External references and attributes for relations (foreign keys).
     * @type {Object<string, string[]> | undefined}
     */
    refs;
}

// attributes names to use as aliases in queries to object props
TeqFw_Db_Back_Dto_Dem.ENTITY = 'entity';
TeqFw_Db_Back_Dto_Dem.PACKAGE = 'package';
TeqFw_Db_Back_Dto_Dem.REFS = 'refs';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dto_Dem_Entity__Class} deps.TEntity
     * @param {TeqFw_Db_Back_Dto_Dem_Entity__Factory} deps.fEntity
     * @param {TeqFw_Db_Back_Dto_Dem_Package__Factory} deps.fPkg
     */

    constructor({TEntity, fEntity, fPkg}) {
        /**
         * @param {unknown} input
         * @returns {TeqFw_Db_Back_Dto_Dem}
         */
        this.create = function (input = null) {
            const data = input && typeof input === 'object' && !Array.isArray(input)
                ? /** @type {TeqFw_Db_Object} */ (input) : null;
            // FUNCS
            /**
             * Create object node from ${data} using factory ${fnCreate} to create node entries.
             * Use ${key} attribute to save node key as 'name' attribute in created entry.
             * @param {any} fnCreate
             * @param {any} data
             * @param {any} key
             * @returns {any}
             */
            function parse(fnCreate, data, key = null) {
                /** @type {TeqFw_Db_Object} */
                const res = {};
                if (typeof data === 'object') {
                    for (const name of Object.keys(data)) {
                        const item = fnCreate(data[name]);
                        if (typeof key === 'string') item[key] = name;
                        res[name] = item;
                    }
                }
                return res;
            }

            /**
             * @param {any} data
             * @returns {any}
             */
            function parseRefs(data) {
                /** @type {TeqFw_Db_Object} */
                const res = {};
                if (typeof data === 'object')
                    for (const path of Object.keys(data))
                        if (Array.isArray(data[path])) res[path] = [...data[path]]; // make a copy
                return res;
            }

            // MAIN
            const res = new TeqFw_Db_Back_Dto_Dem();
            res.entity = parse(fEntity.create, data?.entity, TEntity.NAME);
            res.package = parse(fPkg.create, data?.package);
            res.refs = parseRefs(data?.refs);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem);

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            TEntity: 'TeqFw_Db_Back_Dto_Dem_Entity__default',
            fEntity: 'TeqFw_Db_Back_Dto_Dem_Entity__Factory$',
            fPkg: 'TeqFw_Db_Back_Dto_Dem_Package__Factory$',
    }),
});
