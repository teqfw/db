// @ts-check

/**
 * @namespace TeqFw_Db_Back_Util_ListQuery
 * @description TeqFW database package module.
 */

export default class TeqFw_Db_Back_Util_ListQuery {
    /**
     * Initialize the component.
     */
    constructor() {
        /**
         * Convert the query columns into the tables' fields to group by.
         * @param {Object<string, string>} columns
         * @param {Object<string, string>} map
         * @returns {Object<string, string>[]}
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
         * @param {Object<string, string>} columns
         * @param {Object<string, string>} map
         * @returns {Object<string, string>[]}
         */
        this.prepareSelect = function(columns, map) {
            const res = [];
            for (const key of Object.values(columns)) {
                if (map.hasOwnProperty(key)) {
                    const obj = {};
                    obj[key] = map[key];
                    res.push(obj);
                }
            }
            return res;
        };
    }
}
