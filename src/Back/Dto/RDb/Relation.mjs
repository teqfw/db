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
     * @param {TeqFw_Core_Shared_Util_Cast.castArray|function} castArray
     * @param {TeqFw_Core_Shared_Util_Cast.castEnum|function} castEnum
     * @param {TeqFw_Core_Shared_Util_Cast.castString|function} castString
     * @param {typeof TeqFw_Db_Back_Enum_Db_Type_Action} ACTION
     */
    constructor(
        {
            'TeqFw_Core_Shared_Util_Cast.castArray': castArray,
            'TeqFw_Core_Shared_Util_Cast.castEnum': castEnum,
            'TeqFw_Core_Shared_Util_Cast.castString': castString,
            'TeqFw_Db_Back_Enum_Db_Type_Action#': ACTION
        }
    ) {
        /**
         * @param {TeqFw_Db_Back_Dto_RDb_Relation|null} data
         * @return {TeqFw_Db_Back_Dto_RDb_Relation}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_RDb_Relation();
            res.itsColumns = castArray(data?.itsColumns);
            res.itsTable = castString(data?.itsTable);
            res.name = castString(data?.name);
            res.onDelete = castEnum(data?.onDelete, ACTION);
            res.onUpdate = castEnum(data?.onUpdate, ACTION);
            res.ownColumns = castArray(data?.ownColumns);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_RDb_Relation);
