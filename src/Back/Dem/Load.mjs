// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Load
 * @description TeqFW database package module.
 */

/**
 * Load all DEMs (app & plugins), merge all fragments and normalize its using map data.
 *
 * @implements TeqFw_Core_Shared_Api_Action_Async
 */
export default class TeqFw_Db_Back_Dem_Load {
    /**
     * @param {TeqFw_Db_Back_Dem_Load_A_Scan} scan
     * @param {TeqFw_Db_Back_Dem_Load_A_Norm} norm
     * @param {TeqFw_Db_Back_Dem_Load_A_SchemaCfg} schemaCfg
     */
    constructor({scan, norm, schemaCfg}) {
        /**
         * Load all DEMs (app & plugins), merge all fragments and normalize its using map data.
         * @param {string} path
         * @param {Object<string, string>} [testDems]
         * @param {string} [testMapRoot]
         * @return {Promise<{dem: TeqFw_Db_Back_Dto_Dem, cfg: TeqFw_Db_Back_Dto_Config_Schema}>}
         */
        this.exec = async function ({path, testDems, testMapRoot}) {
            const {dems, map} = await scan.exec({path, testDems, testMapRoot});
            const {dem} = await norm.exec({dems, map});
            const {cfg} = await schemaCfg.exec({map});
            return {dem, cfg};
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            scan: 'TeqFw_Db_Back_Dem_Load_A_Scan$',
            norm: 'TeqFw_Db_Back_Dem_Load_A_Norm$',
            schemaCfg: 'TeqFw_Db_Back_Dem_Load_A_SchemaCfg$',
    }),
});
