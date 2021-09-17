/**
 * DTO for DEM 'entity/relation'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity_Relation';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem_Entity_Relation {
    /** @type {string[]} */
    attrs;
    /** @type {string} */
    name;
    /** @type {TeqFw_Db_Back_Enum_Dem_Type_Action} */
    onDelete;
    /** @type {TeqFw_Db_Back_Enum_Dem_Type_Action} */
    onUpdate;
    /** @type {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref} */
    ref;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity_Relation
 */
export class Factory {
    constructor(spec) {
        const {castArray, castEnum, castString} = spec['TeqFw_Core_Shared_Util_Cast'];
        /** @type {typeof TeqFw_Db_Back_Enum_Dem_Type_Action} */
        const ACTION = spec['TeqFw_Db_Back_Enum_Dem_Type_Action#'];
        /** @type {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref.Factory} */
        const fRef = spec['TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref#Factory$'];

        /**
         * @param {TeqFw_Db_Back_Dto_Dem_Entity_Relation|null} data
         * @return {TeqFw_Db_Back_Dto_Dem_Entity_Relation}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_Dem_Entity_Relation();
            res.attrs = castArray(data?.attrs);
            res.name = castString(data?.name);
            res.onDelete = castEnum(data?.onDelete, ACTION);
            res.onUpdate = castEnum(data?.onUpdate, ACTION);
            res.ref = fRef.create(data?.ref);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Entity_Relation);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
