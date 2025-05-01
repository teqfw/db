/**
 * Criteria to select items for a list.
 * @implements TeqFw_Core_Shared_Api_Factory_Dto_Meta
 */
export default class TeqFw_Db_Shared_Dto_List_Selection {
    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {TeqFw_Db_Shared_Dto_Order} dtoOrder
     * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond} dtoCond
     * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Func} dtoFunc
     * @param {typeof TeqFw_Db_Shared_Enum_Direction} DIRECTION
     * @param {typeof TeqFw_Db_Shared_Enum_Filter_Cond} CONDITION
     * @param {typeof TeqFw_Db_Shared_Enum_Filter_Func} FUNCTION
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
            TeqFw_Db_Shared_Dto_Order$: dtoOrder,
            TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond$: dtoCond,
            TeqFw_Db_Shared_Dto_List_Selection_Filter_Func$: dtoFunc,
            TeqFw_Db_Shared_Enum_Direction$: DIRECTION,
            TeqFw_Db_Shared_Enum_Filter_Cond$: CONDITION,
            TeqFw_Db_Shared_Enum_Filter_Func$: FUNCTION,
        }
    ) {
        /**
         * @param {TeqFw_Db_Shared_Dto_List_Selection.Dto} [data]
         * @returns {TeqFw_Db_Shared_Dto_List_Selection.Dto}
         */
        this.create = function (data) {
            // create a new DTO and populate it with initialization data
            const res = new Dto();
            // cast known attributes
            if (data?.filter?.with) res.filter = dtoCond.createDto(data?.filter);
            else if (data?.filter?.name) res.filter = dtoFunc.createDto(data?.filter);
            res.orderBy = cast.arrayOfObj(data?.orderBy, dtoOrder.createDto);
            res.rowsLimit = cast.int(data?.rowsLimit);
            res.rowsOffset = cast.int(data?.rowsOffset);
            return res;
        };

        /**
         * @param {TeqFw_Db_Shared_Dto_List_Selection.Dto} [data]
         * @returns {TeqFw_Db_Shared_Dto_List_Selection.Dto}
         * @deprecated Use create() instead.
         */
        this.createDto = function (data) {
            return this.create(data);
        };

        /**
         *
         * @returns {typeof TeqFw_Db_Shared_Dto_List_Selection.ATTR}
         */
        this.getAttributes = () => ATTR;

        /**
         * @returns {typeof TeqFw_Db_Shared_Enum_Direction}
         */
        this.getDirections = () => DIRECTION;

        /**
         * @returns {typeof TeqFw_Db_Shared_Enum_Filter_Cond}
         */
        this.getConditions = () => CONDITION;

        /**
         * @returns {typeof TeqFw_Db_Shared_Enum_Filter_Func}
         */
        this.getFunctions = () => FUNCTION;
    }
}

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

/**
 * @memberOf TeqFw_Db_Shared_Dto_List_Selection
 */
class Dto {
    /**
     * @type {TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond.Dto|TeqFw_Db_Shared_Dto_List_Selection_Filter_Func.Dto}
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