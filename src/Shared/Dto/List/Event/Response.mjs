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
 * @implements TeqFw_Core_Shared_Api_Factory_IDto
 */
export default class TeqFw_Db_Shared_Dto_List_Event_Response {
    constructor(spec) {
        // DEPS
        // /** @type {TeqFw_Core_Shared_Util_Cast.castArrayOfObj|function} */
        // const castArrayOfObj = spec['TeqFw_Core_Shared_Util_Cast.castArrayOfObj'];
        /** @type {TeqFw_Core_Shared_Util_Cast.castInt|function} */
        const castInt = spec['TeqFw_Core_Shared_Util_Cast.castInt'];
        /** @type {TeqFw_Db_Shared_Dto_List_Selection} */
        const dtoSelection = spec['TeqFw_Db_Shared_Dto_List_Selection$'];

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
