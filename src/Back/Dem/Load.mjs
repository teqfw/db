// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Load
 * @description TeqFW database package module.
 */

/**
 * Load trusted DEM v2 sources and compile the canonical target.
 *
 */
export default class TeqFw_Db_Back_Dem_Load {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dem_Load_A_Scan} deps.scan
     * @param {TeqFw_Db_Back_Dem_Compile} deps.compile
     */
    constructor({scan, compile}) {
        /**
         * Compile trusted DEM v2 sources.
         * @param {object} deps
         * @param {string} deps.path Application root containing `etc/teqfw.schema.map.json`.
         * @param {Object<string, string>} [deps.testDems] Test-only additional DEM roots.
         * @param {string} [deps.testMapRoot] Test-only map root override.
         * @param {TeqFw_Db_Back_Api_RDb_Dialect} deps.adapter
         * @returns {Promise<any>}
         */
        this.exec = async function ({path, testDems, testMapRoot, adapter}) {
            const {fragments, mapEnvelope} = await scan.exec({path, testDems, testMapRoot});
            return {compilation: await compile.exec({adapter, fragments, mapEnvelope})};
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            scan: 'TeqFw_Db_Back_Dem_Load_A_Scan$',
            compile: 'TeqFw_Db_Back_Dem_Compile$',
    }),
});
