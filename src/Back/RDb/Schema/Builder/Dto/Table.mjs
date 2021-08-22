/**
 * DTO with table data (columns, indexes, foreign keys).
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_RDb_Schema_Builder_Dto_Table';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_RDb_Schema_Builder_Dto_Table {
    /** @type {TeqFw_Db_Back_RDb_Schema_Builder_Dto_Column[]} */
    columns;
    /** @type {string} */
    comment;
    /** @type {TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index[]} */
    indexes;
    /** @type {string} */
    name;
    /** @type {TeqFw_Db_Back_RDb_Schema_Builder_Dto_Relation[]} */
    relations;
}
// attributes names to use as aliases in queries to object props
TeqFw_Db_Back_RDb_Schema_Builder_Dto_Table.COLUMNS = 'columns';
TeqFw_Db_Back_RDb_Schema_Builder_Dto_Table.COMMENT = 'comment';
TeqFw_Db_Back_RDb_Schema_Builder_Dto_Table.NAME = 'name';
TeqFw_Db_Back_RDb_Schema_Builder_Dto_Table.RELATIONS = 'relations';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_RDb_Schema_Builder_Dto_Table
 */
export class Factory {
    constructor(spec) {
        // EXTRACT DEPS
        /** @type {typeof TeqFw_Db_Back_RDb_Schema_Builder_Dto_Column} */
        const TColumn = spec['TeqFw_Db_Back_RDb_Schema_Builder_Dto_Column#'];
        /** @type {TeqFw_Db_Back_RDb_Schema_Builder_Dto_Column.Factory} */
        const fColumn = spec['TeqFw_Db_Back_RDb_Schema_Builder_Dto_Column#Factory$'];
        /** @type {typeof TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index} */
        const TIndex = spec['TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index#'];
        /** @type {TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index.Factory} */
        const fIndex = spec['TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index#Factory$'];
        /** @type {typeof TeqFw_Db_Back_RDb_Schema_Builder_Dto_Relation} */
        const TRelation = spec['TeqFw_Db_Back_RDb_Schema_Builder_Dto_Relation#'];
        /** @type {TeqFw_Db_Back_RDb_Schema_Builder_Dto_Relation.Factory} */
        const fRelation = spec['TeqFw_Db_Back_RDb_Schema_Builder_Dto_Relation#Factory$'];

        /**
         * @param {TeqFw_Db_Back_RDb_Schema_Builder_Dto_Table|null} data
         * @return {TeqFw_Db_Back_RDb_Schema_Builder_Dto_Table}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_RDb_Schema_Builder_Dto_Table();
            res.columns = Array.isArray(data?.columns)
                ? data.columns.map((one) => (one instanceof TColumn) ? one : fColumn.create(one))
                : [];
            res.comment = data?.comment;
            res.indexes = Array.isArray(data?.indexes)
                ? data.indexes.map((one) => (one instanceof TIndex) ? one : fIndex.create(one))
                : [];
            res.name = data?.name;
            res.relations = Array.isArray(data?.relations)
                ? data.relations.map((one) => (one instanceof TRelation) ? one : fRelation.create(one))
                : [];
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_RDb_Schema_Builder_Dto_Table);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
