/**
 * Utilities related to listings processing.
 *
 * @namespace TeqFw_Db_Shared_Util_List
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Shared_Util_List';

// MODULE'S FUNCTIONS

/**
 * Extract Knex compatible data for RDB data ordering.
 * @param {TeqFw_Db_Shared_Dto_List_Selection.Dto} selection
 * @return {[{column: string, order: string}]}
 * @memberOf TeqFw_Db_Shared_Util_List
 */
function getOrderFromSelection(selection) {
    const res = [];
    const orderBy = selection?.orderBy;
    if (Array.isArray(orderBy) && orderBy.length > 0)
        for (const dto of orderBy)
            res.push({column: dto.alias, order: dto.dir});
    return res;
}

// finalize code components for this es6-module
Object.defineProperty(getOrderFromSelection, 'namespace', {value: NS});

export {
    getOrderFromSelection,
};
