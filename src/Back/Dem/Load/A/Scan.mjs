// @ts-check

/**
 * @namespace TeqFw_Db_Back_Dem_Load_A_Scan
 * @description TeqFW database package module.
 */

/**
 * Load DEM fragments for all plugins (including application itself).
 */

/**
 * @implements TeqFw_Core_Shared_Api_Action_Async
 */
export default class TeqFw_Db_Back_Dem_Load_A_Scan {
    /**
     * @param {TeqFw_Db_Back_Util_File} file
     * @param {object} pathUtil
     * @param {TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem} _loadDem
     * @param {TeqFw_Db_Back_Dem_Load_A_Scan_A_Map} _loadMap
     */
    constructor({file, pathUtil, _loadDem, _loadMap}) {

        /**
         * Load DEM mapping data for the application and parse it.
         * @param {string} path
         * @param {Object<string, string>} testDems
         * @param {string} testMapRoot
         * @return {Promise<{dems: Object<string, TeqFw_Db_Back_Dto_Dem>, map: TeqFw_Db_Back_Dto_Map}>}
         */
        this.exec = async function ({path, testDems, testMapRoot}) {
            const DEM = pathUtil.join("etc", "teqfw.schema.json");
            const MAP = pathUtil.join("etc", "teqfw.schema.map.json");
            const dems = {};
            // parse 'schema' JSON for the root plugin
            const pathBaseDem = pathUtil.join(path, DEM);
            const name = file.readPackageName(path);
            dems[name] = await _loadDem.exec({filename: pathBaseDem});
            // parse 'schema' JSON for plugin in 'node_modules'
            /** @type {string[]} */
            const filenames = file.scanNodeModules(path, DEM);
            // add schema from test if available
            if (typeof testDems === 'object') {
                for (const key of Object.keys(testDems)) {
                    const testPath = testDems[key];
                    filenames.push(pathUtil.join(testPath, DEM));
                }
            }
            // load DEMs
            for (const filename of filenames) {
                const pathPlugin = filename.slice(0, -(pathUtil.sep + DEM).length);
                const testName = Object.entries(testDems ?? {}).find(([, testPath]) => testPath === pathPlugin)?.[0];
                const name = testName ?? file.readPackageName(pathPlugin);
                dems[name] = await _loadDem.exec({filename});
            }
            // load map file
            const pathMap = pathUtil.join(testMapRoot ?? path, MAP);
            const map = await _loadMap.exec({filename: pathMap});
            return {dems, map};
        };
    }
}

export const __deps__ = Object.freeze({
    default: Object.freeze({
            file: "TeqFw_Db_Back_Util_File$",
            pathUtil: "node:path",
            _loadDem: 'TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem$',
            _loadMap: 'TeqFw_Db_Back_Dem_Load_A_Scan_A_Map$',
    }),
});
