/**
 * Schema configuration DTO to couple DEM with DB.
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Config_Schema';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Config_Schema {
    /**
     * Prefix for tables in RDB ('teq' => 'teq_table_name'). Default: use w/o prefix.
     * @type {string}
     */
    prefix;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Config_Schema
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {TeqFw_Core_Shared_Util_Cast} cast
     */
    constructor(
        {
            TeqFw_Core_Shared_Util_Cast$: cast,
        }
    ) {
        /**
         * @param {TeqFw_Db_Back_Dto_Config_Schema|null} data
         * @return {TeqFw_Db_Back_Dto_Config_Schema}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_Config_Schema();
            res.prefix = cast.string(data?.prefix);
            return res;
        };
    }
}
