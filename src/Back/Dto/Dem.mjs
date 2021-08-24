/**
 * DTO for DEM (Domain Entities Model).
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem {
    /** @type {Object<string, TeqFw_Db_Back_Dto_Dem_Entity>} */
    entity;
    /** @type {Object} */
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

            function parseEntity(data) {
                const res = {};
                if (typeof data === 'object') {
                    for (const key of Object.keys(data)) {
                        const item = fEntity.create(data[key]);
                        item.name = key;
                        res[key] = item;
                    }
                }
                return res;
            }

            function parsePackages(data) {
                const res = {};
                if (typeof data === 'object') {
                    for (const key of Object.keys(data)) {
                        const item = fPkg.create(data[key]);
                        item.name = key;
                        res[key] = item;
                    }
                }
                return res;
            }

            // MAIN FUNCTIONALITY
            const res = new TeqFw_Db_Back_Dto_Dem();
            res.entity = parseEntity(data?.entity);
            res.map = data?.map;
            res.package = parsePackages(data?.package);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});

