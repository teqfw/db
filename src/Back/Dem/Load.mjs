// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Load
 * @description TeqFW database package module.
 */

/**
 * Load trusted DEM v1 sources, compile the canonical target, and derive its read-only legacy facade.
 *
 */
export default class TeqFw_Db_Back_Dem_Load {
    /**
     * @param {object} deps
     * @param {TeqFw_Db_Back_Dem_Load_A_Scan} deps.scan
     * @param {TeqFw_Db_Back_Dem_Compile} deps.compile
     * @param {TeqFw_Db_Back_Dem_Compile_A_LegacyFacade} deps.legacyFacade
     */
    constructor({scan, compile, legacyFacade}) {
        /**
         * Compile trusted DEM sources and derive a read-only compatibility view for unversioned v1 input.
         * @param {object} deps
         * @param {string} deps.path
         * @param {Object<string, string>} deps.testDems
         * @param {string} deps.testMapRoot
         * @param {TeqFw_Db_Back_Api_RDb_Dialect} deps.adapter
         * @returns {Promise<any>}
         */
        this.exec = async function ({path, testDems, testMapRoot, adapter}) {
            const {fragments, mapEnvelope} = await scan.exec({path, testDems, testMapRoot});
            const compilation = await compile.exec({adapter, fragments, mapEnvelope});
            const legacy = fragments.every((item) => item.declaration?.version === undefined)
                ? legacyFacade.exec({compilation}) : {};
            return {...legacy, compilation};
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            scan: 'TeqFw_Db_Back_Dem_Load_A_Scan$',
            compile: 'TeqFw_Db_Back_Dem_Compile$',
            legacyFacade: 'TeqFw_Db_Back_Dem_Compile_A_LegacyFacade$',
    }),
});
