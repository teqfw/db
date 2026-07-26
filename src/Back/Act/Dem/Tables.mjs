// @ts-check

/**
 * @namespace TeqFw_Db_Back_Act_Dem_Tables
 * @description TeqFW database package module.
 */

/**
 * Read the DEM and retrieve a list of all tables in the RDB organized by their dependency order.
 *
 */
export default class TeqFw_Db_Back_Act_Dem_Tables {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Config} deps.config
     * @param {TeqFw_Db_Back_Api_RDb_Schema} deps.dbSchema
     * @param {TeqFw_Db_Back_Dem_Load} deps.demLoad
     */
    constructor({config, dbSchema, demLoad}) {
        // VARS

        // MAINdi
        /**
         * @returns {Promise<string[]>}
         */
        this.act = async function ({} = {}) {
            const path = config.getPathToRoot();
            const {dem, cfg} = await demLoad.exec({path});
            await dbSchema.setDem({dem});
            await dbSchema.setCfg({cfg});
            return await dbSchema.getTablesList();
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
