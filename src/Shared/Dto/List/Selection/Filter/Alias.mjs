/**
 *  The 'alias' node used in the selection filter.
 *  @namespace TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias';

/**
 * @memberOf TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias
 * @type {Object}
 */
const ATTR = {
    ALIAS: 'alias',
};
Object.freeze(ATTR);

// MODULE'S CLASSES
/**
 * @memberOf TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias
 */
class Dto {
    static namespace = NS;
    /** @type {string} */
    alias;
}

/**
 * @implements TeqFw_Core_Shared_Api_Factory_Dto_Meta
 */
export default class TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias {
    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
        }
    ) {
        // INSTANCE METHODS
        /**
         * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias.Dto} [data]
         * @returns {TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias.Dto}
         */
        this.createDto = function (data) {
            // create new DTO and populate it with initialization data
            const res = Object.assign(new Dto(), data);
            // cast known attributes
            res.alias = cast.string(res?.alias);
            return res;
        };

        this.getAttributes = () => ATTR;
    }
}
