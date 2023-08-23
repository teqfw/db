/**
 * DTO for DEM 'ref' (reference to external entities and attributes).
 * This DTO is used in 'TeqFw_Db_Back_RDb_Schema_A' namespace only.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_RDb_Schema_A_Dto_Ref';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_RDb_Schema_A_Dto_Ref {
    /**
     * Path to referencing entity.
     * @type {string}
     */
    path;
    /**
     * Attributes of the referencing entity that are used in relations.
     * @type {string[]}
     */
    attrs;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_RDb_Schema_A_Dto_Ref
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
         * @param {TeqFw_Db_Back_RDb_Schema_A_Dto_Ref|null} data
         * @return {TeqFw_Db_Back_RDb_Schema_A_Dto_Ref}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_RDb_Schema_A_Dto_Ref();
            res.path = castString(data?.path);
            res.attrs = castArray(data?.attrs);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_RDb_Schema_A_Dto_Ref);
