/**
 * Utility class for creating selection objects from data sets.
 */
export default class TeqFw_Db_Shared_Util_Select {
    /* eslint-disable jsdoc/require-param-description */
    /**
     * @param {TeqFw_Db_Shared_Dto_List_Selection} dtoSelect
     */
    constructor(
        {
            TeqFw_Db_Shared_Dto_List_Selection$: dtoSelect,
        }
    ) {
        // VARS
        const COND = dtoSelect.getConditions();
        const DIR = dtoSelect.getDirections();
        const FUNC = dtoSelect.getFunctions();

        // MAIN
        /* eslint-enable jsdoc/require-param-description */
        /**
         * Creates a simple selection object from given parameters.
         * @param {object} params - Parameters object.
         * @param {{[key: string]: string|number|boolean}} [params.conditions] - Column-value pairs for filtering results.
         * @param {{[key: string]: 'asc'|'desc'}} [params.sorting] - Sorting options where keys are column names, and values are 'asc' or 'desc'.
         * @param {{limit: number, offset: number}} [params.pagination] - Pagination options specifying the limit and offset for the query.
         * @returns {TeqFw_Db_Shared_Dto_List_Selection.Dto}
         */
        this.compose = function ({conditions = {}, sorting = {}, pagination = {}} = {}) {
            const result = dtoSelect.create();

            // Compose filter if there are any conditions
            if (Object.keys(conditions).length > 0) {
                result.filter = {
                    with: COND.AND,
                    items: Object.entries(conditions).map(([alias, value]) => ({
                        name: FUNC.EQ,
                        params: [{alias}, {value},
                        ],
                    })),
                };
            }

            // Compose sorting
            if (Object.keys(sorting).length > 0) {
                result.orderBy = Object.entries(sorting).map(([alias, dir]) => ({alias, dir}));
            }

            // Compose pagination
            if (typeof pagination.limit === 'number') result.rowsLimit = pagination.limit;
            if (typeof pagination.offset === 'number') result.rowsOffset = pagination.offset;

            return dtoSelect.create(result);
        };

        /**
         * Returns available filter conditions (e.g., AND, OR).
         * @returns {typeof TeqFw_Db_Shared_Enum_Filter_Cond}
         */
        this.getConditions = () => COND;

        /**
         * Returns available sorting directions (ASC, DESC).
         * @returns {typeof TeqFw_Db_Shared_Enum_Direction}
         */
        this.getDirections = () => DIR;

        /**
         * Returns available filter functions (e.g., EQ, NE, GT).
         * @returns {typeof TeqFw_Db_Shared_Enum_Filter_Func}
         */
        this.getFunctions = () => FUNC;

    }
}
