// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dto_Config_Local_Connection
 * @description TeqFW database package module.
 */

/**
 * DB connection DTO ('knex' compatible structure).
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Config_Local_Connection';

// MODULE'S CLASSES
export default class Connection {
    /** @type {string | undefined} */
    database;
    /**
     * Used for SQLite.
     * @type {string | undefined}
     */
    filename;
    /**
     * Used for SQLite.
     * @type {Array<TeqFw_Db_StringOptional> | undefined}
     */
    flags;
    /** @type {string | undefined} */
    host;
    /** @type {string | undefined} */
    password;
    /** @type {number | undefined} */
    port;
    /**
     * You can also connect via a unix domain socket, which will ignore host and port.
     * @type {string | undefined}
     */
    socketPath;
    /** @type {string | undefined} */
    user;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Config_Local_Connection
 */
export class Factory {
    static namespace = NS;

    /**
     * @param {object} deps
     * @param {TeqFw_Db_Shared_Util_Cast} deps.cast
     */
    constructor({cast}) {
        /**
         * @param {unknown} input
         * @returns {TeqFw_Db_Back_Dto_Config_Local_Connection}
         */
        this.create = function (input = null) {
            const data = input && typeof input === 'object' && !Array.isArray(input)
                ? /** @type {TeqFw_Db_Object} */ (input) : null;
            const res = new Connection();
            res.database = cast.string(data?.database);
            res.filename = cast.string(data?.filename);
            res.flags = cast.arrayOfStr(data?.flags);
            res.host = cast.string(data?.host);
            res.password = cast.string(data?.password);
            res.port = cast.int(data?.port);
            res.socketPath = cast.string(data?.socketPath);
            res.user = cast.string(data?.user);
            return res;
        };
    }
}

export const __deps__ = Object.freeze({
    Factory: Object.freeze({
            cast: 'TeqFw_Db_Shared_Util_Cast$',
    }),
});
