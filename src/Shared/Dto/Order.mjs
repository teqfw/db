// @ts-check

/**
 * @namespace TeqFw_Db_Shared_Dto_Order
 * @description TeqFW database package module.
 */

/**
 *  Structure for 'ORDER BY' entry.
 *  @namespace TeqFw_Db_Shared_Dto_Order
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Shared_Dto_Order';

/**
 * @memberOf TeqFw_Db_Shared_Dto_Order
 * @type {Object}
 */
const ATTR = {
    ALIAS: 'alias',
    DIR: 'dir',
};
Object.freeze(ATTR);

// MODULE'S CLASSES
/**
 * @memberOf TeqFw_Db_Shared_Dto_Order
 */
class Dto {
    static namespace = NS;
    /**
     * @type {TeqFw_Db_StringOptional}
     */
    alias;
    /**
     * @type {TeqFw_Db_StringOptional}
     * @see TeqFw_Db_Shared_Enum_Direction
     */
    dir;
}

/**
 */
export default class Order {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Cast} deps.cast
     * @param {TeqFw_Db_Shared_Enum_Direction} deps.DIR
     */
    constructor({cast, DIR}) {
        // INSTANCE METHODS
        /**
         * @param {TeqFw_Db_OrderDto} data
         * @returns {TeqFw_Db_OrderDto}
         */
        this.createDto = function (data) {
            // create new DTO and populate it with initialization data
            const res = Object.assign(new Dto(), data);
            // cast known attributes
            res.alias = cast.string(data?.alias);
            const direction = cast.enum(data?.dir, DIR, false);
            res.dir = typeof direction === 'string' ? direction : undefined;
            return res;
        };

        /**
         * @returns {object}
         */
        this.getAttributes = () => ATTR;
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
            DIR: 'TeqFw_Db_Shared_Enum_Direction__default',
    }),
});
