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
    /** @type {string | undefined} */
    comment;
    /** @type {string | undefined} */
    default;
    /** @type {unknown[] | undefined} */
    enum;
    /** @type {number | undefined} */
    length;
    /** @type {string | undefined} */
    name;
    /** @type {boolean | null | undefined} */
    nullable;
    /** @type {number | undefined} */
    precision;
    /** @type {number | undefined} */
    scale;
    /** @type {TeqFw_Db_StringOptional} */
    type;
    /** @type {boolean | null | undefined} */
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
     * @param {TeqFw_Db_Back_Enum_Db_Type_Column} deps.COLUMN
     */
    constructor({cast, COLUMN}) {
        /**
         * @param {unknown} input
         * @returns {TeqFw_Db_Back_Dto_RDb_Column}
         */
        this.create = function (input = null) {
            const data = input && typeof input === 'object' && !Array.isArray(input)
                ? /** @type {TeqFw_Db_Object} */ (input) : null;
            const res = new TeqFw_Db_Back_Dto_RDb_Column();
            res.comment = cast.string(data?.comment);
            res.default = cast.string(data?.default);
            res.enum = cast.array(data?.enum);
            res.length = cast.int(data?.length);
            res.name = cast.string(data?.name);
            res.nullable = cast.booleanIfExists(data?.nullable);
            res.precision = cast.int(data?.precision);
            res.scale = cast.int(data?.scale);
            const typeValue = cast.enum(data?.type, COLUMN);
            res.type = typeof typeValue === 'string' ? typeValue : undefined;
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
