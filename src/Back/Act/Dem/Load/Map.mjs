/**
 * Load DEM mapping data for the application.
 */
// MODULE'S IMPORT
import {join} from 'path';

// MODULE'S VARS
const MAP = 'etc/teqfw.schema.map.json';
/**
 * @implements TeqFw_Core_Shared_Api_IAction
 */
export default class TeqFw_Db_Back_Act_Dem_Load_Map {
    constructor(spec) {
        // EXTRACT DEPS
        /** @type {Function|TeqFw_Core_Back_Util.readJson} */
        const $readJson = spec['TeqFw_Core_Back_Util#readJson'];
        /** @type {TeqFw_Db_Back_Dto_Map.Factory} */
        const $fMap = spec['TeqFw_Db_Back_Dto_Map#Factory$'];

        /**
         * Load DEM mapping data for the application and parse it.
         * @param {string} path path to the project root folder
         * @param {string|null} filename filename relative to project root
         * @return {Promise<Object<string, Object<string, TeqFw_Db_Back_Dto_Map>>>}
         */
        this.exec = async function ({path, filename}) {
            const res = {};
            const fullPath = (filename) ? join(path, filename) : join(path, MAP);
            const json = $readJson(fullPath) ?? {};
            if (typeof json === 'object') {
                for (const pluginName of Object.keys(json)) {
                    const pluginData = json[pluginName];
                    if (typeof pluginData === 'object') {
                        res[pluginName] = {};
                        for (const alias of Object.keys(pluginData)) {
                            const data = pluginData[alias];
                            const item = $fMap.create(data);
                            item.alias = alias;
                            res[pluginName][alias] = item;
                        }
                    }
                }
            }
            return res;
        }
    }
}
