// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_RDb_Index
 * @description TeqFW database package module.
 */

/**
 * DTO with table index data.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_RDb_Index';

// MODULE'S CLASSES
export default class Index {
    /** @type {unknown[] | undefined} */
    columns;
    /** @type {string | undefined} */
    name;
    /** @type {TeqFw_Db_StringOptional} */
    type;
}
// attributes names to use as aliases in queries to object props
Index.COLUMNS = 'columns';
Index.NAME = 'name';
Index.TYPE = 'type';

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_RDb_Index
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Cast} deps.cast
     * @param {TeqFw_Db_Back_Enum_Db_Type_Index} deps.INDEX
     */
    constructor({cast, INDEX}) {

        /**
         * @param {unknown} input
         * @returns {TeqFw_Db_Back_Dto_RDb_Index}
         */
        this.create = function (input = null) {
            const data = input && typeof input === 'object' && !Array.isArray(input)
                ? /** @type {TeqFw_Db_Object} */ (input) : null;
            const res = new Index();
            res.columns = cast.array(data?.columns);
            res.name = cast.string(data?.name);
            const typeValue = cast.enum(data?.type, INDEX);
            res.type = typeof typeValue === 'string' ? typeValue : undefined;
            return res;
        };
    }
}

// finalize code components for this es6-module
Object.freeze(Index);

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
            INDEX: 'TeqFw_Db_Back_Enum_Db_Type_Index__default',
    }),
});
