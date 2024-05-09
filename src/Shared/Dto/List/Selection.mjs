/**
 *  Criteria to select items for a list.
 *  @namespace TeqFw_Db_Shared_Dto_List_Selection
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Shared_Dto_List_Selection';

/**
 * @memberOf TeqFw_Db_Shared_Dto_List_Selection
 * @type {Object}
 */
const ATTR = {
    FILTER: 'filter',
    ORDER_BY: 'orderBy',
    ROWS_LIMIT: 'rowsLimit',
    ROWS_OFFSET: 'rowsOffset',
};
Object.freeze(ATTR);

// MODULE'S CLASSES
/**
 * @memberOf TeqFw_Db_Shared_Dto_List_Selection
 */
class Dto {
    static namespace = NS;
    /**
     * @type {
     * TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond.Dto|
     * TeqFw_Db_Shared_Dto_List_Selection_Filter_Func.Dto
     * }
     */
    filter;
    /**
     * The array of the ordering rules.
     * @type {TeqFw_Db_Shared_Dto_Order.Dto[]}
     */
    orderBy;
    /** @type {number} */
    rowsLimit;
    /** @type {number} */
    rowsOffset;
}

/**
 * @implements TeqFw_Core_Shared_Api_Factory_Dto_Meta
 */
export default class TeqFw_Db_Shared_Dto_List_Selection {
    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {TeqFw_Db_Shared_Dto_Order} dtoOrder
     * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond} dtoCond
     * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Func} dtoFunc
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
            TeqFw_Db_Shared_Dto_Order$: dtoOrder,
            TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond$: dtoCond,
            TeqFw_Db_Shared_Dto_List_Selection_Filter_Func$: dtoFunc,
        }
    ) {
        // INSTANCE METHODS
        /**
         * @param {TeqFw_Db_Shared_Dto_List_Selection.Dto} [data]
         * @return {TeqFw_Db_Shared_Dto_List_Selection.Dto}
         */
        this.createDto = function (data) {
            // create new DTO and populate it with initialization data
            const res = new Dto();
            // cast known attributes
            if (data?.filter?.with) res.filter = dtoCond.createDto(data?.filter);
            else if (data?.filter?.name) res.filter = dtoFunc.createDto(data?.filter);
            res.orderBy = cast.arrayOfObj(data?.orderBy, dtoOrder.createDto);
            res.rowsLimit = cast.int(data?.rowsLimit);
            res.rowsOffset = cast.int(data?.rowsOffset);
            return res;
        };

        this.getAttributes = () => ATTR;
    }
}
