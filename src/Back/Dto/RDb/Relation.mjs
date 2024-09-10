/**
 * DTO with table foreign key data.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_RDb_Relation';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_RDb_Relation {
    /** @type {string[]} */
    itsColumns;
    /** @type {string} */
    itsTable;
    /** @type {string} */
    name;
    /** @type {typeof TeqFw_Db_Back_Enum_Db_Type_Action} */
    onDelete;
    /** @type {typeof TeqFw_Db_Back_Enum_Db_Type_Action} */
    onUpdate;
    /** @type {string[]} */
    ownColumns;
}
// attributes names to use as aliases in queries to object props
TeqFw_Db_Back_Dto_RDb_Relation.ITS_COLUMNS = 'itsColumns';
TeqFw_Db_Back_Dto_RDb_Relation.ITS_TABLE = 'itsTable';
TeqFw_Db_Back_Dto_RDb_Relation.NAME = 'name';
TeqFw_Db_Back_Dto_RDb_Relation.ON_DELETE = 'onDelete';
TeqFw_Db_Back_Dto_RDb_Relation.ON_UPDATE = 'onUpdate';
TeqFw_Db_Back_Dto_RDb_Relation.OWN_COLUMNS = 'ownColumns';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_RDb_Relation
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {typeof TeqFw_Db_Back_Enum_Db_Type_Action} ACTION
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
            'TeqFw_Db_Back_Enum_Db_Type_Action.default': ACTION
        }
    ) {
        /**
         * @param {TeqFw_Db_Back_Dto_RDb_Relation|null} data
         * @return {TeqFw_Db_Back_Dto_RDb_Relation}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_RDb_Relation();
            res.itsColumns = cast.array(data?.itsColumns);
            res.itsTable = cast.string(data?.itsTable);
            res.name = cast.string(data?.name);
            res.onDelete = cast.enum(data?.onDelete, ACTION);
            res.onUpdate = cast.enum(data?.onUpdate, ACTION);
            res.ownColumns = cast.array(data?.ownColumns);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_RDb_Relation);
