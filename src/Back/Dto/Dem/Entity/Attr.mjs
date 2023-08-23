/**
 * DTO for DEM 'entity/attr'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity_Attr';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem_Entity_Attr {
    /** @type {string} */
    comment;
    /** @type {string|number|boolean} */
    default;
    /** @type {string} */
    name;
    /** @type {boolean} */
    nullable;
    /** @type {TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options} */
    options;
    /** @type {string} */
    type;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity_Attr
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {TeqFw_Core_Shared_Util_Cast.castBoolean|function} castBoolean
     * @param {TeqFw_Core_Shared_Util_Cast.castPrimitive|function} castPrimitive
     * @param {TeqFw_Core_Shared_Util_Cast.castString|function} castString
     * @param {TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options.Factory} fOpts
     */
    constructor(
        {
            'TeqFw_Core_Shared_Util_Cast.castBoolean': castBoolean,
            'TeqFw_Core_Shared_Util_Cast.castPrimitive': castPrimitive,
            'TeqFw_Core_Shared_Util_Cast.castString': castString,
            'TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options.Factory$': fOpts,
        }
    ) {
        /**
         * @param {TeqFw_Db_Back_Dto_Dem_Entity_Attr|null} data
         * @return {TeqFw_Db_Back_Dto_Dem_Entity_Attr}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_Dem_Entity_Attr();
            res.comment = castString(data?.comment);
            res.default = castPrimitive(data?.default);
            res.name = castString(data?.name);
            res.nullable = castBoolean(data?.nullable);
            res.options = fOpts.create(data?.options);
            res.type = castString(data?.type);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Entity_Attr);
