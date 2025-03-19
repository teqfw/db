/**
 * Read the DEM and retrieve a list of all tables in the RDB organized by their dependency order.
 *
 * @implements TeqFw_Core_Shared_Api_Action
 */
export default class TeqFw_Db_Back_Act_Dem_RdbTables {
    /**
     * @param {TeqFw_Core_Back_Config} config
     * @param {TeqFw_Db_Back_Api_RDb_Schema} dbSchema
     * @param {TeqFw_Db_Back_Dem_Load} demLoad
     */
    constructor(
        {
            TeqFw_Core_Back_Config$: config,
            TeqFw_Db_Back_Api_RDb_Schema$: dbSchema,
            TeqFw_Db_Back_Dem_Load$: demLoad,
        }
    ) {
        /**
         * @returns {Promise<{tables: TeqFw_Db_Back_Dto_RDb_Table[]}>}
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