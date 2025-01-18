export default class TeqFw_Db_Back_Util_ListQuery {
    /**
     * Convert the query columns into the tables' fields to group by.
     * @param {Object<string, string>} columns - the list of the columns in the query.
     * @param {Object<string, string>} map - the map of the columns to the tables' fields.
     * @return {Object<string, string>[]}
     */
    prepareGroupBy(columns, map) {
        const res = [];
        for (const key of Object.values(columns))
            if (map.hasOwnProperty(key))
                res.push(map[key]);
        return res;
    }

    /**
     * Convert the query columns into the tables' fields to select.
     * @param {Object<string, string>} columns
     * @param {Object<string, string>} map - the map of the columns to the tables' fields and expressions.
     * @return {Object<string, string>[]}
     */
    prepareSelect(columns, map) {
        const res = [];
        for (const key of Object.values(columns)) {
            if (map.hasOwnProperty(key)) {
                const obj = {};
                obj[key] = map[key];
                res.push(obj);
            }
        }
        return res;
    }

}
