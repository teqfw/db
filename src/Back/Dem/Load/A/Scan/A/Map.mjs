/**
 * Load DEM mapping data for the application.
 * There is one only map file per application (in root plugin).
 *
 * @implements TeqFw_Core_Shared_Api_Action_Async
 */
export default class TeqFw_Db_Back_Dem_Load_A_Scan_A_Map {
    constructor(spec) {
        // DEPS
        /** @type {Function|TeqFw_Core_Back_Util.readJson} */
        const readJson = spec['TeqFw_Core_Back_Util#readJson'];
        /** @type {TeqFw_Db_Back_Dto_Map.Factory} */
        const factory = spec['TeqFw_Db_Back_Dto_Map.Factory$'];

        /**
         * Load DEM mapping data for the application and parse it.
         * @param {string|null} filename full path name to file with MAP JSON
         * @return {Promise<TeqFw_Db_Back_Dto_Map>}
         */
        this.exec = async function ({filename}) {
            const json = readJson(filename) ?? {};
            return factory.create(json);
        }
    }
}
