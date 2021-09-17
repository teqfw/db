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
    default;
    /** @type {Array} */
    enum;
    /** @type {string} */
    name;
    /** @type {boolean} */
    nullable;
    /** @type {number} */
    precision;
    /** @type {number} */
    scale;
    /** @type {typeof TeqFw_Db_Back_Enum_Db_Type_Column} */
    type;
    /** @type {boolean} */
    unsigned;
}
// attributes names to use as aliases in queries to object props
TeqFw_Db_Back_Dto_RDb_Column.COMMENT = 'comment';
TeqFw_Db_Back_Dto_RDb_Column.DEFAULT = 'default';
TeqFw_Db_Back_Dto_RDb_Column.NAME = 'name';
TeqFw_Db_Back_Dto_RDb_Column.NULLABLE = 'nullable';
TeqFw_Db_Back_Dto_RDb_Column.TYPE = 'type';
TeqFw_Db_Back_Dto_RDb_Column.UNSIGNED = 'unsigned';

// noinspection JSCheckFunctionSignatures
/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_RDb_Column
 */
export class Factory {
    constructor(spec) {
        const {castArray, castBooleanIfExists, castEnum, castInt, castString} = spec['TeqFw_Core_Shared_Util_Cast'];
        /** @type {typeof TeqFw_Db_Back_Enum_Db_Type_Column} */
        const COLUMN = spec['TeqFw_Db_Back_Enum_Db_Type_Column#'];

        /**
         * @param {TeqFw_Db_Back_Dto_RDb_Column|null} data
         * @return {TeqFw_Db_Back_Dto_RDb_Column}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_RDb_Column();
            res.comment = castString(data?.comment);
            res.default = castString(data?.default);
            res.enum = castArray(data?.enum);
            res.name = castString(data?.name);
            res.nullable = castBooleanIfExists(data?.nullable);
            res.precision = castInt(data?.precision);
            res.scale = castInt(data?.scale);
            res.type = castEnum(data?.type, COLUMN);
            res.unsigned = castBooleanIfExists(data?.unsigned);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_RDb_Column);
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
