/**
 * Load DEM fragments for all plugins (including application itself).
 */
// MODULE'S IMPORT
import {join} from 'path';

// MODULE'S VARS
const DEM = 'etc/teqfw.schema.json';
/**
 * @implements TeqFw_Core_Shared_Api_IAction
 */
export default class TeqFw_Db_Back_Act_Dem_Load_Schema {
    constructor(spec) {
        // EXTRACT DEPS
        /** @type {Function|TeqFw_Core_Back_Util.readJson} */
        const $readJson = spec['TeqFw_Core_Back_Util#readJson'];
        /** @type {Function|TeqFw_Core_Back_Util.scanNodeModules} */
        const $scanNodeModules = spec['TeqFw_Core_Back_Util#scanNodeModules'];
        /** @type {TeqFw_Core_Back_Scan_Plugin_Registry} */
        const $regPlugins = spec['TeqFw_Core_Back_Scan_Plugin_Registry$'];
        /** @type {TeqFw_Db_Back_Dto_Dem.Factory} */
        const $fDem = spec['TeqFw_Db_Back_Dto_Dem#Factory$'];

        /**
         * Load DEM mapping data for the application and parse it.
         * @param {string} path
         * @return {Promise<Object<string, TeqFw_Db_Back_Dto_Dem>>}
         */
        this.exec = async function ({path}) {
            const res = {};
            // map to get plugin name by filepath to plugin root
            const mapPath2Name = $regPlugins.getMapPath2Name();
            // parse 'schema' JSON for the root plugin
            const pathBaseDem = join(path, DEM);
            const name = mapPath2Name[path];
            const json = $readJson(pathBaseDem) ?? {};
            res[name] = $fDem.create(json);
            // parse 'schema' JSON for plugin in 'node_modules'
            const filenames = $scanNodeModules(path, DEM);
            for (const file of filenames) {
                const json = $readJson(file) ?? {};
                const dem = $fDem.create(json);
                const pathPlugin = file.replace(`/${DEM}`, '');
                const name = mapPath2Name[pathPlugin];
                res[name] = dem;
            }
            return res;
        }
    }
}
