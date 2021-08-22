/**
 * DTO with table index data.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index {
    /** @type {string[]} */
    columns;
    /** @type {string} */
    name;
    /** @type {typeof TeqFw_Db_Back_Enum_Db_Index} */
    type;
}
// attributes names to use as aliases in queries to object props
TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index.COLUMNS = 'columns';
TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index.NAME = 'name';
TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index.TYPE = 'type';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index
 */
export class Factory {
    constructor() {
        /**
         * @param {TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index|null} data
         * @return {TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index();
            res.columns = Array.isArray(data?.columns) ? data.columns : [];
            res.name = data?.name;
            res.type = data?.type;
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_RDb_Schema_Builder_Dto_Index);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
