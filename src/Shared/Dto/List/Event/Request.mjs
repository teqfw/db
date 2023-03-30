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
 * @implements TeqFw_Core_Shared_Api_Factory_Dto
 */
export default class TeqFw_Db_Shared_Dto_List_Event_Request {
    constructor(spec) {
        // DEPS
        /** @type {TeqFw_Db_Shared_Dto_List_Selection} */
        const dtoSelection = spec['TeqFw_Db_Shared_Dto_List_Selection$'];

        // INSTANCE METHODS
        /**
         * @param {TeqFw_Db_Shared_Dto_List_Event_Request.Dto} [data]
         * @return {TeqFw_Db_Shared_Dto_List_Event_Request.Dto}
         */
        this.createDto = function (data) {
            // create new DTO and populate it with initialization data
            const res = Object.assign(new Dto(), data);
            // cast known attributes
            res.selection = dtoSelection.createDto(data?.selection);
            return res;
        }
    }
}
