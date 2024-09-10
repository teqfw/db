/**
 * DB connection DTO ('knex' compatible structure).
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Dto_Config_Local_Connection';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Dto_Config_Local_Connection {
    /** @type {string} */
    database;
    /**
     * Used for SQLite.
     * @type {string}
     */
    filename;
    /**
     * Used for SQLite.
     * @type {string[]}
     */
    flags;
    /** @type {string} */
    host;
    /** @type {string} */
    password;
    /** @type {number} */
    port;
    /**
     * You can also connect via a unix domain socket, which will ignore host and port.
     * @type {string}
     */
    socketPath;
    /** @type {string} */
    user;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Dto_Config_Local_Connection
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
         * @param {TeqFw_Db_Back_Dto_Config_Local_Connection|null} data
         * @return {TeqFw_Db_Back_Dto_Config_Local_Connection}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_Config_Local_Connection();
            res.database = cast.string(data?.database);
            res.filename = cast.string(data?.filename);
            res.flags = cast.arrayOfStr(data?.flags);
            res.host = cast.string(data?.host);
            res.password = cast.string(data?.password);
            res.port = cast.int(data?.port);
            res.socketPath = cast.int(data?.socketPath);
            res.user = cast.string(data?.user);
            return res;
        };
    }
}
