// @ts-check

/**
 * @namespace TeqFw_Db_Back_Util_ListQuery
 * @description TeqFW database package module.
 */

export default class ListQuery {
    /**
     * Initialize the component.
     */
    constructor() {
        /**
         * Convert the query columns into the tables' fields to group by.
         * @param {TeqFw_Db_StringMap} columns
         * @param {TeqFw_Db_StringMap} map
         * @returns {any}
         */
        this.prepareGroupBy = function(columns, map) {
            const res = [];
            for (const key of Object.values(columns))
                if (map.hasOwnProperty(key))
                    res.push(map[key]);
            return res;
        };

        /**
         * Convert the query columns into the tables' fields to select.
         * @param {TeqFw_Db_StringMap} columns
         * @param {TeqFw_Db_StringMap} map
         * @returns {any}
         */
        this.prepareSelect = function(columns, map) {
            const res = [];
            for (const key of Object.values(columns)) {
                if (map.hasOwnProperty(key)) {
                    /** @type {TeqFw_Db_StringMap} */
                    const obj = {};
                    obj[key] = map[key];
                    res.push(obj);
                }
            }
            return res;
        };
    }
}
