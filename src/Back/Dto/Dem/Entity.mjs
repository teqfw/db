/**
 * DTO for DEM 'entity'.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Dem_Entity';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Dem_Entity {
    /** @type {Object<string, TeqFw_Db_Back_Dto_Dem_Entity_Attr>} */
    attr;
    /** @type {string} */
    comment;
    /** @type {Object<string, TeqFw_Db_Back_Dto_Dem_Entity_Index>} */
    index;
    /** @type {string} */
    name;
    /** @type {string} */
    path;
    /** @type {Object<string, TeqFw_Db_Back_Dto_Dem_Entity_Relation>} */
    relation;
}

// attributes names to use as aliases in queries to object props
TeqFw_Db_Back_Dto_Dem_Entity.NAME = 'name';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Dem_Entity
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {TeqFw_Db_Back_Dto_Dem_Entity_Attr.Factory} fAttr
     * @param {TeqFw_Db_Back_Dto_Dem_Entity_Index.Factory} fIndex
     * @param {TeqFw_Db_Back_Dto_Dem_Entity_Relation.Factory} fRelation
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
            'TeqFw_Db_Back_Dto_Dem_Entity_Attr.Factory$': fAttr,
            'TeqFw_Db_Back_Dto_Dem_Entity_Index.Factory$': fIndex,
            'TeqFw_Db_Back_Dto_Dem_Entity_Relation.Factory$': fRelation,
        }
    ) {

        /**
         * @param {TeqFw_Db_Back_Dto_Dem_Entity|null} data
         * @returns {TeqFw_Db_Back_Dto_Dem_Entity}
         */
        this.create = function (data = null) {
            // FUNCS

            function parse(fnCreate, data) {
                const res = {};
                if (typeof data === 'object') {
                    for (const name of Object.keys(data)) {
                        const item = fnCreate(data[name]);
                        item.name = name;
                        res[name] = item;
                    }
                }
                return res;
            }

            // MAIN
            const res = new TeqFw_Db_Back_Dto_Dem_Entity();
            res.attr = parse(fAttr.create, data?.attr);
            res.comment = cast.string(data?.comment);
            res.index = parse(fIndex.create, data?.index);
            res.name = cast.string(data?.name);
            res.path = cast.string(data?.path);
            res.relation = parse(fRelation.create, data?.relation);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_Dem_Entity);
