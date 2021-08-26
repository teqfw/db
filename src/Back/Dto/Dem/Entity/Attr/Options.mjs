/**
 * DTO for DEM 'entity/attr/options'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options {
    /** @type {number} */
    precision;
    /** @type {number} */
    scale;
    /** @type {boolean} */
    unsigned;
    /**
     * Enum values.
     * @type {Array}
     */
    values;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options
 */
export class Factory {
    constructor() {
        /**
         * @param {TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options|null|{}} data
         * @return {TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options();
            res.precision = data?.precision;
            res.scale = data?.scale;
            res.unsigned = data?.unsigned;
            res.values = Array.isArray(data?.values) ? [...data.values] : undefined;
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});

