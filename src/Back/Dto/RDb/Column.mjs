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
    /** @type {number} */
    length;
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

// noinspection JSCheckFunctionSignatures
/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_RDb_Column
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {TeqFw_Core_Shared_Util_Cast.castArray|function} castArray
     * @param {TeqFw_Core_Shared_Util_Cast.castBooleanIfExists|function} castBooleanIfExists
     * @param {TeqFw_Core_Shared_Util_Cast.castEnum|function} castEnum
     * @param {TeqFw_Core_Shared_Util_Cast.castInt|function} castInt
     * @param {TeqFw_Core_Shared_Util_Cast.castString|function} castString
     * @param {typeof TeqFw_Db_Back_Enum_Db_Type_Column} COLUMN
     */
    constructor(
        {
            'TeqFw_Core_Shared_Util_Cast.castArray': castArray,
            'TeqFw_Core_Shared_Util_Cast.castBooleanIfExists': castBooleanIfExists,
            'TeqFw_Core_Shared_Util_Cast.castEnum': castEnum,
            'TeqFw_Core_Shared_Util_Cast.castInt': castInt,
            'TeqFw_Core_Shared_Util_Cast.castString': castString,
            'TeqFw_Db_Back_Enum_Db_Type_Column#': COLUMN
        }
    ) {
        /**
         * @param {TeqFw_Db_Back_Dto_RDb_Column|null} data
         * @return {TeqFw_Db_Back_Dto_RDb_Column}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_RDb_Column();
            res.comment = castString(data?.comment);
            res.default = castString(data?.default);
            res.enum = castArray(data?.enum);
            res.length = castInt(data?.length);
            res.name = castString(data?.name);
            res.nullable = castBooleanIfExists(data?.nullable);
            res.precision = castInt(data?.precision);
            res.scale = castInt(data?.scale);
            res.type = castEnum(data?.type, COLUMN);
            res.unsigned = castBooleanIfExists(data?.unsigned);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_RDb_Column);
