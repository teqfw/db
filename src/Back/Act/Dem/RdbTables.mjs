// @ts-check

/**
 * @namespace TeqFw_Db_Back_Act_Dem_RdbTables
 * @description TeqFW database package module.
 */

/**
 * Read the DEM and retrieve a list of all tables in the RDB organized by their dependency order.
 *
 */
export default class TeqFw_Db_Back_Act_Dem_RdbTables {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_RDb_IConnect} deps.conn
     * @param {TeqFw_Db_Back_Config} deps.config
     * @param {TeqFw_Db_Back_Api_RDb_Schema} deps.dbSchema
     * @param {TeqFw_Db_Back_Dem_Load} deps.demLoad
     */
    constructor({conn, config, dbSchema, demLoad}) {
        /**
         * @returns {Promise<any>}
         */
        this.run = async function ({} = {}) {
            const path = config.getPathToRoot();
            const adapter = conn.getDialectAdapter();
            const {compilation} = await demLoad.exec({path, adapter});
            dbSchema.setCompilation({compilation});
            const tables = await dbSchema.fetchTablesByDependencyOrder();
            return {tables};
        };
    }

}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            conn: 'TeqFw_Db_Back_RDb_Connect$',
            config: 'TeqFw_Db_Back_Config$',
            dbSchema: 'TeqFw_Db_Back_RDb_Schema$',
            demLoad: 'TeqFw_Db_Back_Dem_Load$',
    }),
});
