/**
 * DB connection DTO ('knex' compatible structure).
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Api_Dto_Config_Local_Connection';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Api_Dto_Config_Local_Connection {
    /** @type {string} */
    database;
    /** @type {string} */
    host;
    /** @type {string} */
    password;
    /** @type {string} */
    user;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Api_Dto_Config_Local_Connection
 */
export class Factory {
    constructor(spec) {
        const {castString} = spec['TeqFw_Core_Shared_Util_Cast'];
        /**
         * @param {TeqFw_Db_Back_Api_Dto_Config_Local_Connection|null} data
         * @return {TeqFw_Db_Back_Api_Dto_Config_Local_Connection}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Api_Dto_Config_Local_Connection();
            res.database = castString(data?.database);
            res.host = castString(data?.host);
            res.password = castString(data?.password);
            res.user = castString(data?.user);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});
