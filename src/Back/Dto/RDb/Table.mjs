/**
 * DTO with table data (columns, indexes, foreign keys).
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_RDb_Table';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_RDb_Table {
    /** @type {TeqFw_Db_Back_Dto_RDb_Column[]} */
    columns;
    /** @type {string} */
    comment;
    /** @type {TeqFw_Db_Back_Dto_RDb_Index[]} */
    indexes;
    /** @type {string} */
    name;
    /** @type {TeqFw_Db_Back_Dto_RDb_Relation[]} */
    relations;
}
// attributes names to use as aliases in queries to object props
TeqFw_Db_Back_Dto_RDb_Table.COLUMNS = 'columns';
TeqFw_Db_Back_Dto_RDb_Table.COMMENT = 'comment';
TeqFw_Db_Back_Dto_RDb_Table.NAME = 'name';
TeqFw_Db_Back_Dto_RDb_Table.RELATIONS = 'relations';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_RDb_Table
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {TeqFw_Db_Back_Dto_RDb_Column.Factory} fColumn
     * @param {TeqFw_Db_Back_Dto_RDb_Index.Factory} fIndex
     * @param {TeqFw_Db_Back_Dto_RDb_Relation.Factory} fRelation
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
            'TeqFw_Db_Back_Dto_RDb_Column.Factory$': fColumn,
            'TeqFw_Db_Back_Dto_RDb_Index.Factory$': fIndex,
            'TeqFw_Db_Back_Dto_RDb_Relation.Factory$': fRelation,
        }
    ) {
        /**
         * @param {TeqFw_Db_Back_Dto_RDb_Table|null} data
         * @return {TeqFw_Db_Back_Dto_RDb_Table}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_RDb_Table();
            res.columns = cast.arrayOfObj(data?.columns, fColumn);
            res.comment = cast.string(data?.comment);
            res.indexes = cast.arrayOfObj(data?.indexes, fIndex.create);
            res.name = cast.string(data?.name);
            res.relations = cast.arrayOfObj(data?.relations, fRelation.create);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_RDb_Table);
