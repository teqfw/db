/**
 * Load DEM fragments for all plugins (including application itself).
 */
// MODULE'S IMPORT
import {join, sep} from 'path';

// MODULE'S VARS
const DEM = `etc${sep}teqfw.schema.json`;
const MAP = `etc${sep}teqfw.schema.map.json`;
/**
 * @implements TeqFw_Core_Shared_Api_Action_Async
 */
export default class TeqFw_Db_Back_Dem_Load_A_Scan {
    /**
     * @param {Function|TeqFw_Core_Back_Util.scanNodeModules} _scanNodeModules
     * @param {TeqFw_Core_Back_Api_Plugin_Registry} _regPlugins
     * @param {TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem} _loadDem
     * @param {TeqFw_Db_Back_Dem_Load_A_Scan_A_Map} _loadMap
     */
    constructor(
        {
            'TeqFw_Core_Back_Util.scanNodeModules': _scanNodeModules,
            TeqFw_Core_Back_Api_Plugin_Registry$: _regPlugins,
            TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem$: _loadDem,
            TeqFw_Db_Back_Dem_Load_A_Scan_A_Map$: _loadMap,
        }
    ) {

        /**
         * Load DEM mapping data for the application and parse it.
         * @param {string} path
         * @param {Object<string, string>} testDems
         * @return {Promise<{dems: Object<string, TeqFw_Db_Back_Dto_Dem>, map: TeqFw_Db_Back_Dto_Map}>}
         */
        this.exec = async function ({path, testDems}) {
            const dems = {};
            // map to get plugin name by filepath to plugin root
            const mapPath2Name = _regPlugins.getMapPath2Name();
            // parse 'schema' JSON for the root plugin
            const pathBaseDem = join(path, DEM);
            const name = mapPath2Name[path];
            dems[name] = await _loadDem.exec({filename: pathBaseDem});
            // parse 'schema' JSON for plugin in 'node_modules'
            /** @type {string[]} */
            const filenames = _scanNodeModules(path, DEM);
            // add schema from test if available
            if (typeof testDems === 'object') {
                for (const key of Object.keys(testDems)) {
                    const path = testDems[key];
                    mapPath2Name[path] = key;
                    filenames.push(join(path, DEM));
                }
            }
            // load DEMs
            for (const filename of filenames) {
                const pathPlugin = filename.replace(`${sep}${DEM}`, '');
                const name = mapPath2Name[pathPlugin];
                dems[name] = await _loadDem.exec({filename});
            }
            // load map file
            const pathMap = join(path, MAP);
            const map = await _loadMap.exec({filename: pathMap});
            return {dems, map};
        };
    }
}
