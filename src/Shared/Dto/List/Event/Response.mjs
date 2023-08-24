/**
 * Base for event responses to send listing to frontend.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Shared_Dto_List_Event_Response';

// MODULE'S CLASSES
/**
 * @memberOf TeqFw_Db_Shared_Dto_List_Event_Response
 */
class Dto {
    static namespace = NS;
    /**
     * @type {Object[]}
     */
    items;
    /**
     * Total number of rows matching given selection.
     * @type {number}
     */
    rowsTotal;
    /**
     * @type {TeqFw_Db_Shared_Dto_List_Selection.Dto}
     */
    selection;
}

/**
 * @implements TeqFw_Core_Shared_Api_Factory_Dto
 */
export default class TeqFw_Db_Shared_Dto_List_Event_Response {
    /**
     * @param {TeqFw_Core_Shared_Util_Cast.castArrayOfObj|function} castArrayOfObj
     * @param {TeqFw_Core_Shared_Util_Cast.castInt|function} castInt
     * @param {TeqFw_Db_Shared_Dto_List_Selection} dtoSelection
     */
    constructor(
        {
            'TeqFw_Core_Shared_Util_Cast.castArrayOfObj': castArrayOfObj,
            'TeqFw_Core_Shared_Util_Cast.castInt': castInt,
            TeqFw_Db_Shared_Dto_List_Selection$: dtoSelection,
        }) {
        // INSTANCE METHODS
        /**
         * @param {TeqFw_Db_Shared_Dto_List_Event_Response.Dto} [data]
         * @return {TeqFw_Db_Shared_Dto_List_Event_Response.Dto}
         */
        this.createDto = function (data) {
            // create new DTO and populate it with initialization data
            const res = Object.assign(new Dto(), data);
            // cast known attributes
            // res.items = castArrayOfObj(data?.items);
            res.rowsTotal = castInt(data?.rowsTotal);
            res.selection = dtoSelection.createDto(data?.selection);
            return res;
        }
    }
}
