/**
 * DTO for DEM 'entity/attr/options'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options {
    /** @type {boolean} */
    dateOnly;
    /** @type {number} */
    length;
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

// noinspection JSCheckFunctionSignatures
/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options
 */
export class Factory {
    static namespace = NS;

    constructor(spec) {
        const {castArray, castBooleanIfExists, castInt} = spec['TeqFw_Core_Shared_Util_Cast'];
        /**
         * @param {TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options|null} data
         * @return {TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options();
            res.dateOnly = castBooleanIfExists(data?.dateOnly);
            res.length = castInt(data?.length);
            res.precision = castInt(data?.precision);
            res.scale = castInt(data?.scale);
            res.unsigned = castBooleanIfExists(data?.unsigned);
            res.values = castArray(data?.values);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options);
