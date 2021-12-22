/**
 * Load DEM data for a plugin and parse it.
 *
 * @implements TeqFw_Core_Shared_Api_Async_IAction
 */
export default class TeqFw_Db_Back_Dem_Load_A_Scan_A_Dem {
    constructor(spec) {
        // EXTRACT DEPS
        /** @type {Function|TeqFw_Core_Back_Util.readJson} */
        const readJson = spec['TeqFw_Core_Back_Util#readJson'];
        /** @type {TeqFw_Db_Back_Dto_Dem.Factory} */
        const factory = spec['TeqFw_Db_Back_Dto_Dem#Factory$'];

        /**
         * Load DEM data for a plugin and parse it.
         * @param {string} filename full path name to file with DEM JSON
         * @return {Promise<TeqFw_Db_Back_Dto_Dem>}
         */
        this.exec = async function ({filename}) {
            const json = readJson(filename) ?? {};
            return factory.create(json);
        }
    }
}
