/**
 * DTO for DEM 'package'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Package';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem_Package {
    /** @type {Object<string, TeqFw_Db_Back_Dto_Dem_Entity>} */
    entity;
    /** @type {Object<string, TeqFw_Db_Back_Dto_Dem_Package>} */
    package;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Package
 */
export class Factory {
    static namespace = NS;

    constructor(spec) {
        // DEPS
        /** @type {TeqFw_Db_Back_Dto_Dem_Entity.Factory} */
        const fEntity = spec['TeqFw_Db_Back_Dto_Dem_Entity#Factory$'];

        /**
         * @param {TeqFw_Db_Back_Dto_Dem_Package|null} data
         * @return {TeqFw_Db_Back_Dto_Dem_Package}
         */
        this.create = function create (data = null) {
            // FUNCS
            function parse(fnCreate, data) {
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
            const res = new TeqFw_Db_Back_Dto_Dem_Package();
            res.entity = parse(fEntity.create, data?.entity);
            res.package = parse(create, data?.package);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Package);
