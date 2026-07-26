// @ts-check

/**
 * @namespace TeqFw_Db_Shared_Dto_List_Event_Response
 * @description TeqFW database package module.
 */

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
 */
export default class TeqFw_Db_Shared_Dto_List_Event_Response {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Cast} deps.cast
     * @param {TeqFw_Db_Shared_Dto_List_Selection} deps.dtoSelection
     */
    constructor({cast, dtoSelection}) {
        // INSTANCE METHODS
        /**
         * @param {TeqFw_Db_Shared_Dto_List_Event_Response.Dto} data
         * @returns {TeqFw_Db_Shared_Dto_List_Event_Response.Dto}
         */
        this.createDto = function (data) {
            // create new DTO and populate it with initialization data
            const res = Object.assign(new Dto(), data);
            // cast known attributes
            res.items = cast.arrayOfObj(data?.items); // was disabled with comment
            res.rowsTotal = cast.int(data?.rowsTotal);
            res.selection = dtoSelection.createDto(data?.selection);
            return res;
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
            dtoSelection: 'TeqFw_Db_Shared_Dto_List_Selection$',
    }),
});
