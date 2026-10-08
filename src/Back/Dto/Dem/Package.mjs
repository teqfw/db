// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Dem_Package
 * @description TeqFW database package module.
 */

/**
 * DTO for DEM 'package'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Package';

// MODULE'S CLASSES
export default class Package {
    /** @type {Object<string, TeqFw_Db_Back_Dto_Dem_Entity> | undefined} */
    entity;
    /** @type {Object<string, TeqFw_Db_Back_Dto_Dem_Package> | undefined} */
    package;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Package
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dto_Dem_Entity__Factory} deps.fEntity
     */

    constructor({fEntity}) {
        /**
         * @param {TeqFw_Db_ObjectOrNull} data
         * @returns {TeqFw_Db_Back_Dto_Dem_Package}
         */
        this.create = function create(data = null) {
            // FUNCS
            /**
             * @param {any} fnCreate
             * @param {any} data
             * @returns {any}
             */
            function parse(fnCreate, data) {
                /** @type {TeqFw_Db_Object} */
                const res = {};
                if (typeof data === 'object') {
                    for (const name of Object.keys(data)) {
                        const item = fnCreate(data[name]);
                        item.name = name;
                        res[name] = item;
                    }
                }
                return res;
            }

            // MAIN
            const res = new Package();
            res.entity = parse(fEntity.create, data?.entity);
            res.package = parse(create, data?.package);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(Package);

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            fEntity: 'TeqFw_Db_Back_Dto_Dem_Entity__Factory$',
    }),
});
