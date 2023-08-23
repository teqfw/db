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

/**
 * @memberOf TeqFw_Db_Shared_Dto_Order
 * @type {Object}
 * @exports
 */
const DIRECTION = {
    ASC: 'asc',
    DESC: 'desc',
};

Object.freeze(ATTR);
Object.freeze(DIRECTION);

// MODULE'S CLASSES
/**
 * @memberOf TeqFw_Db_Shared_Dto_Order
 */
class Dto {
    static namespace = NS;
    /**
     * @type {string}
     */
    alias;
    /**
     * @see TeqFw_Db_Shared_Dto_Order.DIRECTION
     * @type {string}
     */
    dir;
}

/**
 * @implements TeqFw_Core_Shared_Api_Factory_Dto_Meta
 */
export default class TeqFw_Db_Shared_Dto_Order {
    /**
     * @param {TeqFw_Core_Shared_Util_Cast.castString|function} castString
     * @param {TeqFw_Core_Shared_Util_Cast.castEnum|function} castEnum
     */

    constructor(
        {
            'TeqFw_Core_Shared_Util_Cast.castString': castString,
            'TeqFw_Core_Shared_Util_Cast.castEnum': castEnum,
        }) {
        // INSTANCE METHODS
        /**
         * @param {TeqFw_Db_Shared_Dto_Order.Dto} [data]
         * @return {TeqFw_Db_Shared_Dto_Order.Dto}
         */
        this.createDto = function (data) {
            // create new DTO and populate it with initialization data
            const res = Object.assign(new Dto(), data);
            // cast known attributes
            res.alias = castString(data?.alias);
            res.dir = castEnum(data?.dir, DIRECTION, false);
            return res;
        }

        this.getAttributes = () => ATTR;
    }
}

export {
    DIRECTION,
}