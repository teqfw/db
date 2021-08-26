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
        // EXTRACT DEPS
        /** @type {TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref.Factory} */
        const fRef = spec['TeqFw_Db_Back_Dto_Dem_Entity_Relation_Ref#Factory$'];

        /**
         * @param {TeqFw_Db_Back_Dto_Dem_Entity_Relation|null} data
         * @return {TeqFw_Db_Back_Dto_Dem_Entity_Relation}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_Dem_Entity_Relation();
            res.attrs = Array.isArray(data?.attrs) ? [...data.attrs] : [];
            res.name = data?.name;
            res.onDelete = data?.onDelete;
            res.onUpdate = data?.onUpdate;
            res.ref = fRef.create(data?.ref);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Entity_Relation);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});

