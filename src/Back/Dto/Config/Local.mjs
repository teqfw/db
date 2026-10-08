// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Config_Local
 * @description TeqFW database package module.
 */

/**
 * Local configuration DTO for the plugin.
 * @see TeqFw_Db_Back_Config
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Config_Local';

// MODULE'S CLASSES
export default class Local {
    /** @type {string | undefined} */
    client;
    /** @type {TeqFw_Db_Back_Dto_Config_Local_Connection | undefined} */
    connection;
    /**
     * PostgreSQL client allows you to set the initial search path for each connection automatically.
     * @type {Array<TeqFw_Db_StringOptional> | undefined}
     */
    searchPath;
    /**
     * SQLite: replace undefined keys with NULL instead of DEFAULT.
     *
     * @type {boolean | undefined}
     */
    useNullAsDefault;
    /**
     * When you use the PostgreSQL adapter to connect a non-standard database.
     * @type {string | undefined}
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
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Cast} deps.cast
     * @param {TeqFw_Db_Back_Dto_Config_Local_Connection__Factory} deps.fConn
     */
    constructor({cast, fConn}) {
        /**
         * @param {unknown} input
         * @returns {TeqFw_Db_Back_Dto_Config_Local}
         */
        this.create = function (input = null) {
            const data = input && typeof input === 'object' && !Array.isArray(input)
                ? /** @type {TeqFw_Db_Object} */ (input) : null;
            const res = new Local();
            res.client = cast.string(data?.client);
            res.connection = fConn.create(data?.connection);
            res.searchPath = cast.arrayOfStr(data?.searchPath);
            res.useNullAsDefault = cast.boolean(data?.useNullAsDefault);
            res.version = cast.string(data?.version);
            return res;
        };
    }
}

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
            fConn: 'TeqFw_Db_Back_Dto_Config_Local_Connection__Factory$',
    }),
});
