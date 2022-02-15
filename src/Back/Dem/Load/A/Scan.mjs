/**
 * Load DEM fragments for all plugins (including application itself).
 */
// MODULE'S IMPORT
import {join} from 'path';

// MODULE'S VARS
const DEM = 'etc/teqfw.schema.json';
const MAP = 'etc/teqfw.schema.map.json';
/**
 * @implements TeqFw_Core_Shared_Api_Action_IAsync
 */
export default class TeqFw_Db_Back_Dem_Load_A_Scan {
    constructor(spec) {
        // DEPS
        /** @type {Function|TeqFw_Core_Back_Util.scanNodeModules} */
        const _scanNodeModules = spec['TeqFw_Core_Back_Util#scanNodeModules'];
        /** @type {TeqFw_Core_Back_App_Init_Plugin_Registry} */
        const _regPlugins = spec['TeqFw_Core_Back_App_Init_Plugin_Registry$'];
        /** @type {TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem} */
        const _loadDem = spec['TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem$'];
        /** @type {TeqFw_Db_Back_Dem_Load_A_Scan_A_Map} */
        const _loadMap = spec['TeqFw_Db_Back_Dem_Load_A_Scan_A_Map$'];

        /**
         * Load DEM mapping data for the application and parse it.
         * @param {string} path
         * @return {Promise<{dems: Object<string, TeqFw_Db_Back_Dto_Dem>, map: TeqFw_Db_Back_Dto_Map}>}
         */
        this.exec = async function ({path}) {
            const dems = {};
            // map to get plugin name by filepath to plugin root
            const mapPath2Name = _regPlugins.getMapPath2Name();
            // parse 'schema' JSON for the root plugin
            const pathBaseDem = join(path, DEM);
            const name = mapPath2Name[path];
            dems[name] = await _loadDem.exec({filename: pathBaseDem});
            // parse 'schema' JSON for plugin in 'node_modules'
            const filenames = _scanNodeModules(path, DEM);
            for (const filename of filenames) {
                const pathPlugin = filename.replace(`/${DEM}`, '');
                const name = mapPath2Name[pathPlugin];
                dems[name] = await _loadDem.exec({filename});
            }
            // load map file
            const pathMap = join(path, MAP);
            const map = await _loadMap.exec({filename: pathMap});
            return {dems, map};
        }
    }
}
