/**
 * DTO for DEM 'entity/relation/ref'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref {
    /** @type {string[]} */
    attrs;
    /** @type {string} */
    path;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {TeqFw_Core_Shared_Util_Cast.castArray|function} castArray
     * @param {TeqFw_Core_Shared_Util_Cast.castString|function} castString
     */
    constructor(
        {
            'TeqFw_Core_Shared_Util_Cast.castArray': castArray,
            'TeqFw_Core_Shared_Util_Cast.castString': castString,
        }
    ) {
        /**
         * @param {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref|null} data
         * @return {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref();
            res.attrs = castArray(data?.attrs);
            res.path = castString(data?.path);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref);
