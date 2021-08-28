/**
 * DTO for map with references resolutions.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Map';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Map {
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
TeqFw_Db_Back_Dto_Map.ALIAS = 'alias';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Map
 */
export class Factory {
    constructor() {
        /**
         * @param {TeqFw_Db_Back_Dto_Map|null} data
         * @return {TeqFw_Db_Back_Dto_Map}
         */
        this.create = function create(data = null) {
            const res = new TeqFw_Db_Back_Dto_Map();
            res.attrs = (typeof data?.attrs === 'object') ? data.attrs : {};
            res.path = data?.path;
            res.alias = data?.alias;
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Map);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});

