/**
 * Load all DEMs (app & plugins), merge all fragments and normalize its using map data.
 *
 * @implements TeqFw_Core_Shared_Api_IAction
 */
export default class TeqFw_Db_Back_Dem_Load {
    constructor(spec) {
        // EXTRACT DEPS
        /** @type {TeqFw_Db_Back_Dem_Load_A_Scan} */
        const scan = spec['TeqFw_Db_Back_Dem_Load_A_Scan$'];
        /** @type {TeqFw_Db_Back_Dem_Load_A_Norm} */
        const norm = spec['TeqFw_Db_Back_Dem_Load_A_Norm$'];
        /** @type {TeqFw_Db_Back_Dem_Load_A_SchemaCfg} */
        const schemaCfg = spec['TeqFw_Db_Back_Dem_Load_A_SchemaCfg$'];

        /**
         * Load all DEMs (app & plugins), merge all fragments and normalize its using map data.
         * @param {string} path
         * @return {Promise<{dem: TeqFw_Db_Back_Dto_Dem, cfg: TeqFw_Db_Back_Dto_Config_Schema}>}
         */
        this.exec = async function ({path}) {
            const {dems, map} = await scan.exec({path});
            const {dem} = await norm.exec({dems, map});
            const {cfg} = await schemaCfg.exec({map});
            return {dem, cfg};
        }
    }
}
