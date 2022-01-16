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
    /** @type {Object<string, TeqFw_Db_Back_Dto_Dem_Entity>} */
    entity;
    /** @type {Object<string, TeqFw_Db_Back_Dto_Dem_Package>} */
    package;
    /**
     * External references and attributes for relations (foreign keys).
     * @type {Object<string, string[]>}
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

    constructor(spec) {
        /** @type {typeof TeqFw_Db_Back_Dto_Dem_Entity} */
        const TEntity = spec['TeqFw_Db_Back_Dto_Dem_Entity#'];
        /** @type {TeqFw_Db_Back_Dto_Dem_Entity.Factory} */
        const fEntity = spec['TeqFw_Db_Back_Dto_Dem_Entity#Factory$'];
        /** @type {TeqFw_Db_Back_Dto_Dem_Package.Factory} */
        const fPkg = spec['TeqFw_Db_Back_Dto_Dem_Package#Factory$'];

        /**
         * @param {TeqFw_Db_Back_Dto_Dem|null} data
         * @return {TeqFw_Db_Back_Dto_Dem}
         */
        this.create = function (data = null) {
            // DEFINE INNER FUNCTIONS
            /**
             * Create object node from ${data} using factory ${fnCreate} to create node entries.
             * Use ${key} attribute to save node key as 'name' attribute in created entry.
             *
             * @param {Function} fnCreate
             * @param {Object} data
             * @param {string|null} key
             * @return {Object<string, *>}
             */
            function parse(fnCreate, data, key = null) {
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

            function parseRefs(data) {
                const res = {};
                if (typeof data === 'object')
                    for (const path of Object.keys(data))
                        if (Array.isArray(data[path])) res[path] = [...data[path]]; // make a copy
                return res;
            }

            // MAIN FUNCTIONALITY
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
