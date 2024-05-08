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
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {typeof TeqFw_Db_Back_Enum_Db_Type_Index} INDEX
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
            'TeqFw_Db_Back_Enum_Db_Type_Index#': INDEX
        }
    ) {

        /**
         * @param {TeqFw_Db_Back_Dto_RDb_Index|null} data
         * @return {TeqFw_Db_Back_Dto_RDb_Index}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_RDb_Index();
            res.columns = cast.array(data?.columns);
            res.name = cast.string(data?.name);
            res.type = cast.enum(data?.type, INDEX);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_RDb_Index);
