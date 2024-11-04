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
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options.Factory} fOpts
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
            'TeqFw_Db_Back_Dto_Dem_Entity_Attr_Options.Factory$': fOpts,
        }
    ) {
        /**
         * @param {TeqFw_Db_Back_Dto_Dem_Entity_Attr|null} data
         * @returns {TeqFw_Db_Back_Dto_Dem_Entity_Attr}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_Dem_Entity_Attr();
            res.comment = cast.string(data?.comment);
            res.default = cast.primitive(data?.default);
            res.name = cast.string(data?.name);
            res.nullable = cast.boolean(data?.nullable);
            res.options = fOpts.create(data?.options);
            res.type = cast.string(data?.type);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Entity_Attr);
