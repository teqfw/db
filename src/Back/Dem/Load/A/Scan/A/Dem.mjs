/**
 * Load DEM data for a plugin and parse it.
 *
 * @implements TeqFw_Core_Shared_Api_Action_Async
 */
export default class TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem {
    /**
     * @param {Function|TeqFw_Core_Back_Util.readJson} readJson
     * @param {TeqFw_Db_Back_Dto_Dem.Factory} factory
     */
    constructor(
        {
            'TeqFw_Core_Back_Util.readJson': readJson,
            'TeqFw_Db_Back_Dto_Dem.Factory$': factory,
        }) {
        /**
         * Load DEM data for a plugin and parse it.
         * @param {string} filename full path name to file with DEM JSON
         * @return {Promise<TeqFw_Db_Back_Dto_Dem>}
         */
        this.exec = async function ({filename}) {
            const json = readJson(filename) ?? {};
            return factory.create(json);
        };
    }
}
