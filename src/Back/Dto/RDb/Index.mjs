/**
 * DTO with table index data.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_RDb_Index';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_RDb_Index {
    /** @type {string[]} */
    columns;
    /** @type {string} */
    name;
    /** @type {typeof TeqFw_Db_Back_Enum_Db_Type_Index} */
    type;
}
// attributes names to use as aliases in queries to object props
TeqFw_Db_Back_Dto_RDb_Index.COLUMNS = 'columns';
TeqFw_Db_Back_Dto_RDb_Index.NAME = 'name';
TeqFw_Db_Back_Dto_RDb_Index.TYPE = 'type';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_RDb_Index
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {TeqFw_Core_Shared_Util_Cast.castArray|function} castArray
     * @param {TeqFw_Core_Shared_Util_Cast.castEnum|function} castEnum
     * @param {TeqFw_Core_Shared_Util_Cast.castString|function} castString
     * @param {typeof TeqFw_Db_Back_Enum_Db_Type_Index} INDEX
     */
    constructor(
        {
            'TeqFw_Core_Shared_Util_Cast.castArray': castArray,
            'TeqFw_Core_Shared_Util_Cast.castEnum': castEnum,
            'TeqFw_Core_Shared_Util_Cast.castString': castString,
            'TeqFw_Db_Back_Enum_Db_Type_Index#': INDEX
        }
    ) {

        /**
         * @param {TeqFw_Db_Back_Dto_RDb_Index|null} data
         * @return {TeqFw_Db_Back_Dto_RDb_Index}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_RDb_Index();
            res.columns = castArray(data?.columns);
            res.name = castString(data?.name);
            res.type = castEnum(data?.type, INDEX);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_RDb_Index);
