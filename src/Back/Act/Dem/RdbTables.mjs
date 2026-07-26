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
     * @param {TeqFw_Db_Back_Config} deps.config
     * @param {TeqFw_Db_Back_Api_RDb_Schema} deps.dbSchema
     * @param {TeqFw_Db_Back_Dem_Load} deps.demLoad
     */
    constructor({config, dbSchema, demLoad}) {
        /**
         * @returns {Promise<any>}
         */
        this.run = async function ({} = {}) {
            const path = config.getPathToRoot();
            const {dem, cfg} = await demLoad.exec({path});
            await dbSchema.setDem({dem});
            await dbSchema.setCfg({cfg});
            const tables = await dbSchema.fetchTablesByDependencyOrder();
            return {tables};
        };
    }

}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            config: 'TeqFw_Db_Back_Config$',
            dbSchema: 'TeqFw_Db_Back_RDb_Schema$',
            demLoad: 'TeqFw_Db_Back_Dem_Load$',
    }),
});
