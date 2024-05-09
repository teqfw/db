/**
 *  The 'value' node used in the selection filter.
 *  @namespace TeqFw_Db_Shared_Dto_List_Selection_Filter_Value
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Shared_Dto_List_Selection_Filter_Value';

/**
 * @memberOf TeqFw_Db_Shared_Dto_List_Selection_Filter_Value
 * @type {Object}
 */
const ATTR = {
    VALUE: 'value',
};
Object.freeze(ATTR);

// MODULE'S CLASSES
/**
 * @memberOf TeqFw_Db_Shared_Dto_List_Selection_Filter_Value
 */
class Dto {
    static namespace = NS;
    /** @type {string|number|boolean} */
    value;
}

/**
 * @implements TeqFw_Core_Shared_Api_Factory_Dto_Meta
 */
export default class TeqFw_Db_Shared_Dto_List_Selection_Filter_Value {
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
         * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Value.Dto} [data]
         * @return {TeqFw_Db_Shared_Dto_List_Selection_Filter_Value.Dto}
         */
        this.createDto = function (data) {
            // create new DTO and populate it with initialization data
            const res = Object.assign(new Dto(), data);
            // cast known attributes
            res.value = cast.primitive(res?.value); // 'symbol' and 'null' are also included but not used
            return res;
        };

        this.getAttributes = () => ATTR;
    }
}
