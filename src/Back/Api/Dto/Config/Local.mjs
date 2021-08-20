/**
 * Local configuration DTO for the plugin.
 * @see TeqFw_Core_Back_Config
 */
// MODULE'S VARS
const NS = 'TeqFw_Db_Back_Api_Dto_Config_Local';

// MODULE'S CLASSES
export default class TeqFw_Db_Back_Api_Dto_Config_Local {
    /** @type {string} */
    client;
    /** @type {TeqFw_Db_Back_Api_Dto_Config_Local_Connection} */
    connection;
}

/**
 * Factory to create new DTO instances.
 * @memberOf TeqFw_Db_Back_Api_Dto_Config_Local
 */
export class Factory {
    constructor(spec) {
        /** @type {typeof TeqFw_Db_Back_Api_Dto_Config_Local_Connection} */
        const DConn = spec['TeqFw_Db_Back_Api_Dto_Config_Local_Connection#'];
        /** @type {TeqFw_Db_Back_Api_Dto_Config_Local_Connection.Factory} */
        const fConn = spec['TeqFw_Db_Back_Api_Dto_Config_Local_Connection#Factory$'];

        /**
         * @param {TeqFw_Db_Back_Api_Dto_Config_Local|null} data
         * @return {TeqFw_Db_Back_Api_Dto_Config_Local}
         */
        this.create = function (data = null) {
            const res = new TeqFw_Db_Back_Api_Dto_Config_Local();
            res.client = data?.client;
            res.connection = (data?.connection instanceof DConn)
                ? data.connection : fConn.create(data?.connection);
            return res;
        }
    }
}

// finalize code components for this es6-module
Object.defineProperty(Factory, 'name', {value: `${NS}.${Factory.constructor.name}`});