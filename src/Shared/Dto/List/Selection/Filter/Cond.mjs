/**
 *  The 'cond' node used in the selection filter.
 *  @namespace TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond';

/**
 * @memberOf TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond
 * @type {Object}
 */
const ATTR = {
    ITEMS: 'items',
    WITH: 'with',
};
Object.freeze(ATTR);

// MODULE'S CLASSES
/**
 * @memberOf TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond
 */
class Dto {
    static namespace = NS;
    /**
     * @type {(
     * TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond.Dto|
     * TeqFw_Db_Shared_Dto_List_Selection_Filter_Func.Dto
     * )[]}
     */
    items;
    /**
     * @type {string}
     * @see TeqFw_Db_Shared_Enum_Filter_Cond
     */
    with;
}

/**
 * @implements TeqFw_Core_Shared_Api_Factory_Dto_Meta
 */
export default class TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond {
    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Func} dtoFunc
     * @param {typeof TeqFw_Db_Shared_Enum_Filter_Cond} COND
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
            TeqFw_Db_Shared_Dto_List_Selection_Filter_Func$: dtoFunc,
            TeqFw_Db_Shared_Enum_Filter_Cond$: COND,
        }
    ) {
        // INSTANCE METHODS
        /**
         * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond.Dto} [data]
         * @return {TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond.Dto}
         */
        this.createDto = function (data) {
            // create new DTO and populate it with initialization data
            const res = new Dto();
            // cast known attributes
            res.items = [];
            if (Array.isArray(data?.items))
                for (const one of data.items) {
                    if (one?.with) res.items.push(this.createDto(one));
                    else if (one?.name) res.items.push(dtoFunc.createDto(one));
                }
            res.with = cast.enum(data?.with, COND);
            return res;
        };

        this.getAttributes = () => ATTR;
    }
}
