/**
 * The model to populate queries with clauses from selection object.
 * (@see TeqFw_Db_Shared_Dto_List_Selection)
 */
export default class TeqFw_Db_Back_Mod_Selection {
    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias} dtoAlias
     * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond} dtoCond
     * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Func} dtoFunc
     * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Value} dtoValue
     * @param {TeqFw_Db_Shared_Dto_List_Selection} dtoSelect
     * @param {TeqFw_Db_Shared_Dto_Order} dtoOrder
     * @param {typeof TeqFw_Db_Shared_Enum_Filter_Cond} COND
     * @param {typeof TeqFw_Db_Shared_Enum_Filter_Func} FUNC
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
            TeqFw_Db_Shared_Dto_List_Selection_Filter_Alias$: dtoAlias,
            TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond$: dtoCond,
            TeqFw_Db_Shared_Dto_List_Selection_Filter_Func$: dtoFunc,
            TeqFw_Db_Shared_Dto_List_Selection_Filter_Value$: dtoValue,
            TeqFw_Db_Shared_Dto_List_Selection$: dtoSelect,
            TeqFw_Db_Shared_Dto_Order$: dtoOrder,
            TeqFw_Db_Shared_Enum_Filter_Cond$: COND,
            TeqFw_Db_Shared_Enum_Filter_Func$: FUNC,
        }
    ) {
        // VARS
        const A_ALIAS = dtoAlias.getAttributes();
        const A_COND = dtoCond.getAttributes();
        const A_FUNC = dtoFunc.getAttributes();
        const A_ORDER = dtoOrder.getAttributes();
        const A_SELECT = dtoSelect.getAttributes();
        const A_VALUE = dtoValue.getAttributes();

        // FUNCS

        /**
         * Convert the function name to a Knex operation.
         * @param {string} name
         * @returns {string}
         */
        function getOperation(name) {
            if (name === FUNC.EQ) return '=';
            else if (name === FUNC.GT) return '>';
            else if (name === FUNC.LT) return '<';
            else if (name === FUNC.GTE) return '>=';
            else if (name === FUNC.LTE) return '<=';
            else if (name === FUNC.NOT_EQ) return '!=';
            else if (name === FUNC.NULL) return '!=';
        }

        /**
         * Populate the Knex query with clauses from the filter.
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {TeqFw_Db_Back_Api_RDb_Query_List} meta
         * @param {Knex.QueryBuilder} queryBuilder
         * @param {
         * TeqFw_Db_Shared_Dto_List_Selection_Filter_Cond.Dto|
         * TeqFw_Db_Shared_Dto_List_Selection_Filter_Func.Dto
         * } filter
         */
        function processFilter(trx, meta, queryBuilder, filter) {
            // FUNCS
            /**
             * The function is a "leaf" in the SQL filter tree. So, the function is converted into the SQL query fragment:
             * ```
             *  queryBuilder.where(params[0], opr, params[1]); // where('u.bid, '=', 32)
             * ```
             *
             * @param {TeqFw_Db_Back_RDb_ITrans} trx
             * @param {TeqFw_Db_Back_Api_RDb_Query_List} meta
             * @param {Knex.QueryBuilder} queryBuilder
             * @param {TeqFw_Db_Shared_Dto_List_Selection_Filter_Func.Dto} func
             */
            function processFunc(trx, meta, queryBuilder, func) {
                const name = cast.enum(func?.[A_FUNC.NAME], FUNC);
                const params = [];
                if (name) { // function
                    if (Array.isArray(func?.[A_FUNC.PARAMS])) {
                        for (const param of func[A_FUNC.PARAMS]) {
                            if (param?.[A_ALIAS.ALIAS]) {
                                params.push(meta.mapColumn(param[A_ALIAS.ALIAS]));
                            } else if (param?.[A_VALUE.VALUE]) {
                                params.push(param[A_VALUE.VALUE]);
                            } else if (param?.[A_FUNC.NAME]) {
                                processFunc(trx, meta, queryBuilder, param);
                            }
                        }
                        // add the function to the condition
                        if (name === FUNC.NULL) queryBuilder.whereNull(params[0]);
                        if (name === FUNC.NOT_NULL) queryBuilder.whereNotNull(params[0]);
                        else {
                            const opr = getOperation(name);
                            queryBuilder.where(params[0], opr, params[1]);
                        }
                    }
                }
            }

            // MAIN
            const operator = filter?.[A_COND.WITH];
            const items = filter?.[A_COND.ITEMS];
            if (operator && Array.isArray(items)) {
                // this is a set of other filters (conditions)
                let whereType;
                if (operator === COND.AND) whereType = 'andWhere';
                else if (operator === COND.OR) whereType = 'orWhere';
                else if (operator === COND.NOT) whereType = 'notWhere';
                // process al items with required condition
                if (whereType)
                    for (const item of items)
                        queryBuilder[whereType]((qB) => processFilter(trx, meta, qB, item));

            } else if (filter?.[A_FUNC.NAME]) {
                // this is a description of a function
                processFunc(trx, meta, queryBuilder, filter);
            }
        }

        // INSTANCE METHODS

        /**
         * Populate the Knex query with clauses from the selection object.
         * @param {TeqFw_Db_Back_RDb_ITrans} trx
         * @param {TeqFw_Db_Back_Api_RDb_Query_List} meta - the query metadata
         * @param {Knex.QueryBuilder} query
         * @param {TeqFw_Db_Shared_Dto_List_Selection.Dto} selection
         */
        this.populate = function (trx, meta, query, selection) {
            const orderBy = selection?.[A_SELECT.ORDER_BY];
            if (Array.isArray(orderBy) && orderBy.length) {
                const clauses = [];
                for (const one of orderBy) {
                    const column = meta.mapColumn(one[A_ORDER.ALIAS]);
                    const order = one[A_ORDER.DIR];
                    clauses.push({column, order});
                }
                query.orderBy(clauses);
            }
            const filter = selection?.[A_SELECT.FILTER];
            if (filter) {
                processFilter(trx, meta, query, filter);
            }
            if ((typeof selection?.rowsLimit === 'number') && (selection.rowsLimit > 0)) {
                query.limit(selection.rowsLimit);
            }
            if ((typeof selection?.rowsOffset === 'number') && (selection.rowsOffset > 0)) {
                query.offset(selection.rowsOffset);
            }
        };

        /**
         * Add 'AND' wrapper for the filter in the given selection.
         * This function is used when some query already has own filter and the filters from the given selection
         * must be added on the 'AND' basis (see this.populate).
         *
         * @param {TeqFw_Db_Shared_Dto_List_Selection.Dto} selection
         * @returns {TeqFw_Db_Shared_Dto_List_Selection.Dto}
         */
        this.wrapSelectionAnd = function (selection) {
            const res = dtoSelect.createDto(selection);
            const wrapper = dtoCond.createDto();
            wrapper.with = COND.AND;
            wrapper.items = [selection.filter];
            res.filter = wrapper;
            return res;
        };
    }
}