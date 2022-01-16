/**
 * DTO for DEM 'entity/relation/action'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action {
    /** @type {TeqFw_Db_Back_Enum_Dem_Type_Action} */
    delete;
    /** @type {TeqFw_Db_Back_Enum_Dem_Type_Action} */
    update;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action
 */
export class Factory {
    static namespace = NS;

    constructor(spec) {
        /** @type {TeqFw_Core_Shared_Util_Cast.castEnum|function} */
        const castEnum = spec['TeqFw_Core_Shared_Util_Cast.castEnum'];
        /** @type {typeof TeqFw_Db_Back_Enum_Dem_Type_Action} */
        const ACTION = spec['TeqFw_Db_Back_Enum_Dem_Type_Action#'];

        /**
         * @param {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action|null} data
         * @return {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action();
            res.delete = castEnum(data?.delete, ACTION);
            res.update = castEnum(data?.update, ACTION);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Entity_Relation_Action);
