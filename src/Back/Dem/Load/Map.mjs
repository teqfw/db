/**
 * Load DEM mapping data for the application.
 * There is one only map file per application (in root plugin).
 */
// MODULE'S IMPORT
import {join} from 'path';

// MODULE'S VARS
const MAP = 'etc/teqfw.schema.map.json';
/**
 * @implements TeqFw_Core_Shared_Api_IAction
 */
export default class TeqFw_Db_Back_Dem_Load_Map {
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
         * @return {Promise<TeqFw_Db_Back_Dto_Map>}
         */
        this.exec = async function ({path, filename}) {
            const fullPath = (filename) ? join(path, filename) : join(path, MAP);
            const json = $readJson(fullPath) ?? {};
            return $fMap.create(json);
        }
    }
}
