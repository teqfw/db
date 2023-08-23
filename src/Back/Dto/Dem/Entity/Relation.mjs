/**
 * DTO for DEM 'entity/relation'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity_Relation';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem_Entity_Relation {
    /** @type {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action} */
    action;
    /** @type {string[]} */
    attrs;
    /** @type {string} */
    name;
    /** @type {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref} */
    ref;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity_Relation
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {TeqFw_Core_Shared_Util_Cast.castArray|function} castArray
     * @param {TeqFw_Core_Shared_Util_Cast.castString|function} castString
     * @param {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref.Factory} fRef
     * @param {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action.Factory} fAction
     */
    constructor(
        {
            'TeqFw_Core_Shared_Util_Cast.castArray': castArray,
            'TeqFw_Core_Shared_Util_Cast.castString': castString,
            'TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref.Factory$': fRef,
            'TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action.Factory$': fAction,
        }
    ) {

        /**
         * @param {TeqFw_Db_Back_Dto_Dem_Entity_Relation|null} data
         * @return {TeqFw_Db_Back_Dto_Dem_Entity_Relation}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_Dem_Entity_Relation();
            res.action = fAction.create(data?.action);
            res.attrs = castArray(data?.attrs);
            res.name = castString(data?.name);
            res.ref = fRef.create(data?.ref);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Entity_Relation);
