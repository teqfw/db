// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Load
 * @description TeqFW database package module.
 */

/**
 * Load all DEMs (app & plugins), merge all fragments and normalize its using map data.
 *
 */
export default class TeqFw_Db_Back_Dem_Load {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dem_Load_A_Scan} deps.scan
     * @param {TeqFw_Db_Back_Dem_Load_A_Norm} deps.norm
     * @param {TeqFw_Db_Back_Dem_Load_A_SchemaCfg} deps.schemaCfg
     */
    constructor({scan, norm, schemaCfg}) {
        /**
         * Load all DEMs (app & plugins), merge all fragments and normalize its using map data.
         * @param {object} deps
         * @param {string} deps.path
         * @param {Object<string, string>} deps.testDems
         * @param {string} deps.testMapRoot
         * @returns {Promise<any>}
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
