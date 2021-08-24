/**
 * DTO for DEM (Domain Entities Model).
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem {
    /** @type {Object<string, TeqFw_Db_Back_Dto_Dem_Entity>} */
    entity;
    /** @type {Object<string, TeqFw_Db_Back_Dto_Dem_Map>} */
    map;
    /** @type {Object<string, TeqFw_Db_Back_Dto_Dem_Package>} */
    package;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem
 */
export class Factory {
    constructor(spec) {
        // EXTRACT DEPS
        /** @type {typeof TeqFw_Db_Back_Dto_Dem_Entity} */
        const TEntity = spec['TeqFw_Db_Back_Dto_Dem_Entity#'];
        /** @type {typeof TeqFw_Db_Back_Dto_Dem_Map} */
        const TMap = spec['TeqFw_Db_Back_Dto_Dem_Map#'];
        /** @type {TeqFw_Db_Back_Dto_Dem_Entity.Factory} */
        const fEntity = spec['TeqFw_Db_Back_Dto_Dem_Entity#Factory$'];
        /** @type {TeqFw_Db_Back_Dto_Dem_Package.Factory} */
        const fPkg = spec['TeqFw_Db_Back_Dto_Dem_Package#Factory$'];
        /** @type {TeqFw_Db_Back_Dto_Dem_Map.Factory} */
        const fMap = spec['TeqFw_Db_Back_Dto_Dem_Map#Factory$'];

        /**
         * @param {TeqFw_Db_Back_Dto_Dem|null} data
         * @return {TeqFw_Db_Back_Dto_Dem}
         */
        this.create = function (data = null) {
            // DEFINE INNER FUNCTIONS
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

            // MAIN FUNCTIONALITY
            const res = new TeqFw_Db_Back_Dto_Dem();
            res.entity = parse(fEntity.create, data?.entity, TEntity.NAME);
            res.map = parse(fMap.create, data?.map, TMap.VIRTUAL);
            res.package = parse(fPkg.create, data?.package);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});

