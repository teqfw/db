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

    constructor(spec) {
        const {castArrayOfObj, castString} = spec['TeqFw_Core_Shared_Util_Cast'];
        /** @type {TeqFw_Db_Back_Dto_RDb_Column.Factory} */
        const fColumn = spec['TeqFw_Db_Back_Dto_RDb_Column#Factory$'];
        /** @type {TeqFw_Db_Back_Dto_RDb_Index.Factory} */
        const fIndex = spec['TeqFw_Db_Back_Dto_RDb_Index#Factory$'];
        /** @type {TeqFw_Db_Back_Dto_RDb_Relation.Factory} */
        const fRelation = spec['TeqFw_Db_Back_Dto_RDb_Relation#Factory$'];

        /**
         * @param {TeqFw_Db_Back_Dto_RDb_Table|null} data
         * @return {TeqFw_Db_Back_Dto_RDb_Table}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_RDb_Table();
            res.columns = castArrayOfObj(data?.columns, fColumn);
            res.comment = castString(data?.comment);
            res.indexes = castArrayOfObj(data?.indexes, fIndex.create);
            res.name = castString(data?.name);
            res.relations = castArrayOfObj(data?.relations, fRelation.create);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_RDb_Table);
