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
     * @type {string}
     */
    alias;
    /**
     * @type {string}
     * @see TeqFw_Db_Shared_Enum_Direction
     */
    dir;
}

/**
 * @implements TeqFw_Core_Shared_Api_Factory_Dto_Meta
 */
export default class TeqFw_Db_Shared_Dto_Order {
    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {typeof TeqFw_Db_Shared_Enum_Direction} DIR
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
            TeqFw_Db_Shared_Enum_Direction$: DIR,
        }
    ) {
        // INSTANCE METHODS
        /**
         * @param {TeqFw_Db_Shared_Dto_Order.Dto} [data]
         * @return {TeqFw_Db_Shared_Dto_Order.Dto}
         */
        this.createDto = function (data) {
            // create new DTO and populate it with initialization data
            const res = Object.assign(new Dto(), data);
            // cast known attributes
            res.alias = cast.string(data?.alias);
            res.dir = cast.enum(data?.dir, DIR, false);
            return res;
        };

        this.getAttributes = () => ATTR;
    }
}