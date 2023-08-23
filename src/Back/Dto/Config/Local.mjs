/**
 * Local configuration DTO for the plugin.
 * @see TeqFw_Core_Back_Config
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Config_Local';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Config_Local {
    /** @type {string} */
    client;
    /** @type {TeqFw_Db_Back_Dto_Config_Local_Connection} */
    connection;
    /**
     * PostgreSQL client allows you to set the initial search path for each connection automatically.
     * @type {string[]}
     */
    searchPath;
    /**
     * SQLite: replace undefined keys with NULL instead of DEFAULT.
     *
     * @type {boolean}
     */
    useNullAsDefault;
    /**
     * When you use the PostgreSQL adapter to connect a non-standard database.
     * @type {string}
     */
    version;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Config_Local
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {TeqFw_Core_Shared_Util_Cast.castArrayOfStr|function} castArrayOfStr
     * @param {TeqFw_Core_Shared_Util_Cast.castBoolean|function} castBoolean
     * @param {TeqFw_Core_Shared_Util_Cast.castString|function} castString
     * @param {TeqFw_Db_Back_Dto_Config_Local_Connection.Factory} fConn
     */
    constructor(
        {
            'TeqFw_Core_Shared_Util_Cast.castArrayOfStr': castArrayOfStr,
            'TeqFw_Core_Shared_Util_Cast.castBoolean': castBoolean,
            'TeqFw_Core_Shared_Util_Cast.castString': castString,
            'TeqFw_Db_Back_Dto_Config_Local_Connection.Factory$': fConn,
        }
    ) {
        /**
         * @param {TeqFw_Db_Back_Dto_Config_Local|null} data
         * @return {TeqFw_Db_Back_Dto_Config_Local}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_Config_Local();
            res.client = castString(data?.client);
            res.connection = fConn.create(data?.connection);
            res.searchPath = castArrayOfStr(data?.searchPath);
            res.useNullAsDefault = castBoolean(data?.useNullAsDefault);
            res.version = castString(data?.version);
            return res;
        }
    }
}
