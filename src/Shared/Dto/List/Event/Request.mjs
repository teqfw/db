// @ts-check

/**
 * @namespace TeqFw_Db_Shared_Dto_List_Event_Request
 * @description TeqFW database package module.
 */

/**
 * Base for event requests to get listing from backend.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Shared_Dto_List_Event_Request';

// MODULE'S CLASSES
/**
 * @memberOf TeqFw_Db_Shared_Dto_List_Event_Request
 */
class Dto {
    static namespace = NS;
    /** @type {TeqFw_Db_Shared_Dto_List_Selection.Dto} */
    selection;
}

/**
 */
export default class TeqFw_Db_Shared_Dto_List_Event_Request {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Dto_List_Selection} deps.dtoSelection
     */
    constructor({dtoSelection}) {
        // INSTANCE METHODS
        /**
         * @param {TeqFw_Db_Shared_Dto_List_Event_Request.Dto} data
         * @returns {TeqFw_Db_Shared_Dto_List_Event_Request.Dto}
         */
        this.createDto = function (data) {
            // create new DTO and populate it with initialization data
            const res = Object.assign(new Dto(), data);
            // cast known attributes
            res.selection = dtoSelection.createDto(data?.selection);
            return res;
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            dtoSelection: 'TeqFw_Db_Shared_Dto_List_Selection$',
    }),
});
