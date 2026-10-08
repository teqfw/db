// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_RDb_Table
 * @description TeqFW database package module.
 */

/**
 * DTO with table data (columns, indexes, foreign keys).
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_RDb_Table';

// MODULE'S CLASSES
export default class Table {
    /** @type {TeqFw_Db_Back_Dto_RDb_Column[] | undefined} */
    columns;
    /** @type {string | undefined} */
    comment;
    /** @type {TeqFw_Db_Back_Dto_RDb_Index[] | undefined} */
    indexes;
    /** @type {string | undefined} */
    name;
    /** @type {TeqFw_Db_Back_Dto_RDb_Relation[] | undefined} */
    relations;
}
// attributes names to use as aliases in queries to object props
Table.COLUMNS = 'columns';
Table.COMMENT = 'comment';
Table.NAME = 'name';
Table.RELATIONS = 'relations';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_RDb_Table
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Cast} deps.cast
     * @param {TeqFw_Db_Back_Dto_RDb_Column__Factory} deps.fColumn
     * @param {TeqFw_Db_Back_Dto_RDb_Index__Factory} deps.fIndex
     * @param {TeqFw_Db_Back_Dto_RDb_Relation__Factory} deps.fRelation
     */
    constructor({cast, fColumn, fIndex, fRelation}) {
        /**
         * @param {unknown} input
         * @returns {TeqFw_Db_Back_Dto_RDb_Table}
         */
        this.create = function (input = null) {
            const data = input && typeof input === 'object' && !Array.isArray(input)
                ? /** @type {TeqFw_Db_Object} */ (input) : null;
            const res = new Table();
            res.columns = Array.isArray(data?.columns) ? data.columns.map((item) => fColumn.create(item)) : [];
            res.comment = cast.string(data?.comment);
            res.indexes = Array.isArray(data?.indexes) ? data.indexes.map((item) => fIndex.create(item)) : [];
            res.name = cast.string(data?.name);
            res.relations = Array.isArray(data?.relations) ? data.relations.map((item) => fRelation.create(item)) : [];
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(Table);

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
            fColumn: 'TeqFw_Db_Back_Dto_RDb_Column__Factory$',
            fIndex: 'TeqFw_Db_Back_Dto_RDb_Index__Factory$',
            fRelation: 'TeqFw_Db_Back_Dto_RDb_Relation__Factory$',
    }),
});
