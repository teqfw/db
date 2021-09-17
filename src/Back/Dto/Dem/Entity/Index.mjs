/**
 * DTO for DEM 'entity/index'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity_Index';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem_Entity_Index {
    /** @type {string[]} */
    attrs;
    /** @type {string} */
    name;
    /** @type {string} */
    type;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity_Index
 */
export class Factory {
    constructor(spec) {
        const {castArray, castString} = spec['TeqFw_Core_Shared_Util_Cast'];
        /**
         * @param {TeqFw_Db_Back_Dto_Dem_Entity_Index|null} data
         * @return {TeqFw_Db_Back_Dto_Dem_Entity_Index}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_Dem_Entity_Index();
            res.attrs = castArray(data?.attrs);
            res.name = castString(data?.name);
            res.type = castString(data?.type);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Entity_Index);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});

