/**
 * DTO for DEM 'map'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Map';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem_Map {
    /**
     * Attributes mapping: virtual => real.
     * @type {Object<string, string>}
     */
    attrs;
    /**
     * Path to existing entity (/path/to/entity).
     * @type {string}
     */
    path;
    /**
     * Path to virtual entity (/path/to/entity).
     * @type {string}
     */
    virtual;
}

// attributes names to use as aliases in queries to object props
TeqFw_Db_Back_Dto_Dem_Map.VIRTUAL = 'virtual';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Map
 */
export class Factory {
    constructor() {
        /**
         * @param {TeqFw_Db_Back_Dto_Dem_Map|null|Object} data
         * @return {TeqFw_Db_Back_Dto_Dem_Map}
         */
        this.create = function create(data = null) {
            const res = new TeqFw_Db_Back_Dto_Dem_Map();
            res.attrs = (typeof data?.attrs === 'object') ? data.attrs : {};
            res.path = data?.path;
            res.virtual = data?.virtual;
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Map);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});

