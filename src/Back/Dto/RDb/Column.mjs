/**
 * DTO with table column data.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_RDb_Column';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_RDb_Column {
    /** @type {string} */
    comment;
    /** @type {string} */
    name;
    /** @type {boolean} */
    nullable;
    /** @type {typeof TeqFw_Db_Back_Enum_Db_Column} */
    type;
    /** @type {boolean} */
    unsigned;
}
// attributes names to use as aliases in queries to object props
TeqFw_Db_Back_Dto_RDb_Column.COMMENT = 'comment';
TeqFw_Db_Back_Dto_RDb_Column.NAME = 'name';
TeqFw_Db_Back_Dto_RDb_Column.NULLABLE = 'nullable';
TeqFw_Db_Back_Dto_RDb_Column.TYPE = 'type';
TeqFw_Db_Back_Dto_RDb_Column.UNSIGNED = 'unsigned';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_RDb_Column
 */
export class Factory {
    constructor() {
        /**
         * @param {TeqFw_Db_Back_Dto_RDb_Column|null} data
         * @return {TeqFw_Db_Back_Dto_RDb_Column}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_RDb_Column();
            res.comment = data?.comment;
            res.name = data?.name;
            res.nullable = data?.nullable ?? false;
            res.type = data?.type;
            res.unsigned = (typeof data?.unsigned === 'boolean') ? data.unsigned : undefined;
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_RDb_Column);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
