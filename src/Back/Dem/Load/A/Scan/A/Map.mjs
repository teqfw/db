/**
 * Load DEM mapping data for the application.
 * There is one only map file per application (in root plugin).
 *
 * @implements TeqFw_Core_Shared_Api_Action_Async
 */
export default class TeqFw_Db_Back_Dem_Load_A_Scan_A_Map {
    /**
     * @param {Function|TeqFw_Core_Back_Util.readJson} readJson
     * @param {TeqFw_Db_Back_Dto_Map.Factory} factory
     */
    constructor(
        {
            'TeqFw_Core_Back_Util.readJson': readJson,
            'TeqFw_Db_Back_Dto_Map.Factory$': factory,
        }) {
        /**
         * Load DEM mapping data for the application and parse it.
         * @param {string|null} filename full path name to file with MAP JSON
         * @returns {Promise<TeqFw_Db_Back_Dto_Map>}
         */
        this.exec = async function ({filename}) {
            const json = readJson(filename) ?? {};
            return factory.create(json);
        };
    }
}
