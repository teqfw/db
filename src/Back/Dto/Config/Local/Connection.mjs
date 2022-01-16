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
     * You can also connect via an unix domain socket, which will ignore host and port.
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

    constructor(spec) {
        const {castArrayOfStr, castInt, castString} = spec['TeqFw_Core_Shared_Util_Cast'];
        /**
         * @param {TeqFw_Db_Back_Dto_Config_Local_Connection|null} data
         * @return {TeqFw_Db_Back_Dto_Config_Local_Connection}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Dto_Config_Local_Connection();
            res.database = castString(data?.database);
            res.filename = castString(data?.filename);
            res.flags = castArrayOfStr(data?.flags);
            res.host = castString(data?.host);
            res.password = castString(data?.password);
            res.port = castInt(data?.port);
            res.socketPath = castInt(data?.socketPath);
            res.user = castString(data?.user);
            return res;
        }
    }
}
