// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_RDb_Column
 * @description TeqFW database package module.
 */

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
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Cast} deps.cast
     * @param {typeof TeqFw_Db_Back_Enum_Db_Type_Column} deps.COLUMN
     */
    constructor({cast, COLUMN}) {
        /**
         * @param {TeqFw_Db_Back_Dto_RDb_Column|null} data
         * @returns {TeqFw_Db_Back_Dto_RDb_Column}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_RDb_Column();
            res.comment = cast.string(data?.comment);
            res.default = cast.string(data?.default);
            res.enum = cast.array(data?.enum);
            res.length = cast.int(data?.length);
            res.name = cast.string(data?.name);
            res.nullable = cast.booleanIfExists(data?.nullable);
            res.precision = cast.int(data?.precision);
            res.scale = cast.int(data?.scale);
            res.type = cast.enum(data?.type, COLUMN);
            res.unsigned = cast.booleanIfExists(data?.unsigned);
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(TeqFw_Db_Back_Dto_RDb_Column);

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
            COLUMN: 'TeqFw_Db_Back_Enum_Db_Type_Column__default',
    }),
});
